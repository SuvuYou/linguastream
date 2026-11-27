import type { ProcessingStep } from "@linguastream/contracts";
import { Logger } from "@nestjs/common";
import { gunzipSync } from "node:zlib";
import type { SpendLimiter } from "../../usage/spend-limiter";
import { analyseLines } from "../analyse/analyse";
import type { Analyser } from "../analyse/nlp-client";
import type { VerbLexicon } from "../normalise/join-rule";
import { normalise } from "../normalise/normalise";
import type { Punctuator } from "../normalise/punctuate";
import type { ProcessingRepository } from "../processing.repository";
import { translateLines, type Translator } from "../translate/translate";
import { parseJson3 } from "./parse-json3";

export interface StepContext {
  trackId: string;
  repository: ProcessingRepository;
  spend: Pick<SpendLimiter, "canSpend" | "record">;
}

export type StepHandler = (context: StepContext) => Promise<void>;

export interface StepDeps {
  punctuate: Punctuator;
  lexicon: VerbLexicon | null;
  analyse: Analyser;
  translate: Translator;
}

const logger = new Logger("Translation");

const baseLanguage = (code: string) => code.toLowerCase().split("-")[0];

function dollars(microUsd: number) {
  return `$${(microUsd / 1_000_000).toFixed(4)}`;
}

async function rawText(context: StepContext): Promise<string> {
  return gunzipSync(await context.repository.rawJson3(context.trackId)).toString("utf8");
}

export function createStepHandlers(deps: StepDeps): Partial<Record<ProcessingStep, StepHandler>> {
  return {
    parse: async (context) => {
      await context.repository.replaceLines(context.trackId, parseJson3(await rawText(context)));
    },
    normalise: async (context) => {
      const { lines, normalisation } = await normalise(await rawText(context), {
        punctuate: deps.punctuate,
        canSpend: () => context.spend.canSpend(),
        lexicon: deps.lexicon,
      });
      await context.repository.saveNormalisation(context.trackId, lines, normalisation);
    },
    analyse: async (context) => {
      const lines = await context.repository.lineWords(context.trackId);
      await context.repository.saveAnalysis(context.trackId, await analyseLines(lines, deps.analyse));
    },
    translate: async (context) => {
      const target = await context.repository.translationTarget(context.trackId);
      if (!target || baseLanguage(target.targetLanguage) === baseLanguage(target.sourceLanguage)) return;
      const translationId = await context.repository.startTranslation(context.trackId, target.targetLanguage);
      const lines = await context.repository.translationLines(context.trackId, translationId);
      const report = await translateLines(lines, {
        translate: deps.translate,
        canSpend: () => context.spend.canSpend(),
        save: (done) => context.repository.saveLineTranslations(translationId, done),
        sourceLanguage: target.sourceLanguage,
        targetLanguage: target.targetLanguage,
      });
      await context.repository.finishTranslation(translationId, report);
      logger.log(
        `Track ${context.trackId} → ${target.targetLanguage}: ${report.status}${report.errorCode ? ` (${report.errorCode})` : ""}, ` +
          `${report.translatedLines}/${lines.length} lines, ${report.chunks} chunks, ${report.calls} calls, ${dollars(report.costMicroUsd)}`,
      );
    },
  };
}

import type { ProcessingStep, TranslationErrorCode } from "@linguastream/contracts";
import { Logger } from "@nestjs/common";
import { gunzipSync } from "node:zlib";
import type { SpendLimiter } from "../../usage/spend-limiter";
import { analyseLines } from "../analyse/analyse";
import type { Analyser } from "../analyse/nlp-client";
import type { VerbLexicon } from "../normalise/join-rule";
import { normalise } from "../normalise/normalise";
import type { Punctuator } from "../normalise/punctuate";
import type { ProcessingRepository } from "../processing.repository";
import type { WordPackService } from "../../dictionary/word-pack.service";
import { countLemmas } from "../index/lemma-counts";
import { describeError } from "../processing-error";
import { translateLines, type Translator } from "../translate/translate";
import { parseJson3 } from "./parse-json3";

export interface StepReporter {
  progress(done: number, total: number): Promise<void>;
  translationFailed(code: TranslationErrorCode): Promise<void>;
}

export interface StepContext {
  trackId: string;
  repository: ProcessingRepository;
  spend: Pick<SpendLimiter, "canSpend" | "record">;
  report?: StepReporter;
}

export type StepHandler = (context: StepContext) => Promise<void>;

export interface StepDeps {
  punctuate: Punctuator;
  lexicon: VerbLexicon | null;
  analyse: Analyser;
  translate: Translator;
  retryDelayMs?: number;
  words?: Pick<WordPackService, "prepare">;
}

const logger = new Logger("Translation");
const indexLogger = new Logger("LemmaCounts");

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
      const label = `Track ${context.trackId} → ${target.targetLanguage}`;
      logger.log(`${label}: translating ${lines.filter((l) => !l.translated).length} of ${lines.length} lines`);
      await context.report?.progress(lines.filter((l) => l.translated).length, lines.length);
      const report = await translateLines(lines, {
        translate: deps.translate,
        canSpend: () => context.spend.canSpend(),
        save: (done) => context.repository.saveLineTranslations(translationId, done),
        sourceLanguage: target.sourceLanguage,
        targetLanguage: target.targetLanguage,
        retryDelayMs: deps.retryDelayMs,
        onProgress: async (done, total) => {
          await context.repository.saveTranslationProgress(translationId, done);
          await context.report?.progress(done, total);
        },
        onChunkFailure: (failure) =>
          logger.warn(
            `${label}: lines ${failure.fromLine}–${failure.toLine}, try ${failure.attempt} failed: ${failure.reason}`,
          ),
      });
      await context.repository.finishTranslation(translationId, report);
      const summary =
        `${label}: ${report.status}${report.errorCode ? ` (${report.errorCode})` : ""}, ` +
        `${report.translatedLines}/${report.totalLines} lines, ${report.chunks} chunks, ${report.calls} calls, ${dollars(report.costMicroUsd)}`;
      if (report.status === "failed") {
        logger.warn(summary);
        await context.report?.translationFailed(report.errorCode ?? "internal");
      } else logger.log(summary);
    },
    index: async (context) => {
      const counts = countLemmas(await context.repository.lineWords(context.trackId));
      await context.repository.replaceLemmaCounts(context.trackId, counts);
      indexLogger.log(
        `Track ${context.trackId}: ${counts.length} lemmas, ${counts.reduce((sum, c) => sum + c.count, 0)} words counted`,
      );
      if (!deps.words) return;
      try {
        const report = await deps.words.prepare(context.trackId, context.spend);
        if (report.skipped === "not_imported") return;
        const line =
          `Track ${context.trackId}: word data ${report.described} missing words described, ` +
          `${report.translated} glosses translated, ${report.calls} calls` +
          (report.failures ? `, ${report.failures} failed` : "") +
          (report.skipped ? ` (stopped: ${report.skipped})` : "");
        if (report.calls > 0 || report.skipped) indexLogger.log(line);
      } catch (err) {
        indexLogger.warn(`Track ${context.trackId}: word data failed: ${describeError(err)}`);
      }
    },
  };
}

import { z } from "zod";
import { ProcessingError, errorReason } from "../processing-error";

export const NLP_BATCH_SENTENCES = 200;
export const NLP_TIMEOUT_MS = 60_000;

export const NlpToken = z.object({
  start: z.int().min(0),
  text: z.string(),
  lemma: z.string(),
  pos: z.string(),
  tag: z.string(),
  morph: z.string(),
  dep: z.string(),
  head: z.int().min(0),
});

export type NlpToken = z.infer<typeof NlpToken>;

const AnalyseResponse = z.object({ model: z.string(), sentences: z.array(z.array(NlpToken)) });

export type Analyser = (sentences: string[]) => Promise<NlpToken[][]>;

export function nlpAnalyser(baseUrl = process.env.NLP_URL ?? "http://localhost:8100"): Analyser {
  return async (sentences) => {
    const result: NlpToken[][] = [];
    for (let start = 0; start < sentences.length; start += NLP_BATCH_SENTENCES) {
      const batch = sentences.slice(start, start + NLP_BATCH_SENTENCES);
      let body: unknown;
      try {
        const res = await fetch(`${baseUrl}/analyse`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sentences: batch }),
          signal: AbortSignal.timeout(NLP_TIMEOUT_MS),
        });
        if (!res.ok) throw new ProcessingError("internal", true, `NLP service answered ${res.status}`);
        body = await res.json();
      } catch (err) {
        if (err instanceof ProcessingError) throw err;
        throw new ProcessingError("internal", true, `NLP service unreachable at ${baseUrl} (${errorReason(err)})`);
      }
      const parsed = AnalyseResponse.safeParse(body);
      if (!parsed.success || parsed.data.sentences.length !== batch.length)
        throw new ProcessingError("internal", true, "NLP service gave an invalid answer");
      result.push(...parsed.data.sentences);
    }
    return result;
  };
}

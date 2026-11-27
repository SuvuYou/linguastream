import { TranslationAnswerError, type TranslationRequest } from "../../processing/translate/translate";
import { languageName } from "./language-name";

export function translationInstruction(source: string, target: string): string {
  const from = languageName(source);
  const to = languageName(target);
  return `You translate ${from} video subtitles into ${to}.
The message has numbered subtitle lines, and may have context lines before and after them.
The lines are continuous speech: a sentence often runs across several lines.
Translate so that reading your lines in order gives a natural, faithful ${to} translation of the whole passage, while each line's translation covers what is said in that line. Move a word to a neighbouring line only when ${to} word order needs it.
Never merge, split, drop or add lines. Translate tags such as [Musik] as well.
Context lines are only there to help you understand; don't translate them.
Answer with a JSON array of strings: exactly one string per numbered line, in the same order, without the numbers.`;
}

export function translationMessage(request: TranslationRequest): string {
  const parts: string[] = [];
  if (request.before.length) parts.push(`Context before:\n${request.before.join("\n")}`);
  parts.push(
    `Lines to translate (${request.lines.length}):\n${request.lines.map((line, i) => `${i + 1}. ${line}`).join("\n")}`,
  );
  if (request.after.length) parts.push(`Context after:\n${request.after.join("\n")}`);
  if (request.wrongAnswer)
    parts.push(
      `Your last answer had ${request.wrongAnswer.received ?? "no"} items. Return exactly ${request.lines.length} strings, one per numbered line.`,
    );
  return parts.join("\n\n");
}

export function parseTranslations(answer: string, expected: number): string[] {
  let data: unknown;
  try {
    data = JSON.parse(answer.trim().replace(/^```(?:json)?\s*|\s*```$/g, ""));
  } catch {
    throw new TranslationAnswerError(expected, null);
  }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const lists = Object.values(data).filter(Array.isArray);
    if (lists.length === 1) data = lists[0];
  }
  if (!Array.isArray(data) || !data.every((item) => typeof item === "string"))
    throw new TranslationAnswerError(expected, null);
  if (data.length !== expected) throw new TranslationAnswerError(expected, data.length);
  return data.map((item, i) => item.replace(new RegExp(`^${i + 1}\\.\\s+`), ""));
}

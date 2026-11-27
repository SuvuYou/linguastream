import type { VerbLexicon } from "../processing/normalise/join-rule";
import { DICTIONARY_LANGUAGE, type DictionaryRepository } from "./dictionary.repository";

export function dictionaryVerbLexicon(
  dictionary: Pick<DictionaryRepository, "isImported" | "canBeVerb">,
  language = DICTIONARY_LANGUAGE,
): VerbLexicon {
  return {
    async canBeVerb(form) {
      if (!(await dictionary.isImported(language))) return true;
      return dictionary.canBeVerb(language, form);
    },
  };
}

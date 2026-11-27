import type {
  AiWordEntry,
  DictionaryEntry,
  Line,
  PackWord,
  WordLookup,
  WordPack,
  WordStatus,
} from "@linguastream/contracts";

const FORMS: Record<string, string | null> = {
  Guten: "gut",
  zeige: "zeigen",
  euch: "ihr",
  frühstücken: "frühstücken",
  frühstückt: "frühstücken",
  fangen: "anfangen",
  an: "anfangen",
  am: "an",
  ist: "sein",
  war: "sein",
  gibt: "geben",
  solltet: "sollen",
  laufen: "laufen",
  zum: "zu",
  öffnet: "öffnen",
  kommen: "kommen",
  Leute: "Leute",
  nehme: "nehmen",
  rufen: "rufen",
  habt: "haben",
  bekommt: "bekommen",
  brauche: "brauchen",
  röstet: "rösten",
  Probiert: "probieren",
  probieren: "probieren",
  fahren: "fahren",
  sieht: "sehen",
  Schreibt: "schreiben",
  Hamburg: null,
  Elbe: null,
  Matjes: "Matjes",
};

export function lemmaOf(core: string): string | null {
  if (core in FORMS) return FORMS[core]!;
  if (!/\p{L}/u.test(core)) return null;
  return core;
}

const sense = (gloss: string, example: string | null = null, example_en: string | null = null) => ({
  gloss,
  glosses: [gloss],
  tags: [],
  example,
  example_en,
});

interface MockWord {
  entries: DictionaryEntry[];
  rank: number | null;
  gloss: string | null;
}

const entry = (
  word: string,
  pos: string,
  senses: ReturnType<typeof sense>[],
  extra: Partial<Pick<DictionaryEntry, "gender" | "plural" | "flags">> = {},
): DictionaryEntry => ({ word, pos, gender: null, plural: null, flags: [], senses, ...extra });

const DICTIONARY: Record<string, MockWord> = {
  unbedingt: {
    rank: 1240,
    gloss: "absolutely, definitely",
    entries: [
      entry("unbedingt", "adverb", [
        sense("absolutely, definitely", "Das musst du unbedingt sehen.", "You absolutely have to see that."),
        sense("unconditionally"),
      ]),
    ],
  },
  Hafen: {
    rank: 2810,
    gloss: "harbour, port",
    entries: [entry("Hafen", "noun", [sense("harbour, port", "Das Schiff liegt im Hafen.", "The ship is in the harbour."), sense("haven, refuge")], { gender: "m", plural: "Häfen" })],
  },
  anfangen: {
    rank: 610,
    gloss: "to begin, to start",
    entries: [entry("anfangen", "verb", [sense("to begin, to start", "Der Film fängt um acht an.", "The film starts at eight."), sense("to do (with)")], { flags: ["separable"] })],
  },
  frühstücken: {
    rank: 9800,
    gloss: "to have breakfast",
    entries: [entry("frühstücken", "verb", [sense("to have breakfast")])],
  },
  ruhig: {
    rank: 1460,
    gloss: "quiet, calm",
    entries: [entry("ruhig", "adjective", [sense("quiet, calm"), sense("feel free to (as a particle)", "Komm ruhig rein.", "Feel free to come in.")])],
  },
  morgens: {
    rank: 3900,
    gloss: "in the morning",
    entries: [entry("morgens", "adverb", [sense("in the morning, in the mornings")])],
  },
  Morgen: {
    rank: 420,
    gloss: "morning",
    entries: [
      entry("Morgen", "noun", [sense("morning"), sense("acre (old unit of land)")], { gender: "m", plural: "Morgen" }),
      entry("morgen", "adverb", [sense("tomorrow")]),
    ],
  },
  Markt: {
    rank: 2100,
    gloss: "market",
    entries: [entry("Markt", "noun", [sense("market"), sense("marketplace, square")], { gender: "m", plural: "Märkte" })],
  },
  probieren: {
    rank: 3300,
    gloss: "to try, to taste",
    entries: [entry("probieren", "verb", [sense("to try, to taste"), sense("to attempt")])],
  },
  Fähre: {
    rank: 12400,
    gloss: "ferry",
    entries: [entry("Fähre", "noun", [sense("ferry")], { gender: "f", plural: "Fähren" })],
  },
  Kaffee: {
    rank: 1900,
    gloss: "coffee",
    entries: [entry("Kaffee", "noun", [sense("coffee"), sense("afternoon coffee and cake")], { gender: "m" })],
  },
  sein: {
    rank: 3,
    gloss: "to be",
    entries: [
      entry("sein", "verb", [sense("to be"), sense("to exist"), sense("auxiliary for the perfect tense")], { flags: ["aux-sein"] }),
      entry("sein", "determiner", [sense("his, its")]),
    ],
  },
  weil: { rank: 160, gloss: "because", entries: [entry("weil", "conjunction", [sense("because")])] },
  noch: { rank: 45, gloss: "still, yet", entries: [entry("noch", "adverb", [sense("still, yet"), sense("another, more")])] },
};

const AI_WORDS: Record<string, AiWordEntry> = {
  Zimtschnecke: { pos: "noun", gender: "f", gloss: "cinnamon roll", parts: ["Zimt", "Schnecke"] },
  Fischbrötchen: { pos: "noun", gender: "n", gloss: "fish sandwich", parts: ["Fisch", "Brötchen"] },
};

const INITIAL_STATUSES: Record<string, WordStatus> = {
  unbedingt: "learning",
  anfangen: "learning",
  ruhig: "learning",
  Hafen: "unknown",
  Franzbrötchen: "unknown",
  Zimtschnecke: "unknown",
  Fähre: "unknown",
  Fischbrötchen: "unknown",
  Matjes: "ignored",
};

let statuses = new Map<string, WordStatus>(Object.entries(INITIAL_STATUSES));

export function resetMockWordStatuses() {
  statuses = new Map(Object.entries(INITIAL_STATUSES));
}

export function setMockWordStatus(lemma: string, status: WordStatus) {
  statuses.set(lemma, status);
}

export function mockWordStatus(lemma: string): WordStatus {
  return statuses.get(lemma) ?? "known";
}

function glossOf(lemma: string): Pick<PackWord, "gloss" | "gloss_language" | "source" | "rank" | "pos" | "gender" | "plural" | "flags" | "parts"> {
  const known = DICTIONARY[lemma];
  if (known) {
    const first = known.entries[0]!;
    return {
      gloss: known.gloss,
      gloss_language: "en",
      source: "dictionary",
      rank: known.rank,
      pos: first.pos,
      gender: first.gender,
      plural: first.plural,
      flags: first.flags,
      parts: [],
    };
  }
  const ai = AI_WORDS[lemma];
  return {
    gloss: ai?.gloss ?? null,
    gloss_language: ai?.gloss ? "en" : null,
    source: ai ? "ai" : null,
    rank: null,
    pos: ai?.pos ?? null,
    gender: ai?.gender ?? null,
    plural: null,
    flags: [],
    parts: ai?.parts ?? [],
  };
}

export function mockWordPack(videoId: string, lines: readonly Line[]): WordPack {
  const counts = new Map<string, number>();
  for (const line of lines)
    for (const word of line.words)
      if (word.lemma) counts.set(word.lemma, (counts.get(word.lemma) ?? 0) + 1);
  return {
    video_id: videoId,
    language: "de",
    native_language: "en",
    words: [...counts].map(([lemma, count]) => ({ lemma, count, ...glossOf(lemma), status: mockWordStatus(lemma) })),
  };
}

export function mockWordLookup(videoId: string, line: Line, i: number): WordLookup | undefined {
  const word = line.words.find((w) => w.i === i);
  if (!word) return undefined;
  const base = {
    video_id: videoId,
    line_index: line.index,
    line: { text: line.text, translation: line.translation },
    word: { i, text: word.text, pos: null, morph: null },
    language: "de",
    native_language: "en",
  };
  if (!word.lemma)
    return { ...base, lemma: null, status: "unknown", rank: null, gloss: null, gloss_language: null, entries: [], ai: null };
  const packed = glossOf(word.lemma);
  return {
    ...base,
    lemma: word.lemma,
    status: mockWordStatus(word.lemma),
    rank: packed.rank,
    gloss: packed.gloss,
    gloss_language: packed.gloss_language,
    entries: DICTIONARY[word.lemma]?.entries ?? [],
    ai: AI_WORDS[word.lemma] ?? null,
  };
}

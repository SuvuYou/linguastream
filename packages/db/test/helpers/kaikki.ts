export const kaikki = {
  hund: {
    lang_code: "de",
    word: "Hund",
    pos: "noun",
    head_templates: [{ expansion: "Hund m (strong, genitive Hundes or Hunds, plural Hunde)" }],
    forms: [
      { form: "Hunde", tags: ["nominative", "plural"] },
      { form: "Hundes", tags: ["genitive", "singular"] },
      { form: "de-ndecl", tags: ["inflection-template"] },
    ],
    senses: [
      {
        glosses: ["dog (Canis lupus familiaris)"],
        examples: [{ text: "Der Hund bellt.", english: "The dog barks." }],
      },
      { glosses: ["scoundrel"], tags: ["derogatory"] },
    ],
  },
  hunde: {
    lang_code: "de",
    word: "Hunde",
    pos: "noun",
    senses: [{ form_of: [{ word: "Hund" }], glosses: ["plural of Hund"] }],
  },
  anfangen: {
    lang_code: "de",
    word: "anfangen",
    pos: "verb",
    categories: [{ name: "German verbs using haben as auxiliary" }],
    forms: [
      { form: "fängt an", tags: ["present", "singular", "third-person"] },
      { form: "angefangen", tags: ["participle", "past"] },
      { form: "haben", tags: ["auxiliary", "perfect"] },
    ],
    senses: [
      { glosses: ["to begin, to start"], examples: [{ text: "Wir fangen an.", translation: "We start." }] },
      { glosses: ["to do (with)"], tags: ["reflexive"] },
    ],
  },
  gehen: {
    lang_code: "de",
    word: "gehen",
    pos: "verb",
    categories: ["German verbs using sein as auxiliary", { name: "German inseparable verbs" }],
    forms: [{ form: "geht", tags: ["present"] }],
    senses: [{ raw_glosses: ["(intransitive) to go"] }],
  },
  aber: {
    lang_code: "de",
    word: "aber",
    pos: "conj",
    senses: [{ glosses: ["but, however"] }],
  },
  english: { lang_code: "en", word: "dog", pos: "noun", senses: [{ glosses: ["Hund"] }] },
};

export const kaikkiLines = Object.values(kaikki).map((e) => JSON.stringify(e));

export interface Sense {
  gloss: string;
  glosses: string[];
  tags: string[];
  example: string | null;
  example_en: string | null;
}

export interface EntryRow {
  word: string;
  pos: string;
  gender: string | null;
  plural: string | null;
  flags: string[];
  senses: Sense[];
}

export interface FormRow {
  form: string;
  lemma: string;
  pos: string;
  tags: string[];
}

export interface ParsedLine {
  entry: EntryRow | null;
  forms: FormRow[];
}

interface RawForm {
  form?: string;
  tags?: string[];
}

interface RawExample {
  text?: string;
  english?: string;
  translation?: string;
}

interface RawSense {
  glosses?: string[];
  raw_glosses?: string[];
  tags?: string[];
  categories?: (string | { name?: string })[];
  examples?: RawExample[];
  form_of?: { word?: string }[];
  alt_of?: { word?: string }[];
}

interface RawEntry {
  lang_code?: string;
  word?: string;
  pos?: string;
  tags?: string[];
  categories?: (string | { name?: string })[];
  head_templates?: { expansion?: string }[];
  forms?: RawForm[];
  senses?: RawSense[];
}

const SKIP_FORM_TAGS = new Set([
  "table-tags",
  "inflection-template",
  "class",
  "romanization",
  "error-unknown-tag",
  "auxiliary",
]);

function categories(entry: RawEntry): string[] {
  const all = [...(entry.categories ?? []), ...(entry.senses ?? []).flatMap((s) => s.categories ?? [])];
  return all.map((c) => (typeof c === "string" ? c : (c.name ?? "")));
}

export function genderOf(entry: RawEntry): string | null {
  const tags = new Set([...(entry.tags ?? []), ...(entry.senses ?? []).flatMap((s) => s.tags ?? [])]);
  let found = (
    [
      ["m", "masculine"],
      ["f", "feminine"],
      ["n", "neuter"],
    ] as const
  )
    .filter(([, tag]) => tags.has(tag))
    .map(([g]) => g as string);
  if (found.length === 0) {
    for (const head of entry.head_templates ?? []) {
      const match = /^\S+(?:\s\S+)*?\s(m|f|n)(?:\s|,|$|\()/.exec(head.expansion ?? "");
      if (match) {
        found = [match[1]!];
        break;
      }
    }
  }
  return found.length ? [...new Set(found)].sort().join(",") : null;
}

const usableForm = (form: RawForm) =>
  !!form.form && form.form !== "-" && form.form !== "—" && !(form.tags ?? []).some((t) => SKIP_FORM_TAGS.has(t));

export function pluralOf(entry: RawEntry): string | null {
  for (const form of entry.forms ?? []) {
    const tags = new Set(form.tags ?? []);
    if (!usableForm(form) || !tags.has("plural")) continue;
    if (tags.has("nominative") || tags.size === 1) return form.form!;
  }
  return null;
}

export function flagsOf(entry: RawEntry, pos: string): string[] {
  if (pos !== "verb") return [];
  const flags = new Set<string>();
  const cats = categories(entry).join(" | ").toLowerCase();
  const word = entry.word ?? "";
  const split = (entry.forms ?? []).some((form) => {
    if (!usableForm(form)) return false;
    const parts = form.form!.split(" ");
    return parts.length === 2 && parts[1]!.length > 0 && word.startsWith(parts[1]!) && word !== parts[1];
  });
  if (/(?<!in)separable verbs/.test(cats) || split) flags.add("separable");
  if (cats.includes("sein as auxiliary")) flags.add("aux-sein");
  if ((entry.senses ?? []).some((s) => (s.tags ?? []).includes("reflexive"))) flags.add("reflexive");
  return [...flags].sort();
}

export function sensesOf(entry: RawEntry): Sense[] {
  const out: Sense[] = [];
  for (const sense of entry.senses ?? []) {
    if (sense.form_of?.length || sense.alt_of?.length) continue;
    const glosses = sense.glosses?.length ? sense.glosses : sense.raw_glosses;
    if (!glosses?.length) continue;
    const example = (sense.examples ?? []).find((e) => e.text);
    out.push({
      gloss: glosses[glosses.length - 1]!,
      glosses,
      tags: sense.tags ?? [],
      example: example?.text ?? null,
      example_en: example?.english ?? example?.translation ?? null,
    });
  }
  return out;
}

export function parseLine(line: string, language = "de"): ParsedLine {
  let entry: RawEntry;
  try {
    entry = JSON.parse(line) as RawEntry;
  } catch {
    return { entry: null, forms: [] };
  }
  const word = entry.word;
  const pos = entry.pos ?? "";
  if (entry.lang_code !== language || !word) return { entry: null, forms: [] };

  const forms = new Map<string, FormRow>();
  const add = (row: FormRow) => forms.set(JSON.stringify([row.form, row.lemma, row.pos, row.tags]), row);
  add({ form: word, lemma: word, pos, tags: [] });
  for (const sense of entry.senses ?? []) {
    for (const base of sense.form_of ?? []) {
      if (base.word) add({ form: word, lemma: base.word, pos, tags: ["form-of"] });
    }
  }

  const senses = sensesOf(entry);
  if (senses.length === 0) return { entry: null, forms: [...forms.values()] };

  for (const form of entry.forms ?? []) {
    if (usableForm(form)) add({ form: form.form!, lemma: word, pos, tags: form.tags ?? [] });
  }
  return {
    entry: {
      word,
      pos,
      gender: pos === "noun" ? genderOf(entry) : null,
      plural: pos === "noun" ? pluralOf(entry) : null,
      flags: flagsOf(entry, pos),
      senses,
    },
    forms: [...forms.values()],
  };
}

export function parseFrequencyLine(line: string): { word: string; count: number } | null {
  const parts = line.trim().split(/\s+/);
  if (parts.length !== 2) return null;
  const count = Number(parts[1]);
  if (!Number.isInteger(count) || count < 0) return null;
  return { word: parts[0]!.toLowerCase(), count };
}

import type { WordForm } from "@linguastream/contracts";

const FEATURES: [string, Record<string, string>][] = [
  ["Person", { "1": "1st person", "2": "2nd person", "3": "3rd person" }],
  ["Number", { Sing: "singular", Plur: "plural" }],
  ["Tense", { Pres: "present", Past: "past" }],
  ["Mood", { Ind: "indicative", Sub: "subjunctive", Imp: "imperative" }],
  ["VerbForm", { Inf: "infinitive", Part: "participle" }],
  ["Case", { Nom: "nominative", Acc: "accusative", Dat: "dative", Gen: "genitive" }],
  ["Gender", { Masc: "masculine", Fem: "feminine", Neut: "neuter" }],
  ["Degree", { Cmp: "comparative", Sup: "superlative" }],
];

export function describeMorph(morph: string | null): string | null {
  if (!morph) return null;
  const values = new Map(
    morph.split("|").map((pair) => pair.split("=") as [string, string]),
  );
  const parts = FEATURES.flatMap(([feature, names]) => {
    const name = names[values.get(feature) ?? ""];
    return name ? [name] : [];
  });
  return parts.length ? parts.join(" · ") : null;
}

const GENDERS: Record<string, string> = { m: "masculine", f: "feminine", n: "neuter" };

export function genderName(gender: string | null): string | null {
  if (!gender) return null;
  return gender
    .split(/[^mfn]+/)
    .filter(Boolean)
    .map((g) => GENDERS[g] ?? g)
    .join(" or ") || null;
}

const FLAG_NAMES: Record<string, string> = {
  separable: "separable",
  reflexive: "reflexive",
  "aux-sein": "perfect with sein",
};

export function flagName(flag: string): string {
  return FLAG_NAMES[flag] ?? flag;
}

const HIDDEN_TAGS = new Set(["table-tags", "inflection-template", "class", "canonical"]);

export interface FormGroup {
  label: string;
  forms: string[];
}

export function groupForms(forms: readonly WordForm[]): FormGroup[] {
  const groups = new Map<string, string[]>();
  for (const { form, tags } of forms) {
    const shown = tags.filter((tag) => !HIDDEN_TAGS.has(tag));
    if (tags.some((tag) => HIDDEN_TAGS.has(tag)) && shown.length === 0) continue;
    const label = shown.length ? shown.map((tag) => tag.replace(/-/g, " ")).join(" · ") : "other";
    const list = groups.get(label) ?? [];
    if (!list.includes(form)) list.push(form);
    groups.set(label, list);
  }
  return [...groups].map(([label, list]) => ({ label, forms: list }));
}

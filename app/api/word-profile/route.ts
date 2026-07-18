import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase/session";
import { db } from "@/lib/initializations/db";
import { generateGeminiText } from "@/lib/gemini/caller";

const WIKTIONARY_LANG_MAP: Record<string, string> = {
  de: "de",
  en: "en",
};

async function fetchWiktionary(word: string, lang: string) {
  const wikiLang = WIKTIONARY_LANG_MAP[lang] ?? "en";
  const url = `https://${wikiLang}.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`;

  try {
    const res = await fetch(url, { next: { revalidate: 24 * 60 * 60 } });
    if (!res.ok) return null;
    const data = await res.json();

    const entries = data[lang] ?? data[Object.keys(data)[0]] ?? [];
    if (!entries.length) return null;

    const entry = entries[0];

    return {
      part_of_speech: entry.partOfSpeech ?? null,
      forms: (entry.inflections ?? []).reduce(
        (
          acc: Record<string, string>,
          inf: { label: string; values: string[] },
        ) => {
          if (inf.label && inf.values?.[0]) acc[inf.label] = inf.values[0];
          return acc;
        },
        {},
      ),
    };
  } catch {
    return null;
  }
}

async function fetchGeminiProfile(
  word: string,
  lang: string,
  wiktionaryData: {
    part_of_speech: string | null;
    forms: Record<string, string>;
  } | null,
) {
  const alreadyHave = wiktionaryData
    ? `We already know: POS=${wiktionaryData.part_of_speech}, forms=${JSON.stringify(
        wiktionaryData.forms,
      )}.`
    : "";

  const prompt = `You are a linguistics expert. For the ${lang} word "${word}":
${alreadyHave}
Return ONLY valid JSON (no markdown, no extra text):
{
  "part_of_speech": "string or null if already known",
  "forms": {} or null if already known,
  "lexical_family": ["3-6 related words"],
  "collocations": ["3-5 common phrases using this word"]
}`;

  const text = await generateGeminiText(prompt, {
    responseMimeType: "application/json",
  });

  return JSON.parse(text);
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const word = req.nextUrl.searchParams.get("word");
  const lang = req.nextUrl.searchParams.get("lang");

  if (!word || !lang) {
    return NextResponse.json(
      { error: "Missing word or lang" },
      { status: 400 },
    );
  }

  const cached = await db.wordProfile.findUnique({
    where: { word_source_language: { word, source_language: lang } },
  });

  if (cached) return NextResponse.json(cached);

  const wiktionaryData = await fetchWiktionary(word, lang);

  let geminiData: {
    part_of_speech: string | null;
    forms: Record<string, string> | null;
    lexical_family: string[];
    collocations: string[];
  };

  try {
    geminiData = await fetchGeminiProfile(word, lang, wiktionaryData);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate word profile",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }

  const part_of_speech =
    wiktionaryData?.part_of_speech ?? geminiData.part_of_speech ?? "unknown";
  const forms = Object.keys(wiktionaryData?.forms ?? {}).length
    ? wiktionaryData!.forms
    : (geminiData.forms ?? {});

  const profile = await db.wordProfile.create({
    data: {
      word,
      source_language: lang,
      part_of_speech,
      forms,
      lexical_family: geminiData.lexical_family ?? [],
      collocations: geminiData.collocations ?? [],
    },
  });

  return NextResponse.json(profile);
}

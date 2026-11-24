import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase/session";
import { generateGeminiText } from "@/lib/gemini/caller";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const word = req.nextUrl.searchParams.get("word");
  const lang = req.nextUrl.searchParams.get("lang");
  const context = req.nextUrl.searchParams.get("context");

  if (!word || !lang) {
    return NextResponse.json(
      { error: "Missing word or lang" },
      { status: 400 },
    );
  }

  const prompt = `Given the ${lang} word "${word}"${
    context ? ` as used in this sentence: "${context}"` : ""
  }

    The provided context comes from YouTube subtitles.
    It may:
    - lack punctuation,
    - start or end in the middle of a sentence.

    Find the complete sentence that contains the target word.

    Return ONLY valid JSON:

    {
      "definition": "...",
      "translation": "...",
      "context_sentence": "..."
    }

    Rules:
    - DO NOT change, replace, translate, or add any words to "context_sentence".
    - You may ONLY remove unrelated surrounding text and add punctuation/capitalization if necessary.
    - "definition" is a short english dictionary-style definition for THIS context.
    - "translation" is the closest English equivalent in THIS context.
    - Prefer a single word for translation.
    - If impossible, use the shortest natural phrase.`;

  try {
    const result = JSON.parse(
      await generateGeminiText(prompt, {
        responseMimeType: "application/json",
      }),
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate definition",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

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

  const prompt = `Give a SHORT simple contextual definition (as if taken from dictionary) of the ${lang} word "${word}"${
    context ? ` as used in this sentence: "${context}"` : ""
  }.
Return ONLY a single plain text sentence definition. No extra text, no quotes, no markdown.`;

  try {
    const definition = (await generateGeminiText(prompt)).trim();

    return NextResponse.json({ definition });
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

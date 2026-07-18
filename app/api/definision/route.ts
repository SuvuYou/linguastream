import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrentUser } from "@/lib/firebase/session";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

  const prompt = `You are a linguistics expert. Give a short contextual definition of the ${lang} word "${word}"${
    context ? ` as used in this sentence: "${context}"` : ""
  }.
Return ONLY a single plain text sentence definition. No extra text, no quotes, no markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const definition = result.response.text().trim();
    return NextResponse.json({ definition });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate definition" },
      { status: 500 },
    );
  }
}

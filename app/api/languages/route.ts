import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import {
  fetchAvailableSourceLanguages,
  fetchAvailableTranslationLanguages,
} from "@/lib/db-helpers/languages";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [availableSourceLanguages, availableTranslationLanguages] =
      await Promise.all([
        fetchAvailableSourceLanguages(),
        fetchAvailableTranslationLanguages(),
      ]);

    return NextResponse.json({
      availableSourceLanguages,
      availableTranslationLanguages,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/initializations/firebase/session";
import {
  fetchAvailableSourceLanguages,
  fetchAvailableSubtitleLanguages,
} from "@/lib/db-helpers/languages";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [availableSourceLanguages, availableSubtitleLanguages] =
      await Promise.all([
        fetchAvailableSourceLanguages(),
        fetchAvailableSubtitleLanguages(),
      ]);

    return NextResponse.json({
      availableSourceLanguages,
      availableSubtitleLanguages,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase/session";
import {
  fetchAvailableSourceLanguages,
  fetchAvailableSubtitleLanguages,
} from "@/lib/db-helpers/languages";

export async function GET() {
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
}

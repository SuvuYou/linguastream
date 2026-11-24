import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase/session";
import { indexAllSubtitleLines } from "@/lib/db-helpers/search";

export async function POST() {
  const user = await getCurrentUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!user.is_admin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const result = await indexAllSubtitleLines();
  return NextResponse.json(result);
}

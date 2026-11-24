import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase/session";

// Jellyfin was the only source of stream URLs and was removed (Foundation card [3]).
// The route stays so the Plyr players keep their data source until uploads
// return (D-066); for now no item has a stream.
export async function GET() {
  const user = await getCurrentUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ error: "No stream available" }, { status: 404 });
}

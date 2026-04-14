import { NextResponse } from "next/server";
import {
  bulkCreateJellyfinContent,
  fetchAllRegisteredJellyfinIds,
} from "@/lib/db-helpers/media";
import { fetchJellyfinLibrary } from "@/lib/db-helpers/jellyfin";
import { getCurrentUser } from "@/lib/initializations/firebase/session";

export async function POST() {
  const user = await getCurrentUser();

  if (!user?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [jellyfinItems, registeredIds] = await Promise.all([
    fetchJellyfinLibrary(),
    fetchAllRegisteredJellyfinIds(),
  ]);

  const newItems = jellyfinItems
    .filter((item) => !registeredIds.has(item.Id))
    .map((item) => ({ jellyfin_id: item.Id, title: item.Name }));

  let result = { count: 0 };

  if (newItems.length > 0) {
    result = await bulkCreateJellyfinContent(newItems, user.id);
  }

  return NextResponse.json({
    synced: result.count,
    total: jellyfinItems.length,
    alreadyRegistered: registeredIds.size,
  });
}

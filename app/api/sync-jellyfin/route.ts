import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  bulkCreateJellyfinContent,
  fetchAllRegisteredJellyfinIds,
} from "@/lib/db-helpers/media";
import { fetchJellyfinLibrary } from "@/lib/jellyfin.server";

export async function POST() {
  // TODO: Auth check — replace with real auth later
  const user = await db.user.findUnique({
    where: { id: process.env.TEMP_USER_ID! },
  });

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

  const result = await bulkCreateJellyfinContent(newItems);

  return NextResponse.json({
    synced: result.count,
    total: jellyfinItems.length,
    alreadyRegistered: registeredIds.size,
  });
}

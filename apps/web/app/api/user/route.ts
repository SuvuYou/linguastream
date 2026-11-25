import type { CurrentUser } from "@linguastream/contracts";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase/session";

export async function GET() {
  const user = await getCurrentUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    display_name: user.displayName,
    native_language: user.nativeLanguage,
    is_admin: user.isAdmin,
  } satisfies CurrentUser);
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/firebase/session";

export async function GET() {
  const user = await getCurrentUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    native_language: user.native_language,
    is_admin: user.is_admin,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  const decoded = await adminAuth.verifyIdToken(idToken);

  await db.user.upsert({
    where: { firebase_uid: decoded.uid },
    update: { email: decoded.email ?? "" },
    create: {
      firebase_uid: decoded.uid,
      email: decoded.email ?? "",
      native_language: "en",
    },
  });

  const expiresIn = 60 * 60 * 24 * 14 * 1000;
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: expiresIn / 1000,
    path: "/",
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("session");
  return res;
}

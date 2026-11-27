import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/initializations/firebase/firebase-admin";
import { db } from "@/lib/initializations/db";

export const RECENT_SIGN_IN_SECONDS = 5 * 60;

function forbidden() {
  return NextResponse.json({ ok: false }, { status: 403 });
}

export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const expected = process.env.WEB_ORIGIN ?? new URL(req.url).origin;
  return origin !== null && origin === expected;
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return forbidden();
  try {
    const { idToken } = await req.json();

    const decoded = await adminAuth.verifyIdToken(idToken, true);
    if (Date.now() / 1000 - decoded.auth_time > RECENT_SIGN_IN_SECONDS) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    await db.user.upsert({
      where: { firebaseUid: decoded.uid },
      update: { email: decoded.email ?? "" },
      create: {
        firebaseUid: decoded.uid,
        email: decoded.email ?? "",
        nativeLanguage: "en",
        learningLanguage: "de",
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
  } catch (err) {
    console.error(
      `Session not created: ${err instanceof Error ? err.name : typeof err}`,
    );
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isSameOrigin(req)) return forbidden();
  const session = req.cookies.get("session")?.value;

  if (session) {
    await adminAuth
      .verifySessionCookie(session)
      .then((decoded) => adminAuth.revokeRefreshTokens(decoded.uid))
      .catch(() => undefined);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete("session");
  return res;
}

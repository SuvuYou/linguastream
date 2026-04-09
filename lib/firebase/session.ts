import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(token, true);
    const user = await db.user.findUnique({
      where: { firebase_uid: decoded.uid },
    });
    return user;
  } catch {
    return null;
  }
}

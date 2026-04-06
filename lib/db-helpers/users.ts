import { db } from "@/lib/db";

export async function fetchAdminUser() {
  return db.user.findUnique({ where: { id: process.env.TEMP_USER_ID! } });
}

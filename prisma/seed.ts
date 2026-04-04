import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

async function main() {
  const user = await db.user.upsert({
    where: { email: "admin@linguastream.dev" },
    update: {},
    create: {
      email: "admin@linguastream.dev",
      display_name: "Admin",
      native_language: "en",
      is_admin: true,
    },
  });
  console.log("Seeded user:", user.id);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());

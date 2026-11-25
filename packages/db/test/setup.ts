// IMPORTANT: order of imports matters here
import "./helpers/use-test-database.js";
import { afterAll, beforeEach } from "vitest";
import { db } from "../src/client.js";
import { resetDatabase } from "./helpers/reset-database.js";

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await db.$disconnect();
});

// The web app's single entry to the database. The client lives in packages/db;
// tests mock this path (`vi.mock("@/lib/initializations/db")`). Goes away in B0,
// when the web app's data calls move to the API.
export { db } from "@linguastream/db";

import { getTestDatabaseUrl } from "./test-database-url.js";

// Imported before the client, so the client connects to the test database.
process.env.DATABASE_URL = getTestDatabaseUrl();

// The database client and the Prisma types, for the web app and (from B0) the API.
// Client components may only use `import type` from this package: a value import
// would pull the Postgres driver into the browser bundle.
export { db } from "./client.js";
export * from "@prisma/client";

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { LibSQLDatabase } from "drizzle-orm/libsql";

// This file is for server-side usage only

// Get database configuration from environment variables
const dbUrl = process.env.DATABASE_URL || "";
const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

console.log("Database URL:", dbUrl);
console.log("Using Turso:", true);

let db: LibSQLDatabase<typeof schema>;

// Initialize Turso client
const client = createClient({
  url: dbUrl,
  authToken: dbAuthToken,
});

db = drizzle(client, { schema });

// Migrations are handled separately through scripts
// Use scripts/migrate-to-turso.ts if you need to run migrations

export { db, schema }; 
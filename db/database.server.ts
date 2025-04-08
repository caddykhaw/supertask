import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { join } from "path";

// This file is for server-side usage only

// Get database path
const dbPath = process.env.DATABASE_URL || join(process.cwd(), "sqlite.db");
console.log("Database path:", dbPath);

// Initialize SQLite database
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Run migrations (this is safe to call multiple times)
try {
  migrate(db, { migrationsFolder: join(process.cwd(), "drizzle") });
  console.log("Migrations complete");
} catch (error) {
  console.error("Error running migrations:", error);
}

export { schema }; 
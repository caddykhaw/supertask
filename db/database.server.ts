import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleTurso } from "drizzle-orm/libsql";
import { migrate as migrateSqlite } from "drizzle-orm/better-sqlite3/migrator";
import { migrate as migrateTurso } from "drizzle-orm/libsql/migrator";
import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { join } from "path";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

// This file is for server-side usage only

// Get database configuration from environment variables
const dbUrl = process.env.DATABASE_URL || join(process.cwd(), "sqlite.db");
const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;
const isTurso = dbUrl.includes('turso') || dbUrl.includes('libsql');

console.log("Database URL:", dbUrl);
console.log("Using Turso:", isTurso);

let db: LibSQLDatabase<typeof schema> | BetterSQLite3Database<typeof schema>;

// Migrations are disabled as tables are already created
// Uncomment and set FORCE_DB_MIGRATIONS=true if you need to run migrations again
// const shouldRunMigrations = process.env.NODE_ENV === 'development' || process.env.FORCE_DB_MIGRATIONS === 'true';

if (isTurso) {
  // Initialize Turso client
  const client = createClient({
    url: dbUrl,
    authToken: dbAuthToken,
  });
  
  db = drizzleTurso(client, { schema });
  
  // Migration code is disabled as tables are already created
  /*
  if (shouldRunMigrations) {
    try {
      migrateTurso(db, { migrationsFolder: join(process.cwd(), "drizzle") });
      console.log("Turso migrations complete");
    } catch (error) {
      console.error("Error running Turso migrations:", error);
    }
  }
  */
} else {
  // Initialize SQLite database for local development
  const sqlite = new Database(dbUrl);
  db = drizzleSqlite(sqlite, { schema });
  
  // Migration code is disabled as tables are already created
  /*
  if (shouldRunMigrations) {
    try {
      migrateSqlite(db, { migrationsFolder: join(process.cwd(), "drizzle") });
      console.log("SQLite migrations complete");
    } catch (error) {
      console.error("Error running SQLite migrations:", error);
    }
  }
  */
}

export { db, schema }; 
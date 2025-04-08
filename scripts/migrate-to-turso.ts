import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema";
import * as dotenv from "dotenv";

dotenv.config();

// Get database configuration
const dbUrl = process.env.DATABASE_URL || '';
const dbAuthToken = process.env.DATABASE_AUTH_TOKEN || '';

if (!dbUrl || !dbUrl.includes('turso')) {
  console.error("ERROR: DATABASE_URL must be set to a Turso database URL");
  process.exit(1);
}

if (!dbAuthToken) {
  console.error("ERROR: DATABASE_AUTH_TOKEN must be set");
  process.exit(1);
}

console.log("Connecting to Turso database...");

async function main() {
  // Initialize Turso client
  const client = createClient({
    url: dbUrl,
    authToken: dbAuthToken,
  });

  const db = drizzle(client, { schema });

  console.log("Creating schema in Turso database...");

  // Create tables
  try {
    // Users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        emailVerified INTEGER,
        image TEXT,
        role TEXT NOT NULL DEFAULT 'clerk',
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);
    console.log("✅ Created users table");

    // Tasks table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER NOT NULL DEFAULT 0,
        due_date INTEGER,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        "order" INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log("✅ Created tasks table");

    // Accounts table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        providerAccountId TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);
    console.log("✅ Created accounts table");

    // Sessions table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        sessionToken TEXT NOT NULL UNIQUE,
        userId TEXT NOT NULL,
        expires INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);
    console.log("✅ Created sessions table");

    // Verification tokens table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires INTEGER NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `);
    console.log("✅ Created verification_tokens table");

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error); 
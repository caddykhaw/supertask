import { createClient } from "@libsql/client";
import * as dotenv from 'dotenv';
import { randomUUID } from "crypto";
import { hash } from "bcrypt";

dotenv.config();

// Get database configuration
const dbUrl = process.env.DATABASE_URL || '';
const dbAuthToken = process.env.DATABASE_AUTH_TOKEN || '';

// Required environment variables for boss setup
const requiredEnvVars = ["BOSS_NAME", "BOSS_EMAIL", "BOSS_PASSWORD"];

// Check if required environment variables exist
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(", ")}`);
  console.error(`Please create a .env file with the following variables:`);
  console.error(`
BOSS_NAME="Admin Name"
BOSS_EMAIL="admin@example.com"
BOSS_PASSWORD="your-secure-password"
  `);
  process.exit(1);
}

if (!dbUrl || !dbUrl.includes('turso')) {
  console.error("ERROR: DATABASE_URL must be set to a Turso database URL");
  process.exit(1);
}

if (!dbAuthToken) {
  console.error("ERROR: DATABASE_AUTH_TOKEN must be set");
  process.exit(1);
}

async function setupBoss() {
  try {
    console.log("Connecting to Turso database...");
    
    // Initialize Turso client
    const client = createClient({
      url: dbUrl,
      authToken: dbAuthToken,
    });

    // Check if a boss already exists
    const existingBossQuery = await client.execute({
      sql: "SELECT * FROM users WHERE role = ?",
      args: ["boss"]
    });
    
    if (existingBossQuery.rows.length > 0) {
      const existingBoss = existingBossQuery.rows[0];
      console.log(`Boss user already exists: ${existingBoss.name} (${existingBoss.email})`);
      client.close();
      return;
    }

    // Hash the password
    const passwordHash = await hash(process.env.BOSS_PASSWORD!, 10);

    // Create the boss user
    const bossId = randomUUID();
    const bossName = process.env.BOSS_NAME!;
    const bossEmail = process.env.BOSS_EMAIL!;
    const now = Date.now();

    await client.execute({
      sql: `
        INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [bossId, bossName, bossEmail, passwordHash, "boss", now, now]
    });

    console.log(`Successfully created boss user: ${bossName} (${bossEmail})`);
    console.log(`ID: ${bossId}`);
    console.log(`You can now sign in with this email and the password from your .env file.`);

    await client.close();
  } catch (error) {
    console.error("Error setting up boss user:", error);
    process.exit(1);
  }
}

// Run the setup
setupBoss(); 
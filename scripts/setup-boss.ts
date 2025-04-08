const { db } = require("../db/database.server");
const { users, UserRole } = require("../db/schema");
const { randomUUID } = require("crypto");
const { config } = require("dotenv");
const path = require("path");
const { eq } = require("drizzle-orm");
const { hash } = require("bcrypt");

// Load environment variables
config({ path: path.resolve(process.cwd(), ".env") });

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

async function setupBoss() {
  try {
    // Check if a boss already exists
    const existingBoss = await db.select().from(users).where(eq(users.role, UserRole.BOSS)).get();
    
    if (existingBoss) {
      console.log(`Boss user already exists: ${existingBoss.name} (${existingBoss.email})`);
      return;
    }

    // Hash the password
    const passwordHash = await hash(process.env.BOSS_PASSWORD, 10);

    // Create the boss user
    const bossId = randomUUID();
    const bossName = process.env.BOSS_NAME;
    const bossEmail = process.env.BOSS_EMAIL;

    await db.insert(users).values({
      id: bossId,
      name: bossName,
      email: bossEmail,
      passwordHash,
      role: UserRole.BOSS,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`Successfully created boss user: ${bossName} (${bossEmail})`);
    console.log(`ID: ${bossId}`);
    console.log(`You can now sign in with this email and the password from your .env file.`);

  } catch (error) {
    console.error("Error setting up boss user:", error);
    process.exit(1);
  }
}

// Run the setup
setupBoss(); 
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema";
import { compare } from "bcrypt";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

// Test password to verify
const testPassword = "Iamtheboss123";
const email = "bsytan_2000@gmail.com";

// Get database configuration
const dbUrl = process.env.DATABASE_URL || '';
const dbAuthToken = process.env.DATABASE_AUTH_TOKEN || '';

async function verifyPassword() {
  try {
    console.log("Connecting to Turso database...");
    
    // Initialize Turso client
    const client = createClient({
      url: dbUrl,
      authToken: dbAuthToken,
    });
    
    const db = drizzle(client, { schema });
    
    // Get user by email
    const users = await db.query.users.findMany({
      where: eq(schema.users.email, email),
      limit: 1
    });
    
    if (users.length === 0) {
      console.log(`User not found with email: ${email}`);
      return;
    }
    
    const user = users[0];
    
    console.log(`User found: ${user.name}`);
    console.log(`Password hash: ${user.passwordHash?.substring(0, 10)}...`);
    
    // Test password verification
    if (!user.passwordHash) {
      console.log("No password hash found for user");
      return;
    }
    
    console.log(`Testing password: "${testPassword}"`);
    const isValid = await compare(testPassword, user.passwordHash);
    
    console.log("Password verification result:", isValid ? "✅ MATCH" : "❌ NO MATCH");
    
    // Close client
    await client.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the verification
verifyPassword(); 
import Database from "better-sqlite3";
import { join } from "path";
import { compare } from "bcrypt";

// Test password to verify
const testPassword = "Iamtheboss123";
const email = "bsytan_2000@gmail.com";

async function verifyPassword() {
  try {
    // Open database
    const dbPath = join(process.cwd(), "sqlite.db");
    console.log("Using database at:", dbPath);
    const db = new Database(dbPath);
    
    // Get user by email
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (!user) {
      console.log(`User not found with email: ${email}`);
      return;
    }
    
    console.log(`User found: ${user.name}`);
    console.log(`Password hash: ${user.password_hash.substring(0, 10)}...`);
    
    // Test password verification
    console.log(`Testing password: "${testPassword}"`);
    const isValid = await compare(testPassword, user.password_hash);
    
    console.log("Password verification result:", isValid ? "✅ MATCH" : "❌ NO MATCH");
    
    // Close database
    db.close();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the verification
verifyPassword(); 
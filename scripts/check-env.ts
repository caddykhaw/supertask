// Script to check environment variables
import { config } from "dotenv";
import { join } from "path";

// Load environment variables
config({ path: join(process.cwd(), ".env") });

// Check important environment variables
const envVars = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "[SET]" : "[MISSING]",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "[SET]" : "[MISSING]",
  DATABASE_URL: process.env.DATABASE_URL || "[USING DEFAULT]",
};

console.log("Environment variables:");
console.log(JSON.stringify(envVars, null, 2));

// Provide guidance based on missing variables
const missingVars = Object.entries(envVars)
  .filter(([_, value]) => value === "[MISSING]")
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.log("\nMissing variables that may affect authentication:");
  console.log(missingVars.join(", "));
  
  console.log("\nRecommended .env file content:");
  if (!process.env.NEXTAUTH_SECRET) {
    console.log(`NEXTAUTH_SECRET="your-secure-secret-here"`);
  }
  if (!process.env.NEXTAUTH_URL) {
    console.log(`NEXTAUTH_URL="http://localhost:3000"`);
  }
} 
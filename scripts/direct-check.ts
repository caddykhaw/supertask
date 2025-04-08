import Database from "better-sqlite3";
import { join } from "path";

interface Table {
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  role: string;
  emailVerified?: number;
  image?: string;
  created_at: number;
  updated_at: number;
  [key: string]: any; // For any other properties
}

// Open database directly
const dbPath = join(process.cwd(), "sqlite.db");
console.log("Using database at:", dbPath);

try {
  const db = new Database(dbPath);
  
  // Check if users table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Table[];
  console.log("Available tables:", tables.map(t => t.name).join(", "));
  
  // If users table exists, query it
  if (tables.some(t => t.name === "users")) {
    const users = db.prepare("SELECT * FROM users").all() as User[];
    console.log(`\nTotal users found: ${users.length}`);
    
    users.forEach((user, index) => {
      const { password_hash, ...userInfo } = user;
      console.log(`\nUser ${index + 1}:`);
      console.log(JSON.stringify(userInfo, null, 2));
      console.log(`Password hash: ${password_hash ? "[SET]" : "[NOT SET]"}`);
    });
  } else {
    console.log("No users table found in the database.");
  }
  
  // Close the database connection
  db.close();
} catch (error) {
  console.error("Error accessing database:", error);
} 
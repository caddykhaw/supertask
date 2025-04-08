import Database from "better-sqlite3";
import { join } from "path";
import { compare } from "bcrypt";
import * as readline from 'readline';

// User interface
interface User {
  id: string;
  email: string;
  password_hash: string;
  [key: string]: any;
}

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function checkPassword() {
  try {
    // Get email and password from user
    const email = await new Promise<string>(resolve => {
      rl.question('Enter email: ', resolve);
    });

    const password = await new Promise<string>(resolve => {
      rl.question('Enter password: ', resolve);
    });

    // Open database
    const dbPath = join(process.cwd(), "sqlite.db");
    console.log("Using database at:", dbPath);
    const db = new Database(dbPath);
    
    // Get user by email
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;
    
    if (!user) {
      console.log("User not found with that email");
      return;
    }
    
    // Check password
    const isValid = await compare(password, user.password_hash);
    
    console.log("Password match result:", isValid);
    console.log("Stored hash:", user.password_hash.substring(0, 10) + "...");
    
    // Close db and readline
    db.close();
    rl.close();
  } catch (error) {
    console.error("Error:", error);
    rl.close();
  }
}

// Run the check
checkPassword(); 
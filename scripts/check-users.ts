import { db } from "../db/database.server";
import { users } from "../db/schema";

interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: string;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

async function checkUsers() {
  try {
    // Get all users from the database
    const allUsers = await db.select().from(users).all() as User[];
    
    console.log("Total users found:", allUsers.length);
    
    // Print info about each user (excluding password hash)
    allUsers.forEach((user: User, index: number) => {
      const { passwordHash, ...userInfo } = user;
      console.log(`\nUser ${index + 1}:`);
      console.log(JSON.stringify(userInfo, null, 2));
      // Just show whether password hash exists
      console.log(`Password hash: ${passwordHash ? "[SET]" : "[NOT SET]"}`);
    });
    
  } catch (error) {
    console.error("Error querying users:", error);
  }
}

// Run the check
checkUsers(); 
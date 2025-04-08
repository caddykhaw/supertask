import { db } from "../db/database.server";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

async function testDrizzle() {
  try {
    // Try to get the boss user by email
    const email = "bsytan_2000@gmail.com";
    console.log("Looking for user with email:", email);
    
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    
    if (user) {
      console.log("User found!");
      // Print user info (excluding password hash)
      const { passwordHash, ...userInfo } = user;
      console.log(JSON.stringify(userInfo, null, 2));
      // Just indicate if password hash exists
      console.log("Password hash exists:", !!passwordHash);
    } else {
      console.log("User not found");
    }
  } catch (error) {
    console.error("Error testing Drizzle:", error);
  }
}

// Run the test
testDrizzle(); 
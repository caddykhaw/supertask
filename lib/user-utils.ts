import { db } from "@/db/database.server";
import { users, UserRole } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth-compat";
import { hash } from "bcrypt";

// Helper function for ID generation that works in both environments
function generateId() {
  // Use crypto.randomUUID() when available (server-side)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older environments
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// User interface for the frontend
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

// Function to get all users (Boss only)
export async function getUsers() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.BOSS) {
    return [];
  }
  
  try {
    const userList = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);
    
    return userList;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Function to create a new user (Boss only)
export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.BOSS) {
    throw new Error("Unauthorized");
  }
  
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  
  if (!name || !email || !password) throw new Error("Name, email, and password are required");
  
  // Validate role
  if (role !== UserRole.BOSS && role !== UserRole.CLERK) {
    throw new Error("Invalid role");
  }
  
  try {
    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    
    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    
    // Hash password
    const passwordHash = await hash(password, 10);
    
    await db.insert(users).values({
      id: generateId(),
      name,
      email,
      passwordHash,
      role,
    });
    
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

// Function to update a user's role (Boss only)
export async function updateUserRole(userId: string, role: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.BOSS) {
    throw new Error("Unauthorized");
  }
  
  // Validate role
  if (role !== UserRole.BOSS && role !== UserRole.CLERK) {
    throw new Error("Invalid role");
  }
  
  // Prevent user from changing their own role
  if (userId === session.user.id) {
    throw new Error("Cannot change your own role");
  }
  
  try {
    await db.update(users)
      .set({ 
        role, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId));
    
    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
} 
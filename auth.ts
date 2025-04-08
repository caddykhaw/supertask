import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db/database.server";
import { UserRole, UserRoleType, users } from "./db/schema";
import { eq } from "drizzle-orm";
import { compare, hash } from "bcrypt";

// Helper function for ID generation that works in both client and server
function generateId() {
  // Use crypto.randomUUID() when available (server-side)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older environments
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Define custom session type with role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: string;
    };
  }
  
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
  }
}

// Create an auth handler configuration
const handler = NextAuth({
  debug: true, // Enable debug mode to see detailed logs
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    // Configure custom cookie options if needed
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  callbacks: {
    // Add role to JWT token
    async jwt({ token, user }) {
      console.log("JWT Callback - Token:", JSON.stringify(token));
      console.log("JWT Callback - User:", user ? JSON.stringify(user) : "No user");
      
      if (user) {
        token.role = user.role;
        token.id = user.id;
        console.log("JWT Callback - Added user data to token");
      }
      return token;
    },
    // Add role to session
    async session({ session, token }) {
      console.log("Session Callback - Session:", JSON.stringify(session));
      console.log("Session Callback - Token:", JSON.stringify(token));
      
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.sub as string;
        console.log("Session Callback - Added token data to session");
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("Auth attempt for email:", credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }
          
          // Look for the user in the database
          console.log("Querying database for email:", credentials.email);
          const user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email),
          });
          
          console.log("User found:", user ? "yes" : "no", "Email:", credentials.email);
          
          // If user not found, authentication fails
          if (!user) {
            console.log("User not found in database");
            return null;
          }
          
          if (!user.passwordHash) {
            console.log("User has no password hash set");
            return null;
          }
          
          // Verify password
          console.log("Verifying password...");
          const isValidPassword = await compare(credentials.password, user.passwordHash);
          console.log("Password match:", isValidPassword);
          
          if (!isValidPassword) {
            console.log("Invalid password");
            return null;
          }
          
          // Return user object in the format NextAuth expects
          console.log("Auth successful for:", user.email, "with role:", user.role);
          const authUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
          console.log("Returning user:", authUser);
          return authUser;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
}); 

export default handler;

// Helper functions for handling user creation
// These will be used in the boss dashboard to create clerk users
export async function createUser(name: string, email: string, password: string, role: UserRoleType = UserRole.CLERK) {
  // Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  
  if (existingUser) {
    throw new Error("User with this email already exists");
  }
  
  // Hash password
  const passwordHash = await hash(password, 10);
  
  // Create user
  const userId = generateId();
  await db.insert(users).values({
    id: userId,
    name,
    email,
    passwordHash,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  return { id: userId, name, email, role };
} 
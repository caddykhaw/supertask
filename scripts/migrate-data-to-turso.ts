import { createClient } from "@libsql/client";
import { drizzle as drizzleTurso } from "drizzle-orm/libsql";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";
import * as schema from "../db/schema";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";

dotenv.config();

// Get database configuration
const tursoDbUrl = process.env.DATABASE_URL || '';
const tursoDbAuthToken = process.env.DATABASE_AUTH_TOKEN || '';
const sqliteDbPath = join(process.cwd(), "sqlite.db");

// Validate configuration
if (!tursoDbUrl || !tursoDbUrl.includes('turso')) {
  console.error("ERROR: DATABASE_URL must be set to a Turso database URL");
  process.exit(1);
}

if (!tursoDbAuthToken) {
  console.error("ERROR: DATABASE_AUTH_TOKEN must be set");
  process.exit(1);
}

async function migrateData() {
  try {
    console.log("Connecting to databases...");
    
    // Initialize SQLite database
    const sqlite = new Database(sqliteDbPath);
    const sqliteDb = drizzleSqlite(sqlite, { schema });
    
    // Initialize Turso client
    const client = createClient({
      url: tursoDbUrl,
      authToken: tursoDbAuthToken,
    });
    const tursoDb = drizzleTurso(client, { schema });
    
    // Simplify by directly fetching and inserting data
    
    // Migrate users
    console.log("Migrating users...");
    
    // Get users from SQLite
    const users = sqlite.prepare("SELECT * FROM users").all() as any[];
    console.log(`Found ${users.length} users to migrate`);
    
    const userIdMapping = new Map<string, string>();
    
    for (const user of users) {
      const existingUserQuery = await client.execute({
        sql: "SELECT id FROM users WHERE email = ?",
        args: [user.email]
      });
      
      if (existingUserQuery.rows.length === 0) {
        // Create a new ID for the user
        const newUserId = randomUUID();
        userIdMapping.set(user.id, newUserId);
        
        // Insert into Turso
        await client.execute({
          sql: `
            INSERT INTO users (id, name, email, password_hash, emailVerified, image, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            newUserId,
            user.name,
            user.email,
            user.password_hash || null,
            user.emailVerified || null,
            user.image || null,
            user.role,
            user.created_at || Date.now(),
            user.updated_at || Date.now()
          ]
        });
        console.log(`Migrated user: ${user.name} (${user.email})`);
      } else {
        // Map the old ID to the existing ID in Turso
        const existingId = String(existingUserQuery.rows[0].id);
        userIdMapping.set(user.id, existingId);
        console.log(`User already exists in Turso: ${user.email} with ID: ${existingId}`);
      }
    }
    
    // Migrate tasks
    console.log("Migrating tasks...");
    const tasks = sqlite.prepare("SELECT * FROM tasks").all() as any[];
    console.log(`Found ${tasks.length} tasks to migrate`);
    
    for (const task of tasks) {
      // Map to the new user ID
      const newUserId = userIdMapping.get(task.user_id);
      
      if (!newUserId) {
        console.log(`Skipping task '${task.title}' as user (${task.user_id}) wasn't migrated`);
        continue;
      }
      
      // Check if task exists already
      const existingTaskQuery = await client.execute({
        sql: "SELECT id FROM tasks WHERE title = ? AND user_id = ?",
        args: [task.title, newUserId]
      });
      
      if (existingTaskQuery.rows.length === 0) {
        // Create a new ID for the task
        const newTaskId = randomUUID();
        
        await client.execute({
          sql: `
            INSERT INTO tasks (id, title, description, completed, due_date, user_id, created_at, updated_at, "order")
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            newTaskId,
            task.title,
            task.description || null,
            task.completed,
            task.due_date || null,
            newUserId,
            task.created_at || Date.now(),
            task.updated_at || Date.now(),
            task.order || 0
          ]
        });
        console.log(`Migrated task: ${task.title} for user ${newUserId}`);
      } else {
        console.log(`Task already exists: ${task.title} for user ${newUserId}`);
      }
    }
    
    // Close connections
    sqlite.close();
    await client.close();
    
    console.log("✅ Data migration completed successfully!");
  } catch (error) {
    console.error("❌ Data migration failed:", error);
    process.exit(1);
  }
}

migrateData().catch(console.error); 
import { db } from "@/db/database.server";
import { tasks, users, UserRole } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";

// Helper function to get session with old Next-Auth
async function getSession() {
  const cookieStore = cookies();
  const token = await getToken({ 
    req: { cookies: cookieStore } as any,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  if (!token) return null;
  
  return {
    user: {
      id: token.sub as string,
      role: token.role as string,
      name: token.name as string,
      email: token.email as string,
    }
  };
}

// Helper function for ID generation that works in both environments
function generateId() {
  // Use crypto.randomUUID() when available (server-side)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older environments
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Task interface for the frontend
export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: Date | null;
  userId: string;
  userName: string | null;
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

// Function to get tasks based on user role
export async function getTasks() {
  const session = await getSession();
  if (!session?.user) return [];
  
  const userRole = session.user.role;
  const userId = session.user.id;
  
  try {
    // Get all tasks if user is BOSS, otherwise get user's tasks + boss tasks
    let taskList;
    
    if (userRole === UserRole.BOSS) {
      taskList = await db.query.tasks.findMany({
        with: { user: true },
        columns: {
          id: true,
          title: true,
          description: true,
          completed: true,
          dueDate: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
          order: true
        }
      });
    } else {
      // For clerks: get their own tasks AND tasks created by users with boss role
      taskList = await db.query.tasks.findMany({
        with: { user: true },
        columns: {
          id: true,
          title: true,
          description: true,
          completed: true,
          dueDate: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
          order: true
        },
        where: sql`${tasks.userId} = ${userId} OR ${users.role} = ${UserRole.BOSS}`
      });
    }
    
    // Map results to include user name
    return taskList.map(task => ({
      ...task,
      userName: task.user?.name || null
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

// Function to get tasks grouped by date
export async function getTasksByDate() {
  const taskList = await getTasks();
  
  // Group tasks by date
  const tasksByDate = taskList.reduce((acc, task) => {
    const date = task.dueDate 
      ? formatDate(new Date(task.dueDate)) 
      : "No Due Date";
    
    if (!acc[date]) {
      acc[date] = [];
    }
    
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
  
  return tasksByDate;
}

// Helper function to format date in dd/mm/yyyy format
function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Function to create a new task
export async function createTask(formData: FormData) {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");
  
  const userId = session.user.id;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDateStr = formData.get("dueDate") as string;
  
  if (!title) throw new Error("Title is required");
  
  // Find highest order for current user's tasks to place new task at the end
  let maxOrder = 0;
  try {
    const tasksResult = await db.query.tasks.findMany({
      where: eq(tasks.userId, userId),
      orderBy: [desc(tasks.order)],
      columns: { order: true },
      limit: 1
    });
    
    maxOrder = tasksResult.length > 0 ? tasksResult[0].order + 1 : 0;
  } catch (error) {
    console.error("Error finding max order:", error);
  }
  
  try {
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;
    
    await db.insert(tasks).values({
      id: generateId(),
      title,
      description,
      dueDate,
      userId,
      order: maxOrder,
    });
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

// Function to update a task's completion status
export async function toggleTaskCompletion(taskId: string, completed: boolean) {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");
  
  const userId = session.user.id;
  const userRole = session.user.role;
  
  try {
    // If user is BOSS, they can update any task
    // For CLERK: can update their own tasks OR tasks created by BOSS users
    if (userRole === UserRole.BOSS) {
      await db.update(tasks)
        .set({ 
          completed, 
          updatedAt: new Date()
        })
        .where(eq(tasks.id, taskId));
    } else {
      // Get the task to check if it was created by a boss
      const taskWithUser = await db.query.tasks.findFirst({
        with: { user: true },
        where: eq(tasks.id, taskId)
      });
      
      if (!taskWithUser) {
        throw new Error("Task not found");
      }
      
      // Clerk can update if: it's their own task OR it was created by a boss
      if (taskWithUser.userId === userId || taskWithUser.user?.role === UserRole.BOSS) {
        await db.update(tasks)
          .set({ 
            completed, 
            updatedAt: new Date()
          })
          .where(eq(tasks.id, taskId));
      } else {
        throw new Error("Not authorized to update this task");
      }
    }
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, error: "Failed to update task" };
  }
}

// Function to update task order (for drag and drop)
export async function updateTaskOrder(taskId: string, newOrder: number) {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authenticated");
  
  const userId = session.user.id;
  const userRole = session.user.role;
  
  try {
    // If user is BOSS, they can reorder any task
    // If user is CLERK, they can only reorder their own tasks
    if (userRole === UserRole.BOSS) {
      await db.update(tasks)
        .set({ 
          order: newOrder, 
          updatedAt: new Date()
        })
        .where(eq(tasks.id, taskId));
    } else {
      await db.update(tasks)
        .set({ 
          order: newOrder, 
          updatedAt: new Date()
        })
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
    }
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating task order:", error);
    return { success: false, error: "Failed to update task order" };
  }
} 
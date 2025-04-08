import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/lib/task-utils";
import { getTasksByDate } from '@/lib/task-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await createTask(formData);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to create task" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in create task API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tasksByDate = await getTasksByDate();
    
    return NextResponse.json({
      success: true,
      tasksByDate
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
} 
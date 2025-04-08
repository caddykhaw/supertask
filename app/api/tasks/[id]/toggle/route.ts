import { NextRequest, NextResponse } from "next/server";
import { toggleTaskCompletion } from "@/lib/task-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { completed } = await request.json();
    
    const result = await toggleTaskCompletion(id, completed);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to update task" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in toggle task API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 
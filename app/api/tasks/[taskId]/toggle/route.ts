import { NextRequest, NextResponse } from "next/server";
import { toggleTaskCompletion } from "@/lib/task-utils";
import { revalidatePath } from "next/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const { completed } = await request.json();

    if (completed === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing completed status" },
        { status: 400 }
      );
    }

    const result = await toggleTaskCompletion(taskId, completed);

    // Revalidate paths to update the UI
    revalidatePath("/");
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error toggling task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle task" },
      { status: 500 }
    );
  }
} 
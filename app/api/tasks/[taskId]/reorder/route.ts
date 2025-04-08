import { NextRequest, NextResponse } from "next/server";
import { updateTaskOrder } from "@/lib/task-utils";
import { revalidatePath } from "next/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const { order } = await request.json();

    if (typeof order !== "number") {
      return NextResponse.json(
        { success: false, error: "Order must be a number" },
        { status: 400 }
      );
    }

    const result = await updateTaskOrder(taskId, order);
    
    // Revalidate paths to update the UI
    revalidatePath("/");
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error reordering task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder task" },
      { status: 500 }
    );
  }
} 
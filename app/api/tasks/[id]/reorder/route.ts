import { NextRequest, NextResponse } from "next/server";
import { updateTaskOrder } from "@/lib/task-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { order } = await request.json();
    
    const result = await updateTaskOrder(id, order);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to update task order" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in reorder task API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 
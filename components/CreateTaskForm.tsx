"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTasks } from "@/hooks/useTasks";

// Client-side action
async function createTaskClient(formData: FormData) {
  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      body: formData,
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

interface CreateTaskFormProps {
  onSuccess?: () => void;
}

export default function CreateTaskForm({ onSuccess }: CreateTaskFormProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { refreshTasks } = useTasks();
  
  async function handleSubmit(formData: FormData) {
    setIsCreating(true);
    
    try {
      const tasksText = formData.get("tasks") as string;
      const dueDate = formData.get("dueDate") as string;
      
      if (!tasksText.trim()) {
        toast.error("Please enter at least one task");
        return;
      }
      
      // Split tasks by new line
      const taskLines = tasksText.split("\n").filter(line => line.trim());
      
      if (taskLines.length === 0) {
        toast.error("Please enter at least one task");
        return;
      }
      
      // Create each task
      let successCount = 0;
      
      for (const line of taskLines) {
        // Extract title and description (optional)
        const parts = line.split(":");
        const title = parts[0].trim();
        const description = parts.length > 1 ? parts.slice(1).join(":").trim() : "";
        
        if (!title) continue;
        
        const newFormData = new FormData();
        newFormData.append("title", title);
        newFormData.append("description", description);
        
        // If dueDate is not provided, use current date
        if (dueDate) {
          newFormData.append("dueDate", dueDate);
        } else {
          // Format current date as YYYY-MM-DD
          const today = new Date();
          const formattedDate = today.toISOString().split('T')[0];
          newFormData.append("dueDate", formattedDate);
        }
        
        const result = await createTaskClient(newFormData);
        if (result.success) {
          successCount++;
        }
      }
      
      if (successCount > 0) {
        toast.success(`Created ${successCount} ${successCount === 1 ? "task" : "tasks"}`);
        
        // Reset form
        const form = document.getElementById("create-task-form") as HTMLFormElement;
        if (form) form.reset();
        
        // Refresh tasks to update UI
        refreshTasks();
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error("Failed to create tasks");
      }
    } catch (error) {
      toast.error("Error creating tasks");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  }
  
  return (
    <form action={handleSubmit} id="create-task-form" className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tasks">Tasks (one per line)</Label>
        <Textarea
          id="tasks"
          name="tasks"
          placeholder="Enter tasks here, one per line
Example: Buy groceries: milk, eggs, bread
Another task"
          rows={5}
          required
          className="resize-y"
        />
        <p className="text-xs text-muted-foreground">
          Tip: Add a colon (:) to include a description
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date (optional)</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
        />
      </div>
      
      <Button type="submit" disabled={isCreating}>
        {isCreating ? "Creating..." : "Create Tasks"}
      </Button>
    </form>
  );
} 
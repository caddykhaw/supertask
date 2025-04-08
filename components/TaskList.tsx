"use client";

import { useState } from "react";
import { Task } from "@/lib/task-utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement } from "@dnd-kit/modifiers";

// Client-side actions
async function toggleTaskCompletionClient(taskId: string, completed: boolean) {
  try {
    const response = await fetch(`/api/tasks/${taskId}/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error toggling task completion:", error);
    return { success: false, error: "Failed to update task" };
  }
}

async function updateTaskOrderClient(taskId: string, newOrder: number) {
  try {
    const response = await fetch(`/api/tasks/${taskId}/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: newOrder }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating task order:", error);
    return { success: false, error: "Failed to update task order" };
  }
}

interface TaskItemProps {
  task: Task;
  canEdit: boolean;
  onToggleComplete: (taskId: string, completed: boolean) => void;
}

function TaskItem({ task, canEdit, onToggleComplete }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggle = () => {
    if (canEdit) {
      onToggleComplete(task.id, !task.completed);
    } else {
      toast.error("You don't have permission to update this task");
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-4 border-b ${!canEdit ? "opacity-70" : ""}`}
    >
      <Button
        variant="ghost"
        className="px-2 cursor-grab"
        {...attributes}
        {...listeners}
        tabIndex={-1}
      >
        &#8942;
      </Button>
      
      <div className="flex items-center gap-3 flex-1">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={handleToggle}
          disabled={!canEdit}
        />
        
        <div className="flex flex-col">
          <label
            htmlFor={`task-${task.id}`}
            className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
          >
            {task.title}
          </label>
          
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
          
          <p className="text-xs text-muted-foreground">
            Added by {task.userName}
          </p>
        </div>
      </div>
    </div>
  );
}

interface TaskListProps {
  tasks: Task[];
  date: string;
  canEditAll: boolean;
}

export default function TaskList({ tasks, date, canEditAll }: TaskListProps) {
  const { session } = useAuth();
  const [taskItems, setTaskItems] = useState(tasks);
  
  // Check if user can edit a specific task
  const canEdit = (task: Task) => {
    if (!session?.user) return false;
    
    // Boss can edit all tasks
    if (session.user.role === "boss") return true;
    
    // Clerk can edit own tasks or mark boss tasks as complete/incomplete
    const isBossTask = task.userId !== session.user.id && 
                      Boolean(task.userName) && 
                      typeof task.userName === 'string' && 
                      task.userName !== session.user.name;
    
    return task.userId === session.user.id || isBossTask;
  };
  
  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const result = await toggleTaskCompletionClient(taskId, completed);
      
      if (result.success) {
        setTaskItems(taskItems.map(task => 
          task.id === taskId ? { ...task, completed } : task
        ));
        
        toast.success(completed ? "Task completed" : "Task uncompleted");
      } else {
        toast.error(result.error || "Failed to update task");
      }
    } catch (error) {
      toast.error("Error updating task");
      console.error(error);
    }
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      // Find the indexes
      const activeIndex = taskItems.findIndex(t => t.id === active.id);
      const overIndex = taskItems.findIndex(t => t.id === over.id);
      
      // Check if user can edit the task being dragged
      const taskToMove = taskItems[activeIndex];
      if (!canEdit(taskToMove)) {
        toast.error("You can only reorder your own tasks");
        return;
      }
      
      // Create new array with updated order
      const newItems = [...taskItems];
      const [movedItem] = newItems.splice(activeIndex, 1);
      newItems.splice(overIndex, 0, movedItem);
      
      // Update state immediately for better UX
      setTaskItems(newItems);
      
      // Save new order to database
      try {
        // Update the order value for the moved task
        await updateTaskOrderClient(movedItem.id, overIndex);
      } catch (error) {
        // Revert to original order if there's an error
        setTaskItems(tasks);
        toast.error("Error updating task order");
        console.error(error);
      }
    }
  };
  
  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <SortableContext items={taskItems.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {taskItems.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            canEdit={canEdit(task)}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
} 
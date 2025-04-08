import { Task } from "./task-utils";

// Client-side function to group tasks by date
export function groupTasksByDate(taskList: Task[]) {
  // Group tasks by date
  const tasksByDate = taskList.reduce((acc, task) => {
    const date = task.dueDate 
      ? new Date(task.dueDate).toLocaleDateString() 
      : "No Due Date";
    
    if (!acc[date]) {
      acc[date] = [];
    }
    
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
  
  return tasksByDate;
}

// Add any other client-side utility functions here 
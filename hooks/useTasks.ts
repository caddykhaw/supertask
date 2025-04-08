"use client";

import { useEffect, useState } from "react";
import { Task } from "@/lib/task-utils";

// Hook for fetching tasks
export function useTasks() {
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch tasks
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      setTasks(data.tasksByDate);
      setError(null);
    } catch (err) {
      setError('Error fetching tasks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch only when component mounts
  useEffect(() => {
    fetchTasks();
    // No more polling interval
  }, []);

  return {
    tasks,
    isLoading,
    error,
    refreshTasks: fetchTasks // Keep this for manual refreshes
  };
} 
"use client";

import { Suspense } from "react";
import TaskList from "@/components/TaskList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CollapsibleTaskForm from "@/components/CollapsibleTaskForm";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { tasks: tasksByDate, isLoading } = useTasks();
  const { session } = useAuth();
  
  // Sort dates to show most recent first, with "No Due Date" at the end
  const sortedDates = Object.keys(tasksByDate).sort((a, b) => {
    if (a === "No Due Date") return 1;
    if (b === "No Due Date") return -1;
    return new Date(a) > new Date(b) ? 1 : -1;
  });
  
  return (
    <div className="container w-2/3 mx-auto py-8">
      
      <div className="mb-8">
        <Suspense fallback={<div>Loading form...</div>}>
          <CollapsibleTaskForm />
        </Suspense>
      </div>
      
      <div className="space-y-8">
        {isLoading ? (
          <div className="text-center p-8">Loading tasks...</div>
        ) : (
          <>
            {sortedDates.map((date) => (
              <Card key={date} className="overflow-hidden">
                <CardHeader className="bg-muted">
                  <CardTitle>{date}</CardTitle>
                  <CardDescription>
                    {tasksByDate[date].length} task{tasksByDate[date].length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <TaskList 
                    tasks={tasksByDate[date]} 
                    date={date} 
                    canEditAll={session?.user?.role === "boss"}
                  />
                </CardContent>
              </Card>
            ))}
            
            {sortedDates.length === 0 && (
              <div className="text-center p-8 border rounded-lg">
                <p className="text-muted-foreground">No tasks found. Create some tasks to get started!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

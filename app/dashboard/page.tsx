import { getTasksByDate } from "@/lib/task-utils";
import { Suspense } from "react";
import TaskList from "@/components/TaskList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth-compat";
import CollapsibleTaskForm from "@/components/CollapsibleTaskForm";

export default async function DashboardPage() {
  const session = await auth();
  const tasksByDate = await getTasksByDate();
  
  // Sort dates to show most recent first, with "No Due Date" at the end
  const sortedDates = Object.keys(tasksByDate).sort((a, b) => {
    if (a === "No Due Date") return 1;
    if (b === "No Due Date") return -1;
    return new Date(a) > new Date(b) ? 1 : -1;
  });
  
  return (
    <div className="container w-2/3 mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">SuperTask Dashboard</h1>
      
      <div className="mb-8">
        <Suspense fallback={<div>Loading form...</div>}>
          <CollapsibleTaskForm />
        </Suspense>
      </div>
      
      <div className="space-y-8">
        {sortedDates.map((date) => (
          <Card key={date} className="overflow-hidden">
            <CardHeader className="bg-muted">
              <CardTitle>{date}</CardTitle>
              <CardDescription>
                {tasksByDate[date].length} task{tasksByDate[date].length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Suspense fallback={<div className="p-4">Loading tasks...</div>}>
                <TaskList 
                  tasks={tasksByDate[date]} 
                  date={date} 
                  canEditAll={session?.user?.role === "boss"}
                />
              </Suspense>
            </CardContent>
          </Card>
        ))}
        
        {sortedDates.length === 0 && (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground">No tasks found. Create some tasks to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
} 
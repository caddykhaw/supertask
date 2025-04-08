"use client";

import { useState } from "react";
import CreateTaskForm from "@/components/CreateTaskForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";

export default function CollapsibleTaskForm() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleTaskSuccess = () => {
    // Collapse the form after successful task creation
    setIsFormVisible(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
        <div>
          <CardTitle>Create New Tasks</CardTitle>
          <CardDescription>
            Enter multiple tasks at once, separated by new lines
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="ml-2"
          aria-label={isFormVisible ? "Hide task form" : "Show task form"}
        >
          {isFormVisible ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>
      </CardHeader>
      {!isFormVisible && (
        <div className="flex justify-center p-2">
          <Button 
            variant="outline" 
            onClick={() => setIsFormVisible(true)}
            className="w-full max-w-xs flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" /> Add New Tasks
          </Button>
        </div>
      )}
      <CardContent className={isFormVisible ? "block p-4" : "hidden"}>
        <CreateTaskForm onSuccess={handleTaskSuccess} />
      </CardContent>
    </Card>
  );
} 
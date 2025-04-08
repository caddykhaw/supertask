"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check for error in URL (from NextAuth)
  const errorParam = searchParams.get("error");
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
      console.log("Attempting login with:", { email, passwordLength: password?.length || 0 });
      
      // Ensure consistent parameter naming and add explicit CSRF token handling
      const result = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
        callbackUrl: "/",
      });
      
      console.log("Login result:", result);
      
      if (result?.ok) {
        toast.success("Login successful!");
        router.push("/");
        router.refresh();
      } else {
        console.error("Login failed:", result?.error);
        console.error("Login attempt details:", { email, passwordLength: password?.length || 0 });
        
        // Provide more specific error message based on what we know
        let errorMessage = "Login failed. Please check your credentials.";
        if (result?.error === "CredentialsSignin") {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (result?.error?.includes("CSRF")) {
          errorMessage = "Security token error. Please refresh the page and try again.";
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">要做什么...</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
          {(error || errorParam) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error || errorParam === "CredentialsSignin" ? "Invalid credentials" : errorParam}</span>
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="your.email@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 
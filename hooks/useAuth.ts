"use client";

import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

// Define session type based on our extended next-auth session
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface Session {
  user: User;
}

export function useAuth() {
  const { data: sessionData, status } = useSession();
  const loading = status === "loading";
  const session = sessionData as Session | null;

  return { 
    session, 
    loading,
    signIn, 
    signOut 
  };
} 
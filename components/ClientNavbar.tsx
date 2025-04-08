'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentPath } from "@/hooks/useCurrentPath";
import { signOut } from "next-auth/react";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";

// Define a type for the user prop
type User = {
  name?: string | null;
  email?: string | null;
  role?: string;
  image?: string | null;
};

export default function ClientNavbar({ user }: { user: User | null }) {
  const { isLoginPage } = useCurrentPath();
  const router = useRouter();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  // Don't render navbar on login page
  if (isLoginPage || !user) {
    return null;
  }
  
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    // Force a hard navigation to login page
    window.location.href = '/login';
  };

  const NavigationLinks = () => (
    <>
      <Link href="/">
        <Button variant="ghost" className="text-sm w-full justify-start md:w-auto">Dashboard</Button>
      </Link>
      
      {user.role === "boss" && (
        <Link href="/users">
          <Button variant="ghost" className="text-sm w-full justify-start md:w-auto">Users</Button>
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container w-2/3 mx-auto flex h-14 items-center justify-between">
        {/* Logo and branding */}
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
            <span className="hidden sm:inline-block">要做什么...</span>
            <span className="sm:hidden">ST</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <NavigationLinks />
        </nav>

        {/* Mobile navigation */}
        <div className="flex md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-6">
                <NavigationLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* User account section */}
        <div className="flex items-center gap-2 relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-8 w-8 relative"
            onClick={() => setShowAccountMenu(!showAccountMenu)}
          >
            <Avatar className="h-8 w-8">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name || "User"} />
              ) : (
                <AvatarFallback>
                  {user.name?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>
          </Button>

          {/* Account menu (absolute positioned) */}
          {showAccountMenu && (
            <div className="absolute right-0 top-10 w-56 z-[100] rounded-md border bg-white p-1 shadow-md" onClick={() => setShowAccountMenu(false)}>
              <div className="p-2 font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <p className="text-xs leading-none font-semibold mt-1">{user.role}</p>
                </div>
              </div>
              <div className="h-px bg-border my-1" />
              
              <div className="h-px bg-border my-1" />
              <button 
                className="relative flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent text-red-500"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 
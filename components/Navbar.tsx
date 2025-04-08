import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/db/schema";
import { auth } from "@/lib/auth-compat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SignOutButton from "./SignOutButton";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;
  
  return (
    <nav className="border-b">
      <div className="container w-2/3 mx-auto flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-xl">
          要做什么....
        </Link>
        
        {user ? (
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              
              {user.role === UserRole.BOSS && (
                <Link href="/users">
                  <Button variant="ghost">Users</Button>
                </Link>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>
                      {user.name?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div>
                    <p>{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs font-semibold">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                {user.role === UserRole.BOSS && (
                  <DropdownMenuItem asChild>
                    <Link href="/users">Manage Users</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <SignOutButton className="w-full text-left">Sign out</SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        )}
      </div>
    </nav>
  );
} 
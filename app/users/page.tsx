import { getUsers, createUser, User } from "@/lib/user-utils";
import { UserRole } from "@/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auth } from "@/lib/auth-compat";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await auth();
  
  // Make sure only Boss can access this page
  if (session?.user?.role !== UserRole.BOSS) {
    redirect("/dashboard");
  }
  
  const users: User[] = await getUsers();
  
  async function createUserAction(formData: FormData) {
    "use server";
    
    await createUser(formData);
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
            <CardDescription>Create a new user with Boss or Clerk role</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createUserAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select 
                  id="role" 
                  name="role" 
                  className="w-full p-2 border rounded-md"
                  defaultValue={UserRole.CLERK}
                >
                  <option value={UserRole.CLERK}>Clerk</option>
                  <option value={UserRole.BOSS}>Boss</option>
                </select>
              </div>
              <Button type="submit" className="w-full">Create User</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Existing Users</CardTitle>
            <CardDescription>Manage existing users and roles</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={user.role === UserRole.BOSS ? "text-blue-600 font-semibold" : ""}>
                        {user.role}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No users found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
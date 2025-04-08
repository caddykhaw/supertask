import { auth } from "@/lib/auth-compat";
import ClientNavbar from "./ClientNavbar";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user || null;
  
  // Only render the navbar if the user is authenticated
  if (!user) {
    return null;
  }
  
  return <ClientNavbar user={user} />;
} 
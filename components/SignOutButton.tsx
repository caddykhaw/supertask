'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SignOutButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function SignOutButton({ children, className }: SignOutButtonProps) {
  const router = useRouter();

  const handleSignOut = async (e: React.MouseEvent) => {
    // Prevent the event from bubbling up to parent elements
    e.preventDefault();
    e.stopPropagation();
    
    try {
      toast.loading('Signing out...');
      
      // Sign out with NextAuth and redirect to login page
      await signOut({ 
        redirect: true,
        callbackUrl: '/login'
      });
      
      // Note: The code below will only run if redirect: false was set
      // or if there was an issue with the redirect
      toast.success('Successfully signed out');
      router.replace('/login');
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error('Failed to sign out completely');
      
      // Attempt to redirect anyway
      router.replace('/login');
    }
  };

  return (
    <button 
      onClick={handleSignOut} 
      className={className} 
      type="button"
    >
      {children}
    </button>
  );
} 
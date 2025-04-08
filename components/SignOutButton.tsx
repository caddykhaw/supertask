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
      
      // Sign out with NextAuth - explicitly set redirect to false to handle it manually
      await signOut({ 
        redirect: false
      });
      
      toast.success('Successfully signed out');
      
      // Manually force a hard navigation to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error('Failed to sign out completely');
      
      // Force navigation to login page even if there's an error
      window.location.href = '/login';
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
'use client';

import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SignOutButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function SignOutButton({ children, className }: SignOutButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // 1. First reset server-side session (clear cookies and server-side state)
      try {
        await fetch('/api/auth/reset-session', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        console.error('Failed to reset session on server:', e);
      }
      
      // 2. Sign out with NextAuth - disable automatic redirect to control the flow
      await signOut({ 
        redirect: false
      });
      
      // 3. Clear client-side storage
      localStorage.removeItem('supertask-preferences');
      sessionStorage.clear();
      
      // Force revalidation of all future requests
      router.refresh();
      
      // Clear any client-side cache
      if (typeof caches !== 'undefined') {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
        } catch (e) {
          console.error('Failed to clear caches:', e);
        }
      }
      
      // 4. Clean redirect to login page (without query parameters that expose logout state)
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
    <button onClick={handleSignOut} className={className}>
      {children}
    </button>
  );
} 
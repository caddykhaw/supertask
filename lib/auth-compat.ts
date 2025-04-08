import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';

// Server-side authentication helper
export async function auth() {
  try {
    const cookieStore = cookies();
    const token = await getToken({ 
      req: { cookies: cookieStore } as any,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    if (!token) return null;
    
    return {
      user: {
        id: token.sub as string,
        role: token.role as string,
        name: token.name as string,
        email: token.email as string,
      }
    };
  } catch (error) {
    console.error('Error in auth function:', error);
    return null;
  }
} 
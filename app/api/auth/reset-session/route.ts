import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth-compat';

export async function POST() {
  try {
    // Get the session to identify the user
    const session = await auth();
    
    // If no session, no need to do anything
    if (!session) {
      return NextResponse.json({ success: true, message: 'No active session' });
    }

    // Clear all cookies that might be related to authentication
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    // Clear auth-related cookies
    for (const cookie of allCookies) {
      if (
        cookie.name.includes('next-auth') || 
        cookie.name.includes('__Secure') ||
        cookie.name.includes('supertask')
      ) {
        cookieStore.delete(cookie.name);
      }
    }

    return NextResponse.json({ success: true, message: 'Session reset successfully' });
  } catch (error) {
    console.error('Error resetting session:', error);
    return NextResponse.json({ success: false, message: 'Failed to reset session' }, { status: 500 });
  }
} 
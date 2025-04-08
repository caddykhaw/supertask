'use client';

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

// Client-side authentication helpers
export const signIn = nextAuthSignIn;
export const signOut = nextAuthSignOut; 
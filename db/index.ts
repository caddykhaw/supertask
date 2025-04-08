// This file serves as a safe entry point for both client and server components
// It re-exports what's needed from the server-only file

// Re-export schema for type usage (doesn't contain node: imports)
export * from './schema';

// For server-side only code, directly import from database.server.ts 
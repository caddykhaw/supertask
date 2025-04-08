import type { Config } from "drizzle-kit";
import { join } from "path";
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

// Check if using remote database (Turso) or local SQLite
const isTurso = process.env.DATABASE_URL?.includes('turso');

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || './sqlite.db',
  },
}) satisfies Config; 
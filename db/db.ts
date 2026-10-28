/**
 * db.ts — the shared phone line to the database.
 *
 * One connection pool, created once, borrowed by whichever route needs it.
 * The secret comes from the environment: .env.local when running on your
 * machine, Vercel's settings when running in production. Code never hardcodes it.
 */
import { Pool } from "@neondatabase/serverless";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

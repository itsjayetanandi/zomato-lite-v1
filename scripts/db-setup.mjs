/**
 * db-setup.mjs — the reset button for the database.
 *
 * Connects to the Neon Postgres database using the secret stored in .env.local,
 * wipes any existing tables, rebuilds the schema from db/schema.sql,
 * seeds starting data from db/seed.sql, then prints what it created.
 *
 * Run it with: npm run db:setup
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "@neondatabase/serverless";

// db-setup lives in scripts/, so the project root is one folder up from here.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// The serverless driver speaks to Neon over the network using the
// DATABASE_URL secret. Node injects .env.local contents into process.env
// for us (that is the --env-file part of the npm script).
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 1. Tear down anything already there (children first: photos and reviews
//    point at restaurants, so they must be removed before the table they
//    point at — Postgres enforces this).
await pool.query(
  "DROP TABLE IF EXISTS restaurant_photos; DROP TABLE IF EXISTS reviews; DROP TABLE IF EXISTS restaurants;"
);

// 2. Apply the blueprint.
await pool.query(readFileSync(join(root, "db", "schema.sql"), "utf8"));

// 3. Insert the opening data.
await pool.query(readFileSync(join(root, "db", "seed.sql"), "utf8"));

// 4. Read back and show, newest review first.
const reviews = await pool.query(
  `SELECT r.id, r.name, r.cuisine, r.area,
          v.id AS review_id, v.rating, v.comment, v.created_at
   FROM restaurants r
   JOIN reviews v ON v.restaurant_id = r.id
   ORDER BY v.created_at DESC`
);

const restaurants = await pool.query("SELECT * FROM restaurants ORDER BY id;");
const reviewsList = await pool.query(
  "SELECT * FROM reviews ORDER BY created_at DESC;"
);

console.log("Tables rebuilt. Rows now in the database:\n");
console.log("restaurants:", JSON.stringify(restaurants.rows, null, 2));
console.log("\nreviews:", JSON.stringify(reviewsList.rows, null, 2));

await pool.end();

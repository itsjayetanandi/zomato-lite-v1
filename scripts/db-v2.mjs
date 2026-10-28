/**
 * db-v2.mjs — the Swaad reset button (run with: npm run db:v2).
 *
 * Always rebuilds from scratch, which is what makes it safe to run twice:
 *   1. Drop the three tables (children first — photos, then reviews, then restaurants;
 *      Postgres refuses to drop a table that another table still points at).
 *   2. Re-apply the blueprint (db/schema.sql).
 *   3. Re-insert the six restaurants and their reviews (db/seed-v2.sql).
 *   4. Scan public/images for files named r{restaurantId}-{n}.jpg and insert one
 *      restaurant_photos row per file, with a short caption you can edit later.
 *   5. Print everything it created.
 *
 * WARNING: this replaces ALL current restaurants, reviews and photos.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "@neondatabase/serverless";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 1. Tear down (children before parents).
await pool.query(
  "DROP TABLE IF EXISTS restaurant_photos; DROP TABLE IF EXISTS reviews; DROP TABLE IF EXISTS restaurants;"
);

// 2. Blueprint.
await pool.query(readFileSync(join(root, "db", "schema.sql"), "utf8"));

// 3. Restaurants + reviews.
await pool.query(readFileSync(join(root, "db", "seed-v2.sql"), "utf8"));

// 4. Photos: one row per r{n}-{k}.jpg file found in public/images.
const imagesDir = join(root, "public", "images");
const CAPTIONS = [
  "The space",
  "A house favourite",
  "From the counter",
  "Fresh from the kitchen",
  "On the table",
  "Made this morning",
];

let photoRows = [];
if (existsSync(imagesDir)) {
  const files = readdirSync(imagesDir)
    .filter((name) => /^r\d+-\d+\.jpe?g$/i.test(name))
    .sort((a, b) => {
      const pa = a.match(/^r(\d+)-(\d+)/);
      const pb = b.match(/^r(\d+)-(\d+)/);
      return Number(pa[1]) - Number(pb[1]) || Number(pa[2]) - Number(pb[2]);
    });
  for (const file of files) {
    const parts = file.match(/^r(\d+)-(\d+)/);
    const restaurantId = Number(parts[1]);
    const position = Number(parts[2]);
    const caption = CAPTIONS[(position - 1) % CAPTIONS.length];
    await pool.query(
      "INSERT INTO restaurant_photos (restaurant_id, url, caption, position) VALUES ($1, $2, $3, $4)",
      [restaurantId, `/images/${file}`, caption, position]
    );
    photoRows.push({ restaurant_id: restaurantId, url: `/images/${file}`, caption, position });
  }
  console.log(`Found ${files.length} photo file(s) in public/images.`);
} else {
  console.log("(No public/images folder yet — no photo rows added. Drop your photos in and run npm run db:v2 again.)");
}

// 5. Report.
const restaurants = await pool.query(
  "SELECT id, name, cuisine, area FROM restaurants ORDER BY id"
);
const reviews = await pool.query(
  "SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY restaurant_id, created_at DESC"
);
const photos = await pool.query(
  "SELECT restaurant_id, url, caption, position FROM restaurant_photos ORDER BY restaurant_id, position"
);

console.log("\nrestaurants:", JSON.stringify(restaurants.rows, null, 2));
console.log(`\nreviews (${reviews.rows.length} rows):`, JSON.stringify(reviews.rows, null, 2));
console.log(`\nrestaurant_photos (${photos.rows.length} rows):`, JSON.stringify(photos.rows, null, 2));

await pool.end();

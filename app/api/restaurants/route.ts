/**
 * route.ts — GET /api/restaurants
 *
 * The home page's data source: every restaurant, with its rating facts
 * computed by SQL at this very moment (AVG + COUNT, grouped per restaurant),
 * and its cover photo (lowest position) or null.
 *
 * averageRating is null when a restaurant has no reviews. The frontend
 * receives finished numbers and prints them — zero maths there.
 */
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function GET() {
  const result = await pool.query(`
    SELECT r.id, r.name, r.cuisine, r.area,
           COUNT(v.id)::int AS total,
           ROUND(AVG(v.rating)::numeric, 1) AS average,
           (
             SELECT p.url
             FROM restaurant_photos p
             WHERE p.restaurant_id = r.id
             ORDER BY p.position ASC, p.id ASC
             LIMIT 1
           ) AS cover
    FROM restaurants r
    LEFT JOIN reviews v ON v.restaurant_id = r.id
    GROUP BY r.id
    ORDER BY r.id ASC
  `);

  // COUNT(v.id), not COUNT(*): with a LEFT JOIN, a restaurant with no reviews
  // still produces one joined row — COUNT(*) would report it as 1 review.
  const restaurants = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    cuisine: row.cuisine,
    area: row.area,
    averageRating: row.average === null ? null : Number(row.average),
    totalReviews: row.total,
    coverPhoto: row.cover ?? null,
  }));

  return NextResponse.json(restaurants);
}

/**
 * route.ts — GET /api/restaurants/[id]
 *
 * The report generator. Answers: "what should the restaurant page show?"
 *
 * Returns HTTP 404 if the restaurant doesn't exist. Otherwise:
 *   name, cuisine, area                  — facts, straight from the table
 *   averageRating                        — ROUND(AVG(rating), 1), computed right now
 *   totalReviews                         — COUNT(*), computed right now
 *   latestReview                         — the newest review by created_at
 *   reviews                              — every review EXCEPT the latest, newest first
 *
 * With no reviews at all (a healthy young product, not an error):
 *   averageRating: null, totalReviews: 0, latestReview: null, reviews: []
 */
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

/** Backend-only date arithmetic: turn one timestamp into "2 days ago". */
function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const restaurantId = Number(id);

  // A restaurant that "doesn't exist" includes ids that aren't numbers at all.
  if (!Number.isInteger(restaurantId)) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  // Facts about the restaurant itself.
  const restaurant = await pool.query(
    "SELECT name, cuisine, area FROM restaurants WHERE id = $1",
    [restaurantId]
  );
  if (restaurant.rows.length === 0) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  // The two conclusions, computed by the database this very moment.
  // COUNT(*) is a bigint in Postgres; ::int makes the driver hand back a number.
  // ROUND(AVG(rating)::numeric, 1) gives e.g. 4.3 — one decimal, backend-side.
  const stats = await pool.query(
    `SELECT COUNT(*)::int AS total,
            ROUND(AVG(rating)::numeric, 1) AS average
     FROM reviews
     WHERE restaurant_id = $1`,
    [restaurantId]
  );
  const totalReviews = stats.rows[0].total;
  const averageRating = stats.rows[0].average === null ? null : Number(stats.rows[0].average);

  // Every review for this restaurant, newest first.
  // (id DESC as a tiebreaker: two reviews at the same instant, later id wins.)
  const allReviews = await pool.query(
    `SELECT id, rating, comment, created_at
     FROM reviews
     WHERE restaurant_id = $1
     ORDER BY created_at DESC, id DESC`,
    [restaurantId]
  );

  // Photos, position order. Empty array if there are none — a healthy
  // state, not an error.
  const photos = await pool.query(
    `SELECT url, caption
     FROM restaurant_photos
     WHERE restaurant_id = $1
     ORDER BY position ASC, id ASC`,
    [restaurantId]
  );

  // Shape each row for the outside world: camelCase keys, ISO timestamp,
  // and a ready-made "2 days ago" string — no date maths on the frontend.
  const shaped = allReviews.rows.map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at.toISOString(),
    timeAgo: timeAgo(row.created_at),
  }));

  return NextResponse.json({
    name: restaurant.rows[0].name,
    cuisine: restaurant.rows[0].cuisine,
    area: restaurant.rows[0].area,
    averageRating,
    totalReviews,
    latestReview: shaped[0] ?? null,
    reviews: shaped.slice(1),
    photos: photos.rows.map((p) => ({ url: p.url, caption: p.caption })),
  });
}

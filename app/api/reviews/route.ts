/**
 * route.ts — POST /api/reviews
 *
 * The review desk. Accepts one review as JSON:
 *   { "restaurantId": 1, "rating": 4, "comment": "Good, but slow service" }
 *
 * Validates in this order (cheapest first, database last):
 *   1. rating is a whole number from 1 to 5
 *   2. comment is a non-empty string after trimming whitespace
 *   3. restaurantId refers to a restaurant that actually exists
 *
 * On the first failure: HTTP 400 with a plain-English reason.
 * On success: inserts exactly one row, HTTP 201 with the new review's id.
 */
import { NextResponse } from "next/server";
import { pool } from "@/db/db";

export async function POST(request: Request) {
  // Read the JSON the caller sent. If it isn't valid JSON at all, reject early.
  const body = await request.json().catch(() => null);
  if (body === null || typeof body !== "object") {
    return NextResponse.json(
      { error: "Send JSON shaped like { restaurantId, rating, comment }." },
      { status: 400 }
    );
  }
  const { restaurantId, rating, comment } = body as {
    restaurantId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  // Check 1 — the rating.
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be a whole number from 1 to 5." },
      { status: 400 }
    );
  }

  // Check 2 — the comment. Trim removes spaces from both ends,
  // so "   " (all whitespace) counts as empty.
  if (typeof comment !== "string" || comment.trim() === "") {
    return NextResponse.json(
      { error: "Comment can't be empty." },
      { status: 400 }
    );
  }

  // Check 3 — the restaurant must really exist. This is the database lookup.
  const restaurantIdNum = Number(restaurantId);
  if (!Number.isInteger(restaurantIdNum)) {
    return NextResponse.json(
      { error: "restaurantId must be a number." },
      { status: 400 }
    );
  }
  const found = await pool.query(
    "SELECT id FROM restaurants WHERE id = $1",
    [restaurantIdNum]
  );
  if (found.rows.length === 0) {
    return NextResponse.json(
      { error: `Restaurant ${restaurantIdNum} doesn't exist.` },
      { status: 400 }
    );
  }

  // All three checks passed. Store the fact. One row, nothing derived.
  const inserted = await pool.query(
    "INSERT INTO reviews (restaurant_id, rating, comment) VALUES ($1, $2, $3) RETURNING id",
    [restaurantIdNum, rating, comment.trim()]
  );

  return NextResponse.json(
    { success: true, reviewId: inserted.rows[0].id },
    { status: 201 }
  );
}

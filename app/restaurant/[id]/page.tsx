"use client";

/**
 * page.tsx — GET /restaurant/[id], the visitor's screen.
 *
 * Calls GET /api/restaurants/[id] and prints what it gets, top to bottom:
 *   name → average (huge) → latest review (highlighted) → older reviews → write-a-review link.
 * No reviews yet? An invitation to write the first one.
 *
 * The frontend does zero maths. It receives 4.5 and prints 4.5.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/TopBar";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantDetail = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

/** Draw one fact (a rating) as star glyphs. Presentation, not arithmetic. */
function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`}>
      <span className="text-accent">{"★".repeat(rating)}</span>
      <span className="text-border">{"☆".repeat(5 - rating)}</span>
    </span>
  );
}

/** Format one fact (a timestamp) for reading. Presentation, not arithmetic. */
function ShortDate({ iso }: { iso: string }) {
  return (
    <time dateTime={iso}>
      {new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
    </time>
  );
}

export default function RestaurantPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = params.id;

  const [detail, setDetail] = useState<RestaurantDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/restaurants/${restaurantId}`)
      .then(async (res) => {
        if (!res.ok) {
          if (!cancelled) setFailed(true);
          return;
        }
        const data: RestaurantDetail = await res.json();
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  if (failed) {
    return (
      <>
        <TopBar />
        <main className="mx-auto max-w-[560px] px-6 py-16">
          <p className="text-sm text-muted">Restaurant not found.</p>
        </main>
      </>
    );
  }

  if (detail === null) {
    return (
      <>
        <TopBar />
        <main className="mx-auto max-w-[560px] px-6 py-16">
          <p className="text-sm text-muted">Loading…</p>
        </main>
      </>
    );
  }

  const hasReviews = detail.totalReviews > 0;

  return (
    <>
      <TopBar area={detail.area} />
      <main className="mx-auto max-w-[560px] px-6 py-16">
      {/* 1. Who this page is about */}
      <h1 className="text-2xl font-semibold tracking-tight">{detail.name}</h1>
      <p className="mt-1 text-sm text-muted">
        {detail.cuisine} · {detail.area}
      </p>

      {/* 2. The score, received fully computed — printed, not calculated */}
      <div className="mt-12 flex items-baseline gap-3">
        <p className="text-6xl font-semibold tracking-tight text-accent">
          {detail.averageRating ?? "—"}
        </p>
        <p className="text-sm text-muted">
          {detail.totalReviews} {detail.totalReviews === 1 ? "review" : "reviews"}
        </p>
      </div>

      {hasReviews ? (
        <>
          {/* 3. The newest review, set apart */}
          {detail.latestReview !== null && (
            <section className="mt-12">
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
                Latest review
              </h2>
              <div className="mt-3 rounded-xl border border-accent/25 bg-card p-5">
                <Stars rating={detail.latestReview.rating} />
                <p className="mt-2 text-sm leading-relaxed">{detail.latestReview.comment}</p>
                <p className="mt-3 text-xs text-muted">
                  <ShortDate iso={detail.latestReview.createdAt} />
                </p>
              </div>
            </section>
          )}

          {/* 4. Everything older, newest first — the backend already sorted it */}
          {detail.reviews.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
                Earlier reviews
              </h2>
              <ul className="mt-2 divide-y divide-border">
                {detail.reviews.map((review) => (
                  <li key={review.id} className="py-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <Stars rating={review.rating} />
                      <span className="text-xs text-muted">
                        <ShortDate iso={review.createdAt} />
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed">{review.comment}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 5. The invitation to add one */}
          <div className="mt-12">
            <Link
              href={`/review/${restaurantId}`}
              className="inline-block rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
            >
              Write a review
            </Link>
          </div>
        </>
      ) : (
        /* 6. The empty state: nobody has reviewed yet — an invitation, not an error */
        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted">
            No reviews yet. Be the first to share how it was.
          </p>
          <Link
            href={`/review/${restaurantId}`}
            className="mt-4 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Write the first review
          </Link>
        </div>
      )}
    </main>
    </>
  );
}

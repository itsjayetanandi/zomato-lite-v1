"use client";

/**
 * page.tsx — the Swaad restaurant page (/restaurant/[id]).
 *
 * Calls GET /api/restaurants/[id] and prints, top to bottom:
 *   photo carousel → name → rating pill + Write-a-review → latest review
 *   → all reviews → (or the empty state) → back link.
 *
 * The frontend does zero maths: the average arrives computed, the order
 * arrives decided, "2 days ago" arrives as a finished string. The only
 * arithmetic here is carousel bookkeeping (which photo is showing).
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/TopBar";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  timeAgo: string;
};

type Photo = { url: string; caption: string };

type RestaurantDetail = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
  photos: Photo[];
};

/** Draw one fact (a rating) as star glyphs. Presentation, not arithmetic. */
function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const textSize = size === "lg" ? "text-xl" : "text-sm";
  return (
    <span aria-label={`${rating} out of 5 stars`} className={textSize}>
      <span className="text-accent">{"★".repeat(rating)}</span>
      <span className="text-border">{"☆".repeat(5 - rating)}</span>
    </span>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RestaurantPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = params.id;

  const [detail, setDetail] = useState<RestaurantDetail | null>(null);
  const [failed, setFailed] = useState(false);

  // Carousel bookkeeping: which photo is on screen right now.
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

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

  // Carousel helpers — arithmetic on scroll pixels only, never on data.
  function handleTrackScroll() {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActivePhoto(index);
  }
  function goToPhoto(index: number) {
    const track = trackRef.current;
    const count = detail?.photos.length ?? 0;
    if (!track || count === 0) return;
    const clamped = Math.max(0, Math.min(count - 1, index));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setActivePhoto(clamped);
  }

  if (failed) {
    return (
      <>
        <TopBar />
        <main className="mx-auto max-w-[640px] px-4 py-16 sm:px-6">
          <p className="text-sm text-muted">Restaurant not found.</p>
        </main>
      </>
    );
  }

  if (detail === null) {
    return (
      <>
        <TopBar />
        <main className="mx-auto max-w-[640px] px-4 py-16 sm:px-6">
          <p className="text-sm text-muted">Loading…</p>
        </main>
      </>
    );
  }

  const hasReviews = detail.totalReviews > 0;
  const photos = detail.photos;

  return (
    <>
      <TopBar area={detail.area} />
      <main className="mx-auto max-w-[640px] px-4 pb-16 pt-6 sm:px-6">
        {/* 1. Photo carousel: snap-scroll strip, swipe on touch, arrows on desktop */}
        {photos.length > 0 ? (
          <div className="relative">
            <div
              ref={trackRef}
              onScroll={handleTrackScroll}
              className="no-scrollbar flex aspect-video snap-x snap-mandatory overflow-x-auto rounded-2xl"
            >
              {photos.map((photo) => (
                <div
                  key={photo.url}
                  className="relative w-full shrink-0 snap-center"
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption}
                    fill
                    sizes="(max-width: 640px) 100vw, 640px"
                    className="object-cover"
                    priority={photo === photos[0]}
                  />
                  {/* the caption strip */}
                  <p className="absolute inset-x-0 bottom-0 bg-black/55 px-4 py-2.5 text-xs font-medium text-white">
                    {photo.caption}
                  </p>
                </div>
              ))}
            </div>

            {/* desktop arrows */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goToPhoto(activePhoto - 1)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-white/90 p-2 text-foreground shadow-sm transition-colors hover:bg-white sm:inline-flex"
                >
                  <ChevronIcon direction="left" />
                </button>
                <button
                  type="button"
                  onClick={() => goToPhoto(activePhoto + 1)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-white/90 p-2 text-foreground shadow-sm transition-colors hover:bg-white sm:inline-flex"
                >
                  <ChevronIcon direction="right" />
                </button>
              </>
            )}

            {/* dots */}
            {photos.length > 1 && (
              <div className="mt-3 flex justify-center gap-1.5">
                {photos.map((photo, i) => (
                  <button
                    key={photo.url}
                    type="button"
                    onClick={() => goToPhoto(i)}
                    aria-label={`Go to photo ${i + 1}`}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      i === activePhoto ? "bg-accent" : "bg-border"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* 2. Placeholder when there are no photos */
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-[#f6f1ec]">
            <span className="text-6xl font-bold text-accent/70">
              {detail.name.charAt(0)}
            </span>
          </div>
        )}

        {/* 3. Who this page is about */}
        <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
          {detail.name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {detail.cuisine} · {detail.area}
        </p>

        {/* 4 + 5. The rating pill and the prominent write-a-review button */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {detail.averageRating !== null ? (
              <span className="flex items-center gap-1 rounded-full bg-green px-2.5 py-1 text-xs font-semibold text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                  <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
                </svg>
                {detail.averageRating}
              </span>
            ) : (
              <span className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted">
                New
              </span>
            )}
            <span className="text-xs text-muted">
              {detail.totalReviews} {detail.totalReviews === 1 ? "review" : "reviews"}
            </span>
          </div>
          <Link
            href={`/review/${restaurantId}`}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
          >
            Write a review
          </Link>
        </div>

        {hasReviews ? (
          <>
            {/* 6. The latest review, set apart */}
            {detail.latestReview !== null && (
              <section className="mt-10">
                <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
                  Latest review
                </h2>
                <div className="mt-3 rounded-2xl border border-accent/25 bg-card p-5 shadow-sm">
                  <Stars rating={detail.latestReview.rating} size="lg" />
                  <p className="mt-2 text-sm leading-relaxed">
                    {detail.latestReview.comment}
                  </p>
                  <p className="mt-3 text-xs text-muted">
                    {detail.latestReview.timeAgo}
                  </p>
                </div>
              </section>
            )}

            {/* 7. All the older reviews as clean cards, newest first as sent */}
            {detail.reviews.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
                  All reviews
                </h2>
                <div className="mt-3 space-y-3">
                  {detail.reviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <Stars rating={review.rating} />
                        <span className="text-xs text-muted">{review.timeAgo}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          /* 8. The empty state: an invitation, not an error */
          <div className="mt-10 rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted">
              No reviews yet. Be the first to share how it was.
            </p>
            <Link
              href={`/review/${restaurantId}`}
              className="mt-4 inline-block rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
            >
              Write the first review
            </Link>
          </div>
        )}

        {/* 9. Back to the list */}
        <div className="mt-12">
          <Link
            href="/"
            className="text-sm font-medium text-muted transition-colors hover:text-accent"
          >
            ← Back to all restaurants
          </Link>
        </div>
      </main>
    </>
  );
}

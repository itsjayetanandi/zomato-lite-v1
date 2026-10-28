"use client";

/**
 * page.tsx — /review/[restaurantId], the writing desk.
 *
 * Header (first photo + name + area) → big tappable stars with a changing
 * label → comment box → full-width Submit (disabled until rating + comment).
 * On submit: POST /api/reviews, then redirect to the restaurant page.
 * If the backend returns 400, its message is shown word for word.
 */
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";

// Fixed labels — chosen text for each rating. Not a calculation.
const RATING_LABELS: Record<number, string> = {
  1: "Terrible",
  2: "Bad",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

export default function ReviewPage() {
  const params = useParams<{ restaurantId: string }>();
  const restaurantId = params.restaurantId;
  const router = useRouter();

  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [restaurantArea, setRestaurantArea] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // The restaurant's facts, so the writer knows what they're reviewing.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/restaurants/${restaurantId}`)
      .then(async (res) => {
        if (!res.ok) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setRestaurantName(data.name);
          setRestaurantArea(data.area);
          setThumbnail(data.photos?.[0]?.url ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  // The gate: a rating is picked AND the comment is not just whitespace.
  const canSubmit = rating !== null && comment.trim() !== "" && !submitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          rating,
          comment,
        }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok) {
        router.push(`/restaurant/${restaurantId}`);
        return;
      }

      // The backend refused. Show its reason, exactly as it said it.
      setError(data?.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
    } catch {
      // No backend message exists in this case (the request never landed).
      setError("Couldn't reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  if (notFound) {
    return (
      <>
        <TopBar />
        <main className="mx-auto max-w-[640px] px-4 py-16 sm:px-6">
          <p className="text-sm text-muted">Restaurant not found.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar area={restaurantArea} />
      <main className="mx-auto max-w-[640px] px-4 pb-16 pt-6 sm:px-6">
        {/* 1. Small header: first photo as thumbnail, name, area */}
        <div className="flex items-center gap-3">
          {thumbnail ? (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
              <Image
                src={thumbnail}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f6f1ec] text-xl font-bold text-accent/70">
              {(restaurantName ?? "?").charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">
              {restaurantName ?? "Loading…"}
            </h1>
            <p className="truncate text-xs text-muted">{restaurantArea}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-10">
          {/* 2. Large tappable stars (44px targets) with a changing label */}
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            Your rating
          </p>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => {
              const selected = rating !== null && n <= rating;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`Rate ${n}: ${RATING_LABELS[n]}`}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg text-3xl leading-none transition-colors ${
                    selected ? "text-accent" : "text-border hover:text-accent/50"
                  }`}
                >
                  ★
                </button>
              );
            })}
          </div>
          {/* the changing label; fixed height so nothing jumps */}
          <p
            className="mt-2 h-5 text-sm font-medium"
            aria-live="polite"
          >
            {rating === null ? (
              <span className="text-muted">Select a rating</span>
            ) : (
              RATING_LABELS[rating]
            )}
          </p>

          {/* 3. The comment box */}
          <label
            htmlFor="comment"
            className="mt-8 block text-xs font-medium uppercase tracking-widest text-muted"
          >
            Your review
          </label>
          <textarea
            id="comment"
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you think? Keep it honest — other diners will read it."
            className="mt-3 w-full resize-none rounded-xl border border-border bg-card p-4 text-sm leading-relaxed outline-none transition-colors focus:border-accent"
          />

          {/* 5. Errors in a soft red box, exactly as the backend said them */}
          {error !== null && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* 4. Full-width Submit with the gate and the loading state */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-6 w-full rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Saving…" : "Submit review"}
          </button>
        </form>
      </main>
    </>
  );
}

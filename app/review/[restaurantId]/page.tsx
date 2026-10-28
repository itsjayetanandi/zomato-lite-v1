"use client";

/**
 * page.tsx — /review/[restaurantId], the writing desk.
 *
 * Star picker + comment box + Submit (disabled until both are real).
 * On submit: POST /api/reviews, then redirect to the restaurant page.
 * If the backend returns 400, we print ITS error message, word for word.
 */
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";

export default function ReviewPage() {
  const params = useParams<{ restaurantId: string }>();
  const restaurantId = params.restaurantId;
  const router = useRouter();

  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [restaurantArea, setRestaurantArea] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // The restaurant's name, so the writer knows what they're reviewing.
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
        // Success: go see the page that now includes this review.
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
        <main className="mx-auto max-w-[560px] px-6 py-16">
          <p className="text-sm text-muted">Restaurant not found.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar area={restaurantArea} />
      <main className="mx-auto max-w-[560px] px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        {restaurantName ?? "Loading…"}
      </h1>
      <p className="mt-1 text-sm text-muted">How was it?</p>

      <form onSubmit={handleSubmit} className="mt-10">
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
                aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
                className={`text-3xl leading-none transition-colors ${
                  selected ? "text-accent" : "text-border hover:text-accent/50"
                }`}
              >
                ★
              </button>
            );
          })}
        </div>

        <label
          htmlFor="comment"
          className="mt-10 block text-xs font-medium uppercase tracking-widest text-muted"
        >
          Your review
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think?"
          className="mt-3 w-full resize-none rounded-xl border border-border bg-card p-4 text-sm leading-relaxed outline-none transition-colors focus:border-accent"
        />

        {error !== null && <p className="mt-3 text-sm text-accent">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-6 w-full rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Saving…" : "Submit review"}
        </button>
      </form>
    </main>
    </>
  );
}

"use client";

/**
 * page.tsx — the Swaad home page.
 *
 * Fetches GET /api/restaurants once and prints the result.
 * No maths, no sorting: averages arrive computed, order arrives decided.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TopBar } from "@/components/TopBar";

type RestaurantCard = {
  id: number;
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  coverPhoto: string | null;
};

export default function Home() {
  const [restaurants, setRestaurants] = useState<RestaurantCard[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/restaurants")
      .then(async (res) => {
        if (!res.ok) {
          if (!cancelled) setFailed(true);
          return;
        }
        const data: RestaurantCard[] = await res.json();
        if (!cancelled) setRestaurants(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Where are you eating today?
        </h1>

        {failed ? (
          <p className="mt-8 text-sm text-muted">
            Couldn&apos;t load restaurants. Please refresh.
          </p>
        ) : restaurants === null ? (
          <p className="mt-8 text-sm text-muted">Loading…</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {restaurants.map((r) => (
              <Link
                key={r.id}
                href={`/restaurant/${r.id}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f6f1ec]">
                  {r.coverPhoto ? (
                    <Image
                      src={r.coverPhoto}
                      alt={`${r.name} — cover photo`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    /* Tasteful placeholder: the restaurant's first letter */
                    <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-accent/70">
                      {r.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-base font-semibold">{r.name}</h2>
                  <p className="mt-0.5 text-xs text-muted">
                    {r.cuisine} · {r.area}
                  </p>
                  <div className="mt-3 flex items-center gap-2.5">
                    {r.averageRating !== null ? (
                      <span className="flex items-center gap-1 rounded-full bg-green px-2.5 py-1 text-xs font-semibold text-white">
                        <StarIcon className="h-3 w-3" />
                        {r.averageRating}
                      </span>
                    ) : (
                      <span className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted">
                        New
                      </span>
                    )}
                    <span className="text-xs text-muted">
                      {r.totalReviews} {r.totalReviews === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
    </svg>
  );
}

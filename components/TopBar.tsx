/**
 * TopBar.tsx — the bar on every page.
 *
 * Left: the Swaad logo (clicking goes home).
 * Right: a location chip showing the restaurant's area — but only when the
 * page actually has one from the API. Nothing fake: no search, no cart, no login.
 */
import Link from "next/link";
import { Logo } from "./Logo";

export function TopBar({ area }: { area?: string | null }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[640px] items-center justify-between px-4">
        <Link
          href="/"
          aria-label="Swaad — home"
          className="transition-opacity hover:opacity-80"
        >
          <Logo />
        </Link>
        {area ? (
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path
                d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z"
                stroke="#e14d2a"
                strokeWidth="2"
              />
              <circle cx="12" cy="10" r="2.5" fill="#e14d2a" />
            </svg>
            {area}
          </span>
        ) : null}
      </div>
    </header>
  );
}

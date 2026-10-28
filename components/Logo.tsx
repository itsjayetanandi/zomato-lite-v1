/**
 * Logo.tsx — the Swaad brand mark.
 *
 * An original drawing: two wisps of steam rising from a solid bowl with a
 * small foot, in the warm red-orange accent. Nothing here resembles an
 * existing food app's mark — it is ours.
 */

export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* the steam: two gentle S-curves rising from the bowl */}
      <path
        d="M18 22.5 C16.5 19.5 19.5 17.5 18 14"
        stroke="#e14d2a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M30 22.5 C28.5 19.5 31.5 17.5 30 14"
        stroke="#e14d2a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* the bowl: a solid half-ellipse */}
      <path d="M8 27 A16 12 0 0 0 40 27 Z" fill="#e14d2a" />
      {/* the foot */}
      <rect x="19" y="39" width="10" height="3.5" rx="1.75" fill="#e14d2a" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark className="h-7 w-7" />
      <span className="text-lg font-bold tracking-tight">Swaad</span>
    </span>
  );
}

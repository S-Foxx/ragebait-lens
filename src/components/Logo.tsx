// A "lens over a play button" mark — the act of seeing through the hook.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-label="Ragebait Lens">
      <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="2.2" />
      <path d="M11 10.5l6 3.5-6 3.5v-7z" fill="currentColor" />
      <line x1="20.5" y1="20.5" x2="27" y2="27" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

import type { ReactNode } from "react";

/**
 * Collapsible, reader-friendly help block shown under each key input.
 * Keeps the setup panel uncluttered while giving newcomers step-by-step
 * guidance on creating a key and — critically — locking it down.
 */
export function KeyHelp({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group mt-2 rounded-lg border border-edge bg-ink/40 text-[12px] leading-relaxed text-muted">
      <summary className="flex cursor-pointer select-none items-center gap-1.5 px-3 py-2 font-medium text-zinc-300 marker:content-none hover:text-zinc-100">
        <svg
          viewBox="0 0 12 12"
          width="11"
          height="11"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="transition-transform group-open:rotate-90"
          aria-hidden="true"
        >
          <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {summary}
      </summary>
      <div className="space-y-2 border-t border-edge px-3 py-2.5">{children}</div>
    </details>
  );
}

export function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <p className="flex gap-2">
      <span className="mt-px inline-flex h-4 w-4 flex-none items-center justify-center rounded-full bg-panel2 text-[10px] font-bold text-zinc-200">
        {n}
      </span>
      <span>{children}</span>
    </p>
  );
}

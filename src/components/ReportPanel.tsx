import type { Report } from "../report";
import { CATEGORIES, CATEGORY_ORDER, SUBTAGS, SUBTAG_ORDER } from "../taxonomy";
import type { CategoryId } from "../taxonomy";

export function ReportPanel({
  report,
  activeFilter,
  onFilter,
}: {
  report: Report;
  activeFilter: CategoryId | null;
  onFilter: (c: CategoryId | null) => void;
}) {
  const { classified, categoryPct, categoryCounts, engineeredPct, avgBait, subtagCounts, errors } = report;

  return (
    <div className="space-y-6">
      {/* headline */}
      <div className="rounded-xl bg-panel p-5 ring-1 ring-edge">
        <div className="text-xs uppercase tracking-widest text-muted">The verdict</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-mono text-4xl font-extrabold text-conflict tabular-nums">{engineeredPct}%</span>
          <span className="text-sm text-zinc-300">of this feed is engineered to hook you.</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Of {classified} analyzed video{classified === 1 ? "" : "s"}, only{" "}
          <span className="font-semibold text-genuine">{categoryPct.genuine}%</span> were titled honestly with no
          engineered hook. Average bait score: <span className="font-mono text-zinc-200">{avgBait}/100</span>.
          {errors > 0 && <span className="text-conflict/80"> ({errors} failed)</span>}
        </p>
      </div>

      {/* stacked category bar */}
      <div>
        <div className="mb-2 text-xs uppercase tracking-widest text-muted">Category mix · click to filter</div>
        <div className="flex h-3 w-full overflow-hidden rounded-full ring-1 ring-edge">
          {CATEGORY_ORDER.map((c) =>
            categoryPct[c] > 0 ? (
              <button
                key={c}
                onClick={() => onFilter(activeFilter === c ? null : c)}
                title={`${CATEGORIES[c].label}: ${categoryPct[c]}%`}
                className="h-full transition hover:opacity-80"
                style={{ width: `${categoryPct[c]}%`, background: CATEGORIES[c].hex }}
              />
            ) : null
          )}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-1.5">
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              onClick={() => onFilter(activeFilter === c ? null : c)}
              className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition ${
                activeFilter === c ? "bg-panel2 ring-1 ring-edge" : "hover:bg-panel2"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORIES[c].hex }} />
                <span className="text-zinc-200">{CATEGORIES[c].label}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted">{categoryCounts[c]}</span>
                <span className="font-mono w-10 text-right tabular-nums" style={{ color: CATEGORIES[c].hex }}>
                  {categoryPct[c]}%
                </span>
              </span>
            </button>
          ))}
        </div>
        {activeFilter && (
          <button
            onClick={() => onFilter(null)}
            className="mt-2 w-full rounded-lg border border-edge py-1.5 text-xs text-muted hover:text-zinc-200"
          >
            Clear filter — show all
          </button>
        )}
      </div>

      {/* subtag frequency */}
      <div>
        <div className="mb-2 text-xs uppercase tracking-widest text-muted">Tactics detected</div>
        <div className="space-y-1.5">
          {SUBTAG_ORDER.filter((t) => subtagCounts[t] > 0).map((t) => {
            const max = Math.max(1, ...SUBTAG_ORDER.map((x) => subtagCounts[x]));
            return (
              <div key={t} className="flex items-center gap-2" title={SUBTAGS[t].desc}>
                <span className="w-28 shrink-0 text-xs text-zinc-300">{SUBTAGS[t].label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-edge">
                  <div className="h-full rounded-full bg-zinc-400" style={{ width: `${(subtagCounts[t] / max) * 100}%` }} />
                </div>
                <span className="w-6 text-right font-mono text-xs text-muted tabular-nums">{subtagCounts[t]}</span>
              </div>
            );
          })}
          {SUBTAG_ORDER.every((t) => subtagCounts[t] === 0) && (
            <p className="text-xs text-muted">No manipulation tactics detected yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

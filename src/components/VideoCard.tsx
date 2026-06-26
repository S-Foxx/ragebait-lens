import type { VideoItem } from "../taxonomy";
import { CATEGORIES } from "../taxonomy";
import { BaitMeter, CategoryBadge, SubTagChips } from "./Badge";

export function VideoCard({ v, dim }: { v: VideoItem; dim: boolean }) {
  const c = v.classification;
  const accent = c ? CATEGORIES[c.category].hex : "#2a2a31";
  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-xl bg-panel ring-1 ring-edge transition ${
        dim ? "opacity-30" : "opacity-100"
      }`}
      style={{ animation: "fadein .4s ease both" }}
    >
      {/* thumbnail with overlay */}
      <div className="relative aspect-video w-full overflow-hidden bg-panel2">
        {v.thumbnail ? (
          <img src={v.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full skeleton" />
        )}
        {/* top accent bar shows the verdict color at a glance */}
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />
        {/* overlay badge */}
        <div className="absolute left-2 top-3">
          {c ? (
            <CategoryBadge c={c} />
          ) : v.error ? (
            <span className="rounded-full bg-conflict/20 px-2.5 py-1 text-[11px] font-semibold text-conflict ring-1 ring-conflict/40">
              error
            </span>
          ) : (
            <span className="rounded-full bg-panel2 px-2.5 py-1 text-[11px] font-medium text-muted ring-1 ring-edge">
              analyzing…
            </span>
          )}
        </div>
        {v.views && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white/90">
            {v.views}
          </span>
        )}
      </div>

      {/* meta */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <a
          href={v.url}
          target="_blank"
          rel="noreferrer"
          className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-100 hover:text-white"
          title={v.title}
        >
          {v.title}
        </a>
        <div className="text-xs text-muted">{v.channel}</div>

        {c && (
          <div className="mt-auto space-y-2 pt-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wide text-muted">bait</span>
              <BaitMeter score={c.bait_score} />
            </div>
            <SubTagChips tags={c.subtags} />
            <p className="border-t border-edge pt-2 text-[11px] leading-relaxed text-muted">
              {c.rationale}
            </p>
          </div>
        )}
        {v.error && <p className="mt-auto text-[11px] text-conflict/80">{v.error}</p>}
      </div>
    </div>
  );
}

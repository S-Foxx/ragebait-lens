import { CATEGORIES, SUBTAGS } from "../taxonomy";
import type { Classification } from "../taxonomy";

export function CategoryBadge({ c }: { c: Classification }) {
  const cat = CATEGORIES[c.category];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ background: cat.hex + "22", color: cat.hex, border: `1px solid ${cat.hex}55` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.hex }} />
      {cat.label}
    </span>
  );
}

export function BaitMeter({ score }: { score: number }) {
  const color = score <= 33 ? "#3fbf8f" : score <= 66 ? "#e0b341" : "#e0533d";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-edge">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="font-mono text-[11px] tabular-nums" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export function SubTagChips({ tags }: { tags: Classification["subtags"] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t}
          title={SUBTAGS[t]?.desc}
          className="rounded bg-panel2 px-1.5 py-0.5 text-[10px] text-muted ring-1 ring-edge"
        >
          {SUBTAGS[t]?.label ?? t}
        </span>
      ))}
    </div>
  );
}

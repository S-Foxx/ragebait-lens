// Renders the verdict (aggregate numbers only — never individual video titles)
// to an offscreen canvas so people can download/copy a shareable image.
//
// Why data-only: a feed is personal, and most people don't want to broadcast
// what YouTube serves *them*. The verdict is just statistics, so it's safe and
// interesting to share. We deliberately render zero titles/channels here.

import type { Report } from "./report";
import { CATEGORIES, CATEGORY_ORDER, SUBTAGS, SUBTAG_ORDER } from "./taxonomy";

const COLORS = {
  ink: "#0a0a0b",
  panel: "#141417",
  panel2: "#1c1c21",
  edge: "#2a2a31",
  muted: "#8a8a94",
  text: "#ececf0",
  conflict: "#e0533d",
  wealth: "#e0b341",
  genuine: "#3fbf8f",
};

// 2x scale for crisp output on retina / when re-shared.
const W = 1080;
const H = 1080;
const SCALE = 2;

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Draw the Ragebait Lens mark — a geometric angular fox face built entirely from
// straight-edged polygons. Mirrors src/components/Logo.tsx exactly. Coordinates
// are authored in the 32x32 viewBox space, then mapped onto a `size`-wide box
// centered at (cx, cy). No curves, circles, or rounded corners — matching the
// on-page SVG logo for visual consistency.
function drawLogo(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, _color?: string) {
  void _color; // logo is intentionally multi-color; signature kept for callers
  const s = size / 32; // scale from 32-unit viewBox
  const ox = cx - size / 2;
  const oy = cy - size / 2;
  const px = (n: number) => ox + n * s;
  const py = (n: number) => oy + n * s;

  const poly = (pts: number[][], fill: string) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => {
      const X = px(x);
      const Y = py(y);
      if (i === 0) ctx.moveTo(X, Y);
      else ctx.lineTo(X, Y);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };

  const line = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(px(x1), py(y1));
    ctx.lineTo(px(x2), py(y2));
    ctx.stroke();
  };

  ctx.save();

  // Ears (behind face)
  poly([[4, 18], [8, 2], [14, 12]], COLORS.panel);
  poly([[28, 18], [24, 2], [18, 12]], COLORS.panel);
  poly([[6.5, 15], [8.5, 5], [12.5, 12]], COLORS.wealth);
  poly([[25.5, 15], [23.5, 5], [19.5, 12]], COLORS.wealth);

  // Main face
  poly([[7, 12], [14, 9], [18, 9], [25, 12], [27, 20], [24, 27], [16, 30], [8, 27], [5, 20]], COLORS.conflict);

  // Snout cheek wedges + bridge
  poly([[8, 21], [12, 17.5], [15.5, 19.5], [14, 27], [8.5, 26]], COLORS.text);
  poly([[24, 21], [20, 17.5], [16.5, 19.5], [18, 27], [23.5, 26]], COLORS.text);
  poly([[15.5, 19.5], [16, 18.5], [16.5, 19.5], [16, 22]], COLORS.conflict);

  // Nose
  poly([[16, 19.5], [14.5, 21], [16, 22.5], [17.5, 21]], COLORS.panel2);

  // Eyes
  poly([[10, 14.5], [12, 13], [14, 14.5], [12, 16]], COLORS.ink);
  poly([[22, 14.5], [20, 13], [18, 14.5], [20, 16]], COLORS.ink);
  poly([[10.8, 13.8], [12, 13.2], [11.4, 14.6]], COLORS.wealth);
  poly([[21.2, 13.8], [20, 13.2], [20.6, 14.6]], COLORS.wealth);

  // Brows
  poly([[9, 13], [11, 11], [13.5, 13.5], [11.5, 13.5]], COLORS.ink);
  poly([[23, 13], [21, 11], [18.5, 13.5], [20.5, 13.5]], COLORS.ink);

  // Whiskers
  ctx.strokeStyle = COLORS.muted;
  ctx.lineWidth = Math.max(0.6, size * 0.018);
  line(13, 20.5, 0.5, 18.5);
  line(13, 21.5, 0.5, 21.5);
  line(13, 22.5, 1.5, 25);
  line(19, 20.5, 31.5, 18.5);
  line(19, 21.5, 31.5, 21.5);
  line(19, 22.5, 30.5, 25);

  ctx.restore();
}

export function renderVerdictCanvas(report: Report): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  // background
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(0, 0, W, H);

  const PAD = 72;
  let y = PAD;

  // ---- header: logo + wordmark ----
  drawLogo(ctx, PAD + 24, y + 20, 56);
  ctx.fillStyle = COLORS.text;
  ctx.font = "800 34px Inter, system-ui, sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Ragebait Lens", PAD + 64, y + 28);
  ctx.fillStyle = COLORS.muted;
  ctx.font = "600 15px Inter, system-ui, sans-serif";
  ctx.fillText("SEE THE HOOK BEFORE YOU CLICK", PAD + 56, y + 50);
  y += 96;

  // ---- headline verdict ----
  ctx.fillStyle = COLORS.muted;
  ctx.font = "700 18px Inter, system-ui, sans-serif";
  ctx.fillText("THE VERDICT", PAD, y);
  y += 130; // leave room for the 120px numeral's ascent below the label

  ctx.fillStyle = COLORS.conflict;
  ctx.font = "800 120px Inter, system-ui, sans-serif";
  const pctText = `${report.engineeredPct}%`;
  ctx.fillText(pctText, PAD, y);
  const pctW = ctx.measureText(pctText).width;
  ctx.fillStyle = COLORS.text;
  ctx.font = "600 30px Inter, system-ui, sans-serif";
  ctx.fillText("of this feed is", PAD + pctW + 24, y - 50);
  ctx.fillText("engineered to hook you", PAD + pctW + 24, y - 12);
  y += 44;

  ctx.fillStyle = COLORS.muted;
  ctx.font = "400 22px Inter, system-ui, sans-serif";
  ctx.fillText(
    `Of ${report.classified} videos analyzed, only ${report.categoryPct.genuine}% were titled honestly.`,
    PAD,
    y
  );
  y += 32;
  ctx.fillText(`Average bait score: ${report.avgBait}/100.`, PAD, y);
  y += 56;

  // ---- stacked category bar ----
  const barX = PAD;
  const barW = W - PAD * 2;
  const barH = 34;
  rr(ctx, barX, y, barW, barH, barH / 2);
  ctx.fillStyle = COLORS.panel2;
  ctx.fill();
  ctx.save();
  rr(ctx, barX, y, barW, barH, barH / 2);
  ctx.clip();
  let cx = barX;
  for (const c of CATEGORY_ORDER) {
    const pct = report.categoryPct[c];
    if (pct <= 0) continue;
    const segW = (pct / 100) * barW;
    ctx.fillStyle = CATEGORIES[c].hex;
    ctx.fillRect(cx, y, segW, barH);
    cx += segW;
  }
  ctx.restore();
  y += barH + 44;

  // ---- category legend (two columns) ----
  ctx.font = "600 22px Inter, system-ui, sans-serif";
  const rowH = 46;
  const colW = barW / 2;
  CATEGORY_ORDER.forEach((c, i) => {
    const col = i < 3 ? 0 : 1;
    const rowIdx = i < 3 ? i : i - 3;
    const lx = PAD + col * colW;
    const ly = y + rowIdx * rowH;
    // swatch
    ctx.fillStyle = CATEGORIES[c].hex;
    ctx.beginPath();
    ctx.arc(lx + 9, ly + 10, 9, 0, Math.PI * 2);
    ctx.fill();
    // label
    ctx.fillStyle = COLORS.text;
    ctx.font = "500 22px Inter, system-ui, sans-serif";
    ctx.fillText(CATEGORIES[c].label, lx + 28, ly + 18);
    // pct (right-aligned within column)
    ctx.fillStyle = CATEGORIES[c].hex;
    ctx.font = "700 22px Inter, system-ui, sans-serif";
    const pTxt = `${report.categoryPct[c]}%`;
    ctx.textAlign = "right";
    ctx.fillText(pTxt, lx + colW - 28, ly + 18);
    ctx.textAlign = "left";
  });
  y += 3 * rowH + 24;

  // ---- top tactics detected ----
  const tactics = SUBTAG_ORDER.filter((t) => report.subtagCounts[t] > 0)
    .sort((a, b) => report.subtagCounts[b] - report.subtagCounts[a])
    .slice(0, 4);
  if (tactics.length) {
    ctx.fillStyle = COLORS.muted;
    ctx.font = "700 18px Inter, system-ui, sans-serif";
    ctx.fillText("TOP TACTICS DETECTED", PAD, y);
    y += 34;
    const max = Math.max(1, ...tactics.map((t) => report.subtagCounts[t]));
    for (const t of tactics) {
      ctx.fillStyle = COLORS.text;
      ctx.font = "500 20px Inter, system-ui, sans-serif";
      ctx.fillText(SUBTAGS[t].label, PAD, y + 16);
      const tbX = PAD + 240;
      const tbW = barW - 240 - 50;
      rr(ctx, tbX, y, tbW, 14, 7);
      ctx.fillStyle = COLORS.edge;
      ctx.fill();
      const fillW = (report.subtagCounts[t] / max) * tbW;
      rr(ctx, tbX, y, Math.max(14, fillW), 14, 7);
      ctx.fillStyle = COLORS.muted;
      ctx.fill();
      ctx.fillStyle = COLORS.muted;
      ctx.font = "600 18px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(String(report.subtagCounts[t]), PAD + barW, y + 14);
      ctx.textAlign = "left";
      y += 38;
    }
    y += 12;
  }

  // ---- footer band: CTA question + privacy note + url ----
  // Fixed, content-sized height so there's no large empty gap regardless of how
  // many tactics were drawn above.
  const footH = 150;
  rr(ctx, PAD, y, barW, footH, 18);
  ctx.fillStyle = COLORS.panel;
  ctx.fill();
  const fY = y + 50;
  ctx.fillStyle = COLORS.text;
  ctx.font = "800 30px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("How will you create your own content?", W / 2, fY);
  ctx.fillStyle = COLORS.muted;
  ctx.font = "400 18px Inter, system-ui, sans-serif";
  ctx.fillText("Numbers only — no personal feed is shared. Analyze yours at:", W / 2, fY + 38);
  ctx.fillStyle = COLORS.genuine;
  ctx.font = "700 20px Inter, system-ui, sans-serif";
  ctx.fillText("ragebait-lens.vercel.app", W / 2, fY + 70);
  ctx.textAlign = "left";

  return canvas;
}

// Produce a PNG blob from the canvas.
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create image."))), "image/png");
  });
}

// Trigger a download of the verdict image.
export async function downloadVerdict(report: Report): Promise<void> {
  const canvas = renderVerdictCanvas(report);
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ragebait-lens-verdict.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // give the browser a tick to start the download before revoking
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Copy the verdict image to the clipboard (where the browser supports it).
// Returns true on success; throws a friendly error otherwise so the caller can
// fall back to download.
export async function copyVerdict(report: Report): Promise<boolean> {
  const canvas = renderVerdictCanvas(report);
  const blob = await canvasToBlob(canvas);
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    throw new Error("Clipboard images aren't supported in this browser — use Download instead.");
  }
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  return true;
}

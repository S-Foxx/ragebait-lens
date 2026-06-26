import { useEffect, useRef, useState } from "react";
import type { Report } from "../report";
import { renderVerdictCanvas, downloadVerdict, copyVerdict } from "../verdictImage";

// A small panel that previews the shareable verdict image and offers
// Download / Copy. The image is pure aggregate data — no video titles or
// channels — so people can share their "verdict" without exposing their
// personal feed.
export function VerdictShare({ report }: { report: Report }) {
  const previewRef = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState<"copy" | "download" | null>(null);

  // Render the canvas to a preview <img> whenever the report changes.
  useEffect(() => {
    const canvas = renderVerdictCanvas(report);
    const url = canvas.toDataURL("image/png");
    if (previewRef.current) previewRef.current.src = url;
  }, [report]);

  async function onDownload() {
    setStatus(null);
    setBusy("download");
    try {
      await downloadVerdict(report);
      setStatus({ ok: true, msg: "Saved as ragebait-lens-verdict.png" });
    } catch (e: any) {
      setStatus({ ok: false, msg: e?.message || "Could not download." });
    } finally {
      setBusy(null);
    }
  }

  async function onCopy() {
    setStatus(null);
    setBusy("copy");
    try {
      await copyVerdict(report);
      setStatus({ ok: true, msg: "Copied — paste it anywhere." });
    } catch (e: any) {
      setStatus({ ok: false, msg: e?.message || "Copy not supported — use Download." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-10 rounded-2xl border border-edge bg-panel p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {/* preview */}
        <div className="shrink-0">
          <img
            ref={previewRef}
            alt="Shareable verdict image preview"
            className="h-40 w-40 rounded-xl border border-edge object-cover"
          />
        </div>

        {/* copy + actions */}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-zinc-100">Share the verdict, not your feed</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Download this as an image and share it anywhere. It shows only the numbers — the percentages, the average
            bait score, the tactics. Your actual videos stay private; nobody sees what YouTube serves you.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={onDownload}
              disabled={busy !== null}
              className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-bold text-ink transition hover:bg-white disabled:opacity-50"
            >
              {busy === "download" ? "Saving…" : "Download image"}
            </button>
            <button
              onClick={onCopy}
              disabled={busy !== null}
              className="rounded-lg border border-edge px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-panel2 disabled:opacity-50"
            >
              {busy === "copy" ? "Copying…" : "Copy image"}
            </button>
            {status && (
              <span className={`text-xs ${status.ok ? "text-genuine" : "text-conflict"}`}>{status.msg}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

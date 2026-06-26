// Geometric angular fox face mark — a sly, rage-primed fox built entirely from
// straight-edged polygons. Dark ink ear bases with gold inner tips, rust/orange
// face (#e0533d brand primary), angular white snout cheeks, dark diamond nose,
// dark rhombus eyes with gold glint accents, angry inward-slanting brow slashes,
// and three muted-grey whiskers per side. No circles, curves, or rounded corners.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-label="Ragebait Lens"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── EARS (rendered behind face) ── */}
      {/* Left ear base — ink dark */}
      <polygon points="4,18 8,2 14,12" fill="#141417" />
      {/* Right ear base — ink dark */}
      <polygon points="28,18 24,2 18,12" fill="#141417" />
      {/* Left ear inner tip — wealth gold */}
      <polygon points="6.5,15 8.5,5 12.5,12" fill="#e0b341" />
      {/* Right ear inner tip — wealth gold */}
      <polygon points="25.5,15 23.5,5 19.5,12" fill="#e0b341" />

      {/* ── MAIN FACE — conflict rust/orange ── */}
      <polygon
        points="7,12 14,9 18,9 25,12 27,20 24,27 16,30 8,27 5,20"
        fill="#e0533d"
      />

      {/* ── SNOUT — two white cheek wedges flanking a rust bridge ── */}
      {/* Left cheek wedge — text white */}
      <polygon points="8,21 12,17.5 15.5,19.5 14,27 8.5,26" fill="#ececf0" />
      {/* Right cheek wedge — text white */}
      <polygon points="24,21 20,17.5 16.5,19.5 18,27 23.5,26" fill="#ececf0" />
      {/* Center muzzle bridge — rust fill to unify the snout */}
      <polygon points="15.5,19.5 16,18.5 16.5,19.5 16,22" fill="#e0533d" />

      {/* ── NOSE — small diamond, panel2 dark ── */}
      <polygon points="16,19.5 14.5,21 16,22.5 17.5,21" fill="#1c1c21" />

      {/* ── EYES — dark rhombus shapes ── */}
      {/* Left eye */}
      <polygon points="10,14.5 12,13 14,14.5 12,16" fill="#0a0a0b" />
      {/* Right eye */}
      <polygon points="22,14.5 20,13 18,14.5 20,16" fill="#0a0a0b" />
      {/* Left eye glint — gold */}
      <polygon points="10.8,13.8 12,13.2 11.4,14.6" fill="#e0b341" />
      {/* Right eye glint — gold */}
      <polygon points="21.2,13.8 20,13.2 20.6,14.6" fill="#e0b341" />

      {/* ── BROWS — angry inward-slanting slashes ── */}
      {/* Left brow */}
      <polygon points="9,13 11,11 13.5,13.5 11.5,13.5" fill="#0a0a0b" />
      {/* Right brow */}
      <polygon points="23,13 21,11 18.5,13.5 20.5,13.5" fill="#0a0a0b" />

      {/* ── WHISKERS — 3 per side, muted grey ── */}
      {/* Left whiskers */}
      <line x1="13" y1="20.5" x2="0.5" y2="18.5" stroke="#8a8a94" strokeWidth="0.6" />
      <line x1="13" y1="21.5" x2="0.5" y2="21.5" stroke="#8a8a94" strokeWidth="0.6" />
      <line x1="13" y1="22.5" x2="1.5" y2="25" stroke="#8a8a94" strokeWidth="0.6" />
      {/* Right whiskers */}
      <line x1="19" y1="20.5" x2="31.5" y2="18.5" stroke="#8a8a94" strokeWidth="0.6" />
      <line x1="19" y1="21.5" x2="31.5" y2="21.5" stroke="#8a8a94" strokeWidth="0.6" />
      <line x1="19" y1="22.5" x2="30.5" y2="25" stroke="#8a8a94" strokeWidth="0.6" />
    </svg>
  );
}

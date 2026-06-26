/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        ink: "#0a0a0b",
        panel: "#141417",
        panel2: "#1c1c21",
        edge: "#2a2a31",
        muted: "#8a8a94",
        // category colors
        wealth: "#e0b341",
        conflict: "#e0533d",
        ent: "#5b8def",
        fomo: "#b06ee8",
        genuine: "#3fbf8f",
      },
      keyframes: {
        fadein: { "0%": { opacity: 0, transform: "translateY(6px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        fadein: "fadein .4s ease both",
      },
    },
  },
  plugins: [],
};

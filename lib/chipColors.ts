/**
 * Soft palette only (50/100 shades). Text stays slate-700 for readability.
 * Primary: Indigo/Violet. Secondary: Teal. Success: Emerald. Neutral: Slate, Sky.
 */
const SOFT_PALETTES = [
  "bg-indigo-50 border-indigo-100 text-slate-700",
  "bg-violet-50 border-violet-100 text-slate-700",
  "bg-teal-50 border-teal-100 text-slate-700",
  "bg-sky-50 border-sky-100 text-slate-700",
  "bg-slate-100 border-slate-200 text-slate-700",
  "bg-emerald-50 border-emerald-100 text-slate-700",
] as const;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Returns Tailwind classes for a chip (soft background + border + text). Used when chip is not selected. */
export function getChipClasses(label: string): string {
  const idx = hash(label.toLowerCase()) % SOFT_PALETTES.length;
  return SOFT_PALETTES[idx];
}

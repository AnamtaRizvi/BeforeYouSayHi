/**
 * Deterministic color for interest/label chips. Hash label to one of 8 palettes.
 */
const PALETTES = [
  "bg-amber-100 text-amber-800 border border-amber-200",
  "bg-sky-100 text-sky-800 border border-sky-200",
  "bg-violet-100 text-violet-800 border border-violet-200",
  "bg-rose-100 text-rose-800 border border-rose-200",
  "bg-emerald-100 text-emerald-800 border border-emerald-200",
  "bg-orange-100 text-orange-800 border border-orange-200",
  "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200",
  "bg-indigo-100 text-indigo-800 border border-indigo-200",
] as const;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getChipColor(label: string): string {
  const idx = hash(label.toLowerCase()) % PALETTES.length;
  return PALETTES[idx];
}

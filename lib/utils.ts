export function classNames(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const clampText = {
  line2: "line-clamp-2",
  line3: "line-clamp-3",
} as const;

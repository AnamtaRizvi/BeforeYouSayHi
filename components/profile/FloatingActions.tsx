"use client";

import { classNames } from "@/lib/utils";

const ACTIONS = [
  { label: "Wave", emoji: "👋" },
  { label: "Compliment", emoji: "✨" },
  { label: "Ask a fun Q", emoji: "😄" },
] as const;

type FloatingActionsProps = {
  className?: string;
};

export function FloatingActions({ className }: FloatingActionsProps) {
  return (
    <div
      className={classNames(
        "flex flex-wrap justify-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
        className
      )}
    >
      {ACTIONS.map(({ label, emoji }) => (
        <button
          key={label}
          type="button"
          className="rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-white hover:shadow-md"
        >
          {label} {emoji}
        </button>
      ))}
    </div>
  );
}

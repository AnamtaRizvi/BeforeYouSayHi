"use client";

import { classNames } from "@/lib/utils";

const ACTIONS = [
  { label: "Wave", emoji: "👋" },
  { label: "Compliment", emoji: "✨" },
] as const;

type FloatingActionsProps = {
  className?: string;
};

export function FloatingActions({ className }: FloatingActionsProps) {
  return (
    <div
      className={classNames(
        "flex flex-wrap justify-center gap-2 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100",
        className
      )}
    >
      {ACTIONS.map(({ label, emoji }) => (
        <button
          key={label}
          type="button"
          className="rounded-full border border-slate-200/70 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition duration-200 ease-out hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
        >
          {label} {emoji}
        </button>
      ))}
    </div>
  );
}

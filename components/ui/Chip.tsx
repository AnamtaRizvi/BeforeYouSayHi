"use client";

import { classNames } from "@/lib/utils";
import { getChipColor } from "@/lib/chipColors";

type ChipProps = {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  /** If true, use colorful palette from getChipColor(children). Ignored when active. */
  colorful?: boolean;
};

export function Chip({ children, active, onClick, className, colorful }: ChipProps) {
  const label = typeof children === "string" ? children : "";
  const colorClass = colorful && !active ? getChipColor(label) : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition hover:scale-105 hover:shadow-sm",
        active
          ? "bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 text-white shadow-md"
          : colorClass || "bg-white/70 text-zinc-700 border border-white/60 backdrop-blur-sm hover:bg-white/90",
        className
      )}
    >
      {children}
    </button>
  );
}

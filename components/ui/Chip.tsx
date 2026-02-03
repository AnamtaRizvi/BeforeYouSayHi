"use client";

import { classNames } from "@/lib/utils";
import { getChipClasses } from "@/lib/chipColors";

type ChipProps = {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  /** When true, use soft colored palette from getChipClasses(children). Ignored when active. */
  colorful?: boolean;
};

export function Chip({ children, active, onClick, className, colorful }: ChipProps) {
  const label = typeof children === "string" ? children : "";
  const defaultClasses = colorful ? getChipClasses(label) : "bg-slate-100 border-slate-200/70 text-slate-700 hover:bg-slate-200/60";

  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition duration-200 ease-out active:scale-[0.98]",
        active
          ? "bg-indigo-100 text-indigo-800 border-indigo-200"
          : defaultClasses,
        className
      )}
    >
      {active && (
        <span className="text-indigo-500" aria-hidden>
          ✓
        </span>
      )}
      {children}
    </button>
  );
}

"use client";

import { classNames } from "@/lib/utils";

type ProgressBarProps = {
  value: number; // 0–100
  className?: string;
  showLabel?: boolean;
};

export function ProgressBar({ value, className, showLabel }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={classNames("w-full", className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-violet-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-zinc-500">{pct}%</p>
      )}
    </div>
  );
}

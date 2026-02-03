"use client";

import { classNames } from "@/lib/utils";

type BadgeVariant = "ready" | "not-trained";

const variantStyles: Record<BadgeVariant, string> = {
  ready: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
  "not-trained": "bg-amber-50 text-amber-700 border border-amber-200/60",
};

type BadgeProps = {
  variant: BadgeVariant;
  className?: string;
  children?: React.ReactNode;
};

export function Badge({ variant, className, children }: BadgeProps) {
  const label = variant === "ready" ? "Avatar ready" : "Not trained yet";
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children ?? label}
    </span>
  );
}

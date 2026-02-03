"use client";

import { classNames } from "@/lib/utils";

type BadgeVariant = "ready" | "not-trained";

const variantStyles: Record<BadgeVariant, string> = {
  ready: "bg-emerald-100 text-emerald-800",
  "not-trained": "bg-amber-100 text-amber-800",
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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children ?? label}
    </span>
  );
}

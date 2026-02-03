"use client";

import Link from "next/link";
import { classNames } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-500 text-white shadow-sm shadow-indigo-300/30 hover:from-indigo-700 hover:via-violet-700 hover:to-teal-600 hover:shadow-md hover:shadow-indigo-300/40 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-95 transition-all duration-200",
  secondary:
    "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:shadow-sm focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 active:scale-95 transition-all duration-200",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 active:scale-95 transition-all duration-200",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  pill?: boolean;
  asChild?: boolean;
  href?: string;
  children: React.ReactNode;
};

export function Button({
  variant = "primary",
  pill = true,
  asChild,
  href,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold tracking-tight transition rounded-full px-5 py-2.5 text-sm disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";
  const styles = classNames(base, !pill && "rounded-xl", variantStyles[variant], className);

  if (asChild && href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }
  return (
    <button type={rest.type ?? "button"} className={styles} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}

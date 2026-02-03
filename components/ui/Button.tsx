"use client";

import Link from "next/link";
import { classNames } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 text-white shadow-lg shadow-pink-200/50 hover:brightness-110 hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-300/50 focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 transition-all duration-200",
  secondary:
    "bg-white/70 text-zinc-800 backdrop-blur-md border border-white/50 shadow-sm hover:bg-white hover:shadow-md focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 transition-all duration-200",
  ghost:
    "bg-transparent text-zinc-600 hover:bg-white/50 hover:text-zinc-900 focus:ring-2 focus:ring-zinc-200 focus:ring-offset-2 transition-all duration-200",
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
    "inline-flex items-center justify-center font-semibold transition rounded-full px-5 py-2.5 text-sm disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100";
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { getAvatarUrl } from "@/lib/avatar";
import { classNames } from "@/lib/utils";

type AvatarStoryProps = {
  id: string;
  size?: number;
  isReady?: boolean;
  isPinned?: boolean;
  href?: string;
  showTooltip?: boolean;
  showLabelBelow?: boolean;
  className?: string;
};

export function AvatarStory({
  id,
  size = 80,
  isReady = false,
  isPinned = false,
  href,
  showTooltip = true,
  showLabelBelow = false,
  className,
}: AvatarStoryProps) {
  const ringSize = size + 10;
  /* Ring: default indigo→violet→teal; ready = teal/emerald; untrained = amber */
  const ringGradient = classNames(
    "absolute inset-0 rounded-full p-[2px] transition-all duration-200 ease-out group-hover:shadow-md",
    isPinned && "bg-gradient-to-r from-amber-400 to-amber-300",
    !isPinned && isReady && "bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300",
    !isPinned && !isReady && "bg-gradient-to-r from-indigo-400 via-violet-400 to-teal-300"
  );

  const content = (
    <div
      className={classNames("group relative inline-flex flex-shrink-0 flex-col items-center", className)}
      style={{ width: ringSize }}
    >
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        <div className={ringGradient}>
          <div className="h-full w-full rounded-full bg-white p-[2px]">
            <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-100 transition-transform duration-200 ease-out group-hover:scale-[1.02]">
              <Image
                src={getAvatarUrl(id, size * 2)}
                alt=""
                fill
                className="object-cover"
                sizes={`${size * 2}px`}
              />
              <span
                className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-emerald-500"
                aria-hidden
              />
              {!showLabelBelow && (
                <span
                  className={classNames(
                    "absolute left-0 top-0 rounded-br rounded-tl px-1.5 py-0.5 text-[10px] font-medium",
                    isReady
                      ? "bg-emerald-50/95 text-emerald-700 border border-emerald-200/50"
                      : "bg-amber-50/95 text-amber-700 border border-amber-200/50"
                  )}
                >
                  {isReady ? "Ready" : "Untrained"}
                </span>
              )}
            </div>
          </div>
        </div>
        {showTooltip && (
          <span className="invisible absolute -bottom-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow-md transition-opacity duration-200 ease-out group-hover:visible group-hover:opacity-100">
            Preview avatar
          </span>
        )}
      </div>
      {showLabelBelow && (
        <span
          className={classNames(
            "mt-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
            isReady
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
              : "bg-amber-50 text-amber-700 border border-amber-200/50"
          )}
        >
          {isReady ? "Ready" : "Untrained"}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
      >
        {content}
      </Link>
    );
  }
  return content;
}

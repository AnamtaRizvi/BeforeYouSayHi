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
  className?: string;
};

export function AvatarStory({
  id,
  size = 80,
  isReady = false,
  isPinned = false,
  href,
  showTooltip = true,
  className,
}: AvatarStoryProps) {
  const ringSize = size + 12;
  const content = (
    <div
      className={classNames(
        "group relative inline-flex flex-shrink-0",
        className
      )}
      style={{ width: ringSize, height: ringSize }}
    >
      {/* Glow behind ring */}
      <div
        className={classNames(
          "absolute inset-0 rounded-full opacity-60 blur-md transition-opacity group-hover:opacity-90",
          isPinned && "animate-pulse-ring bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400"
        )}
        style={{
          background: isPinned
            ? undefined
            : "linear-gradient(135deg, #f472b6, #a78bfa, #38bdf8)",
        }}
      />
      {/* Rotating gradient ring (story ring) */}
      <div
        className={classNames(
          "absolute inset-0 rounded-full p-[5px] transition-transform duration-300 group-hover:scale-105",
          "group-hover:animate-ring-rotate"
        )}
        style={{
          background: "linear-gradient(135deg, #d946ef, #ec4899, #fb923c)",
          backgroundSize: "200% 200%",
        }}
      >
        <div className="h-full w-full rounded-full bg-white p-[3px]">
          {/* Inner circle: avatar */}
          <div className="relative h-full w-full overflow-hidden rounded-full bg-zinc-100 transition-transform duration-300 group-hover:scale-105">
            <Image
              src={getAvatarUrl(id, size * 2)}
              alt=""
              fill
              className="object-cover"
              sizes={`${size * 2}px`}
            />
            {/* Online dot bottom-right */}
            <span
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
              aria-hidden
            />
            {/* Badge sticker top-left */}
            <span
              className={classNames(
                "absolute left-0 top-0 rounded-br-md rounded-tl-lg px-1.5 py-0.5 text-[10px] font-semibold shadow-sm",
                isReady
                  ? "bg-emerald-400/95 text-white"
                  : "bg-amber-400/95 text-amber-900"
              )}
            >
              {isReady ? "✨ ready" : "🧪 untrained"}
            </span>
            {/* Floating reactions on hover (CSS-only) */}
            <span
              className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              aria-hidden
            >
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg animate-floaty" style={{ animationDelay: "0ms" }}>
                ❤️
              </span>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg animate-floaty" style={{ animationDelay: "150ms", marginLeft: "-20px" }}>
                😂
              </span>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg animate-floaty" style={{ animationDelay: "300ms", marginLeft: "20px" }}>
                ✨
              </span>
            </span>
          </div>
        </div>
      </div>
      {showTooltip && (
        <span className="invisible absolute -bottom-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-zinc-800 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:visible group-hover:opacity-100">
          Preview avatar
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:ring-offset-2 rounded-full">
        {content}
      </Link>
    );
  }
  return content;
}

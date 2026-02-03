"use client";

import Image from "next/image";
import Link from "next/link";
import { getAvatarUrl } from "@/lib/avatar";
import { classNames } from "@/lib/utils";

type ProfileMiniCardProps = {
  profileId: string;
  name: string;
  age: number;
  city: string;
  href?: string;
  showBadge?: boolean;
  className?: string;
};

export function ProfileMiniCard({
  profileId,
  name,
  age,
  city,
  href,
  showBadge,
  className,
}: ProfileMiniCardProps) {
  const content = (
    <>
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-100">
        <Image
          src={getAvatarUrl(profileId, 96)}
          alt={name}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-900 truncate">
            {name}, {age}
          </span>
          {showBadge && (
            <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
              AI Avatar (simulation)
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-500 truncate">{city}</p>
      </div>
    </>
  );

  const base = "flex items-center gap-3";
  if (href) {
    return (
      <Link
        href={href}
        className={classNames(base, "hover:opacity-90 transition", className)}
      >
        {content}
      </Link>
    );
  }
  return <div className={classNames(base, className)}>{content}</div>;
}

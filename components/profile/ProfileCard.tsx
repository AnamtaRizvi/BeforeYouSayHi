"use client";

import Link from "next/link";
import { getChipColor } from "@/lib/chipColors";
import { AvatarStory } from "@/components/profile/AvatarStory";
import { FloatingActions } from "@/components/profile/FloatingActions";
import { Button } from "@/components/ui/Button";
import { classNames, clampText } from "@/lib/utils";

export type ProfileCardData = {
  id: string;
  order: number;
  name: string;
  age: number;
  city: string;
  bio: string;
  interests: string;
  avatar: { voiceProfileJson: string | null } | null;
};

function parseInterests(interests: string): string[] {
  try {
    return JSON.parse(interests || "[]") as string[];
  } catch {
    return [];
  }
}

function matchPercent(interests: string[]): number {
  return Math.min(99, 60 + interests.length * 5);
}

type ProfileCardProps = {
  profile: ProfileCardData;
  isPinned?: boolean;
};

export function ProfileCard({ profile, isPinned }: ProfileCardProps) {
  const interests = parseInterests(profile.interests);
  const displayInterests = interests.slice(0, 5);
  const isReady = !!profile.avatar?.voiceProfileJson;
  const match = matchPercent(interests);

  return (
    <div className="group relative">
      {/* Animated gradient border on hover */}
      <div
        className={classNames(
          "rounded-[22px] p-[2px] transition-all duration-300",
          "hover:shadow-2xl hover:shadow-fuchsia-200/30",
          "hover:-translate-y-2 hover:rotate-[-0.3deg]",
          isPinned
            ? "bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400"
            : "bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 opacity-90 hover:opacity-100"
        )}
      >
        <div className="card-shine relative overflow-hidden rounded-[20px] bg-white/70 py-6 backdrop-blur-md border border-white/50 shadow-xl">
          {/* Pinned: "New / Untrained" ribbon */}
          {isPinned && (
            <div className="absolute right-0 top-4 z-10 overflow-hidden">
              <div className="rotate-45 translate-x-6 translate-y-1 bg-gradient-to-r from-sky-500 to-indigo-500 px-8 py-1 text-center text-xs font-bold text-white shadow-md">
                New / Untrained
              </div>
            </div>
          )}

          {/* Top: centered circular avatar (story style) */}
          <div className="flex flex-col items-center px-5">
            <AvatarStory
              id={profile.id}
              size={88}
              isReady={isReady}
              isPinned={isPinned}
              href={`/profiles/${profile.id}`}
              showTooltip
              className="mb-3"
            />
            {/* Match % pill with gradient border */}
            <div className="mb-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 p-[2px] shadow-sm">
              <span className="flex rounded-full bg-white/95 px-3 py-0.5 text-sm font-bold text-zinc-800">
                Match {match}%
              </span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900">
              {profile.name}, {profile.age}
            </h2>
            <p className="text-sm text-zinc-500">{profile.city}</p>
            <p className={classNames("mt-2 text-center text-sm text-zinc-600", clampText.line2)}>
              {profile.bio}
            </p>
            {/* Colorful interest chips */}
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {displayInterests.map((i) => (
                <span
                  key={i}
                  className={classNames(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium transition hover:scale-105 hover:shadow-sm",
                    getChipColor(i)
                  )}
                >
                  {i}
                </span>
              ))}
            </div>
            {/* Floating actions on hover */}
            <FloatingActions className="mt-3 min-h-[2rem]" />
          </div>

          {/* Footer: larger glossy buttons */}
          <div className="mt-5 flex gap-2 px-5 pb-2">
            <Button
              href={isPinned ? `/profiles/${profile.id}` : `/avatar/${profile.id}`}
              variant="primary"
              className={classNames(
                "flex-1 py-2.5 text-sm",
                isPinned && "!bg-gradient-to-r !from-sky-500 !via-indigo-500 !to-violet-500 hover:!from-sky-600 hover:!via-indigo-600 hover:!to-violet-600"
              )}
            >
              {isPinned ? "Train Avatar" : "Chat with Avatar"}
            </Button>
            <Button href={`/profiles/${profile.id}`} variant="secondary" className="flex-1 py-2.5 text-sm">
              View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

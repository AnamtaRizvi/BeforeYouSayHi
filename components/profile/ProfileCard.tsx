"use client";

import { AvatarStory } from "@/components/profile/AvatarStory";
import { FloatingActions } from "@/components/profile/FloatingActions";
import { Button } from "@/components/ui/Button";
import { getChipClasses } from "@/lib/chipColors";
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
    <div className="group relative hover-lift">
      {/* Pinned: thin gradient ring (indigo → violet) */}
      <div
        className={classNames(
          "rounded-3xl transition-all duration-200 ease-out",
          isPinned && "bg-gradient-to-r from-indigo-500/40 to-violet-500/40 p-[1px]"
        )}
      >
        <div className="card-shine relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white py-6 shadow-sm transition-all duration-200 ease-out">
          {/* Tinted top strip (avatar area only) */}
          <div
            className={classNames(
              "absolute left-0 right-0 top-0 h-24 rounded-t-3xl bg-gradient-to-r from-indigo-50 via-violet-50 to-teal-50",
              isPinned && "h-28 from-indigo-100 via-violet-100 to-teal-100"
            )}
            aria-hidden
          />

          {isPinned && (
            <div className="absolute right-0 top-4 z-10 overflow-hidden">
              <div className="translate-x-6 translate-y-1 rotate-45 border border-amber-200/60 bg-amber-50 px-8 py-1 text-center text-xs font-medium text-amber-700">
                New / Untrained
              </div>
            </div>
          )}

          <div className="relative flex flex-col items-center px-5">
            <AvatarStory
              id={profile.id}
              size={88}
              isReady={isReady}
              isPinned={isPinned}
              href={`/profiles/${profile.id}`}
              showTooltip
              className="mb-3"
            />
            <span className="match-pill-shimmer mb-2 rounded-full border border-indigo-200/70 bg-indigo-50 px-3 py-0.5 text-sm font-semibold text-indigo-800">
              Match {match}%
            </span>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              {profile.name}, {profile.age}
            </h2>
            <p className="text-sm text-slate-500">{profile.city}</p>
            <p className={classNames("mt-2 text-center text-sm text-slate-600", clampText.line2)}>
              {profile.bio}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {displayInterests.map((i) => (
                <span
                  key={i}
                  className={classNames(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    getChipClasses(i)
                  )}
                >
                  {i}
                </span>
              ))}
            </div>
            <FloatingActions className="mt-3 min-h-[2rem]" />
          </div>

          <div className="relative mt-5 flex gap-2 px-5 pb-2">
            <Button
              href={isPinned ? `/profiles/${profile.id}` : `/avatar/${profile.id}`}
              variant="primary"
              className="flex-1 py-2.5 text-sm"
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

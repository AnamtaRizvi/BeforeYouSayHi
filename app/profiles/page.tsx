"use client";

import { useEffect, useState, useMemo } from "react";
import { useProfilesSearch } from "@/contexts/ProfilesSearchContext";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { AvatarStory } from "@/components/profile/AvatarStory";
import { Chip } from "@/components/ui/Chip";

type Profile = {
  id: string;
  order: number;
  name: string;
  age: number;
  city: string;
  bio: string;
  interests: string;
  photoUrl: string | null;
  avatar: { voiceProfileJson: string | null } | null;
};

export default function ProfilesPage() {
  const { search } = useProfilesSearch();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [shuffledOrder, setShuffledOrder] = useState<string[] | null>(null);

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((data) => {
        setProfiles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allInterests = useMemo(() => {
    const set = new Set<string>();
    profiles.forEach((p) => {
      try {
        const arr = JSON.parse(p.interests || "[]") as string[];
        arr.forEach((i) => set.add(i));
      } catch {}
    });
    return Array.from(set).sort();
  }, [profiles]);

  const filtered = useMemo(() => {
    let list = profiles;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.bio.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          (p.interests && p.interests.toLowerCase().includes(q))
      );
    }
    if (selectedInterest) {
      list = list.filter((p) => {
        try {
          const arr = JSON.parse(p.interests || "[]") as string[];
          return arr.includes(selectedInterest);
        } catch {
          return false;
        }
      });
    }
    return list;
  }, [profiles, search, selectedInterest]);

  const displayOrder = useMemo(() => {
    if (shuffledOrder === null) return filtered;
    const orderMap = new Map(shuffledOrder.map((id, i) => [id, i]));
    return [...filtered].sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999));
  }, [filtered, shuffledOrder]);

  const handleShuffle = () => {
    const ids = filtered.map((p) => p.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setShuffledOrder(ids);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-600">Loading profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm md:p-10">
        <div className="pl-5">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Preview their vibe before you say hi
          </h1>
          <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-500" aria-hidden />
          <p className="mt-3 text-sm text-slate-600">
            Chat with AI avatars (simulations). They may be inaccurate.
          </p>
        </div>
      </section>

      {/* Stories row */}
      <section className="overflow-x-auto pb-1 pt-1">
        <div className="flex gap-8">
          <div className="flex min-w-[88px] flex-shrink-0 flex-col items-center gap-2">
            <div className="flex h-[92px] w-[92px] flex-shrink-0 items-center justify-center rounded-full border-2 border-slate-200/80 bg-slate-50 text-2xl text-slate-400">
              ✨
            </div>
            <span className="text-xs font-medium text-slate-600">Your vibe</span>
          </div>
          {profiles.slice(0, 10).map((p) => (
            <div key={p.id} className="flex min-w-[88px] flex-shrink-0 flex-col items-center gap-2">
              <AvatarStory
                id={p.id}
                size={72}
                isReady={!!p.avatar?.voiceProfileJson}
                isPinned={p.order === 1}
                href={`/profiles/${p.id}`}
                showTooltip={false}
                showLabelBelow
              />
              <span className="max-w-[88px] truncate text-xs font-medium text-slate-600">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <Chip
          active={selectedInterest === null}
          onClick={() => setSelectedInterest(null)}
        >
          All
        </Chip>
        {allInterests.map((i) => (
          <Chip
            key={i}
            active={selectedInterest === i}
            onClick={() => setSelectedInterest(selectedInterest === i ? null : i)}
            colorful
          >
            {i}
          </Chip>
        ))}
        <button
          type="button"
          onClick={handleShuffle}
          className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition duration-200 ease-out hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
        >
          Shuffle
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {displayOrder.map((p) => (
          <ProfileCard key={p.id} profile={p} isPinned={p.order === 1} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-slate-500">No profiles match your filters.</p>
      )}
    </div>
  );
}

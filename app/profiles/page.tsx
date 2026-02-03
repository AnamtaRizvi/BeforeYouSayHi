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
  const [shuffledOrder, setShuffledOrder] = useState<number[] | null>(null);

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
        <p className="text-zinc-600">Loading profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero: glass card */}
      <section className="rounded-3xl border border-white/50 bg-white/70 p-8 shadow-xl backdrop-blur-md md:p-10">
        <h1 className="bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
          Preview their vibe before you say hi
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Chat with AI avatars (simulations). They may be inaccurate.
        </p>
      </section>

      {/* Stories row: horizontal scroll */}
      <section className="overflow-x-auto pb-2">
        <div className="flex gap-6">
          {/* "Your vibe" story at start */}
          <div className="flex min-w-[88px] flex-shrink-0 flex-col items-center gap-2">
            <div className="flex h-[100px] w-[100px] flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-indigo-400 to-violet-400 text-2xl shadow-lg ring-4 ring-white/50">
              ✨
            </div>
            <span className="text-xs font-medium text-zinc-600">Your vibe</span>
          </div>
          {/* 10 profile story bubbles */}
          {profiles.slice(0, 10).map((p) => (
            <div key={p.id} className="flex min-w-[88px] flex-shrink-0 flex-col items-center gap-2">
              <AvatarStory
                id={p.id}
                size={72}
                isReady={!!p.avatar?.voiceProfileJson}
                isPinned={p.order === 1}
                href={`/profiles/${p.id}`}
                showTooltip={false}
              />
              <span className="max-w-[88px] truncate text-xs font-medium text-zinc-600">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Filter bar: colorful pills + Shuffle */}
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
          className="ml-2 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md transition hover:scale-105 hover:shadow-lg"
        >
          Shuffle
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {displayOrder.map((p) => (
          <ProfileCard key={p.id} profile={p} isPinned={p.order === 1} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-zinc-500">No profiles match your filters.</p>
      )}
    </div>
  );
}

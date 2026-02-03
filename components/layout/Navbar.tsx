"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfilesSearch } from "@/contexts/ProfilesSearchContext";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const showSearch = pathname === "/profiles";
  const { search, setSearch } = useProfilesSearch();

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/profiles"
          className="shrink-0 bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-lg font-bold text-transparent hover:opacity-90"
        >
          EchoDate
        </Link>
        {showSearch && (
          <div className="flex-1 max-w-md mx-auto">
            <input
              type="search"
              placeholder="Search name, bio, interests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 backdrop-blur-sm focus:border-fuchsia-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
            />
          </div>
        )}
        <div className="shrink-0">
          <Button variant="ghost" href="/about" className="text-zinc-600">
            About
          </Button>
        </div>
      </div>
    </header>
  );
}

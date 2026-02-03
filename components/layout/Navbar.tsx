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
    <header className="sticky top-0 z-50 border-b border-indigo-100/80 bg-gradient-to-r from-indigo-50/40 via-white to-violet-50/40 shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/profiles"
          className="shrink-0 text-lg font-semibold tracking-tight text-indigo-700 hover:text-indigo-600 transition-colors"
        >
          EchoDate
        </Link>
        {showSearch && (
          <div className="mx-auto max-w-md flex-1">
            <input
              type="search"
              placeholder="Search name, bio, interests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-indigo-100 bg-indigo-50/30 px-4 py-2 text-sm text-slate-900 placeholder-slate-500 transition focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        )}
        <div className="shrink-0">
          <Button variant="ghost" href="/about" className="text-slate-600 hover:text-indigo-600">
            About
          </Button>
        </div>
      </div>
    </header>
  );
}

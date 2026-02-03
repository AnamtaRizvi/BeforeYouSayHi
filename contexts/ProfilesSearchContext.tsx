"use client";

import React, { createContext, useContext, useState } from "react";

type ContextValue = {
  search: string;
  setSearch: (s: string) => void;
};

const ProfilesSearchContext = createContext<ContextValue | null>(null);

export function ProfilesSearchProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState("");
  return (
    <ProfilesSearchContext.Provider value={{ search, setSearch }}>
      {children}
    </ProfilesSearchContext.Provider>
  );
}

export function useProfilesSearch(): ContextValue {
  const ctx = useContext(ProfilesSearchContext);
  if (!ctx) return { search: "", setSearch: () => {} };
  return ctx;
}

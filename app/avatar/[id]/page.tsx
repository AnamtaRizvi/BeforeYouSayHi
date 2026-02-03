"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { ProfileMiniCard } from "@/components/profile/ProfileMiniCard";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ControlsPanel } from "@/components/chat/ControlsPanel";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { Button } from "@/components/ui/Button";

type Profile = {
  id: string;
  name: string;
  age: number;
  city: string;
  interests: string;
  avatar: { voiceProfileJson: string | null } | null;
};

type Message = { role: "user" | "assistant"; content: string };

type Mode = "friendly" | "flirty" | "serious";
type Length = "short" | "medium" | "long";

function buildSuggestedPrompts(interests: string[]): string[] {
  const first = interests[0];
  const prompts: string[] = [];
  if (first) prompts.push(`Ask about ${first}`);
  prompts.push("Playful opener");
  prompts.push("Deep question");
  return prompts.slice(0, 3);
}

export default function AvatarChatPage() {
  const params = useParams();
  const id = params.id as string;
  const toast = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("friendly");
  const [length, setLength] = useState<Length>("medium");
  const [vibe, setVibe] = useState(50);
  const [notTrained, setNotTrained] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);

  const interests = useMemo(() => {
    if (!profile?.interests) return [];
    try {
      return JSON.parse(profile.interests || "[]") as string[];
    } catch {
      return [];
    }
  }, [profile]);
  const suggestedPrompts = useMemo(() => buildSuggestedPrompts(interests), [interests]);

  useEffect(() => {
    fetch(`/api/profiles/${id}`)
      .then((r) => r.json())
      .then((data: Profile) => {
        setProfile(data);
        setNotTrained(!data?.avatar?.voiceProfileJson);
      })
      .catch(() => {});
  }, [id]);

  const sendMessage = async (text: string) => {
    const msg = text.trim();
    if (!msg || !profile) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/avatar/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: id,
          sessionId,
          message: msg,
          mode,
          length,
          vibe,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.sessionId) setSessionId(data.sessionId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      if (data.notTrained) setNotTrained(true);
    } catch {
      toast.error("Failed to send");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col lg:flex-row lg:gap-6">
      <div className="flex flex-1 flex-col min-h-0 lg:min-w-0">
        <div className="mb-4 flex items-center gap-4 border-b border-zinc-200/80 pb-4">
          <ProfileMiniCard
            profileId={profile.id}
            name={profile.name}
            age={profile.age}
            city={profile.city}
            href={`/profiles/${id}`}
            showBadge
          />
        </div>

        <p className="mb-2 text-xs text-zinc-500">
          This is an AI-generated simulation based on the user&apos;s provided answers and style samples. It may be inaccurate.
        </p>
        {notTrained && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Avatar isn&apos;t trained yet — replies will be generic.
          </div>
        )}

        <ChatWindow
          messages={messages}
          loading={loading}
          suggestedPrompts={
            messages.length === 0 ? (
              <SuggestedPrompts prompts={suggestedPrompts} onSelect={sendMessage} />
            ) : undefined
          }
          input={
            <form onSubmit={handleSubmit} className="flex gap-2 pt-4 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={loading}
                className="flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:opacity-50"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                Send
              </Button>
            </form>
          }
          className="min-h-0 flex-1"
        />
      </div>

      <aside className="mt-6 shrink-0 lg:mt-0 lg:w-64">
        <div className="lg:sticky lg:top-24">
          <button
            type="button"
            onClick={() => setControlsOpen((o) => !o)}
            className="mb-2 w-full rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 lg:hidden"
          >
            {controlsOpen ? "Hide controls" : "Show controls"}
          </button>
          <div className={controlsOpen ? "block" : "hidden lg:block"}>
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-sm">
              <ControlsPanel
                mode={mode}
                length={length}
                vibe={vibe}
                onModeChange={setMode}
                onLengthChange={setLength}
                onVibeChange={setVibe}
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

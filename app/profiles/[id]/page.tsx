"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAvatarUrl } from "@/lib/avatar";
import { useToast } from "@/contexts/ToastContext";
import type { ConvoCalibrationEntry, ScenarioReplyEntry, VoiceProfileJson } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { classNames } from "@/lib/utils";

type Tab = "about" | "setup" | "calibration" | "preview";

type Profile = {
  id: string;
  order: number;
  name: string;
  age: number;
  city: string;
  bio: string;
  interests: string;
  photoUrl: string | null;
  avatar: {
    id: string;
    answersJson: string | null;
    styleSample: string | null;
    convoCalibrationJson: string | null;
    scenarioRepliesJson: string | null;
    voiceProfileJson: string | null;
  } | null;
};

const CALIBRATION_PROMPTS = [
  "Someone says: 'Hey you seem cool—what are you up to today?'",
  "How do you respond when someone replies late?",
  "Playful tease: 'Convince me you're not secretly boring 😄'",
  "Disagree lightly (food/music). What do you say?",
  "Set a boundary politely.",
  "Give a compliment.",
  "Ask a curious follow-up question.",
  "End a convo gracefully.",
];

const SCENARIO_TEMPLATES: { scenario: string; options: string[] }[] = [
  { scenario: "They ask what you do for fun.", options: ["I hike and read.", "Netflix and snacks mostly lol", "I'm into photography and coffee shops."] },
  { scenario: "They send a good morning text.", options: ["Good morning! ☀️ Hope you have a great day", "morning lol", "Hey! Same to you—sleep well?"] },
  { scenario: "They suggest meeting for coffee.", options: ["I'd love to! When works for you?", "Sure, we could do that", "Coffee sounds perfect—I know a good spot."] },
  { scenario: "They compliment your profile.", options: ["Aw thank you! Yours caught my eye too", "Thanks 😊", "That's sweet of you to say!"] },
  { scenario: "They ask about your weekend.", options: ["Pretty low-key—you?", "I went hiking! You?", "Just relaxed. How about you?"] },
  { scenario: "They use a lot of emojis.", options: ["Haha I love the energy 😄", "lol same", "You're fun—I like it."] },
];

const FEEDBACK_KEY = "echodate-avatar-feedback";

function getStoredFeedback(profileId: string): Record<number, "up" | "down"> {
  try {
    const raw = localStorage.getItem(`${FEEDBACK_KEY}-${profileId}`);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function setStoredFeedback(profileId: string, data: Record<number, "up" | "down">) {
  localStorage.setItem(`${FEEDBACK_KEY}-${profileId}`, JSON.stringify(data));
}

export default function ProfileDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const toast = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("about");

  const [answersJson, setAnswersJson] = useState("");
  const [styleSample, setStyleSample] = useState("");
  const [calibrationReplies, setCalibrationReplies] = useState<string[]>([]);
  const [scenarioReplies, setScenarioReplies] = useState<ScenarioReplyEntry[]>([]);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [previewMessages, setPreviewMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [previewInput, setPreviewInput] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSessionId, setPreviewSessionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<number, "up" | "down">>({});

  const loadProfile = useCallback(() => {
    return fetch(`/api/profiles/${id}`)
      .then((r) => r.json())
      .then((data: Profile) => {
        setProfile(data);
        if (data?.avatar) {
          setAnswersJson(data.avatar.answersJson ?? "{}");
          setStyleSample(data.avatar.styleSample ?? "");
          try {
            const cal = JSON.parse(data.avatar.convoCalibrationJson ?? "[]") as ConvoCalibrationEntry[];
            setCalibrationReplies(cal.map((c) => c.reply));
          } catch {
            setCalibrationReplies(CALIBRATION_PROMPTS.map(() => ""));
          }
          try {
            const scen = JSON.parse(data.avatar.scenarioRepliesJson ?? "[]") as ScenarioReplyEntry[];
            if (scen.length) setScenarioReplies(scen);
            else setScenarioReplies(SCENARIO_TEMPLATES.map((t) => ({ scenario: t.scenario, options: t.options, chosen: t.options[0] })));
          } catch {
            setScenarioReplies(SCENARIO_TEMPLATES.map((t) => ({ scenario: t.scenario, options: t.options, chosen: t.options[0] })));
          }
        }
        setFeedback(getStoredFeedback(id));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const isFirst = profile?.order === 1;
  const isUntrained = !profile?.avatar?.voiceProfileJson;

  const readinessPercent = profile?.avatar
    ? profile.avatar.voiceProfileJson
      ? 100
      : Math.min(
          100,
          (answersJson.trim() ? 25 : 0) +
            (styleSample.trim() ? 25 : 0) +
            (calibrationReplies.some((r) => r?.trim()) ? 50 : 0)
        )
    : 0;

  const handleSave = async () => {
    if (!profile?.avatar) return;
    setSaving(true);
    try {
      const convoCalibrationJson = CALIBRATION_PROMPTS.map((prompt, i) => ({
        prompt,
        reply: calibrationReplies[i] ?? "",
      }));
      await fetch(`/api/profiles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answersJson: answersJson.trim() || undefined,
          styleSample: styleSample.trim() || undefined,
          convoCalibrationJson: JSON.stringify(convoCalibrationJson),
          scenarioRepliesJson: JSON.stringify(scenarioReplies),
        }),
      });
      toast.success("Saved");
      loadProfile();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!profile) return;
    setRegenerating(true);
    try {
      const res = await fetch("/api/avatar/extractStyle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: id }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Voice profile regenerated");
      loadProfile();
    } catch {
      toast.error("Failed to regenerate");
    } finally {
      setRegenerating(false);
    }
  };

  const sendPreviewMessage = async (text: string) => {
    if (!text.trim() || !profile) return;
    setPreviewInput("");
    setPreviewMessages((prev) => [...prev, { role: "user", content: text }]);
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/avatar/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: id,
          sessionId: previewSessionId,
          message: text,
          mode: "friendly",
          length: "medium",
          vibe: 50,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.sessionId) setPreviewSessionId(data.sessionId);
      setPreviewMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      toast.error("Failed to send");
    } finally {
      setPreviewLoading(false);
    }
  };

  const setMessageFeedback = (index: number, value: "up" | "down") => {
    const next = { ...feedback, [index]: value };
    setFeedback(next);
    setStoredFeedback(id, next);
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  const interests = (() => {
    try {
      return JSON.parse(profile.interests || "[]") as string[];
    } catch {
      return [];
    }
  })();
  const match = Math.min(99, 60 + interests.length * 5);
  const voiceProfile = profile.avatar?.voiceProfileJson
    ? (JSON.parse(profile.avatar.voiceProfileJson) as VoiceProfileJson)
    : null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "about", label: "About" },
    { id: "setup", label: "Avatar Setup" },
    { id: "calibration", label: "Calibration" },
    { id: "preview", label: "Preview" },
  ];

  return (
    <div className="space-y-8">
      <Link href="/profiles" className="inline-block text-sm font-medium text-rose-600 hover:text-rose-700">
        ← Back to profiles
      </Link>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <Card className="h-fit lg:sticky lg:top-24" hover={false}>
          <div className="relative aspect-square w-full overflow-hidden rounded-t-3xl bg-zinc-100">
            <Image
              src={getAvatarUrl(profile.id, 400)}
              alt={profile.name}
              fill
              className="object-cover"
              sizes="340px"
            />
          </div>
          <CardContent>
            <h1 className="text-xl font-bold text-zinc-900">
              {profile.name}, {profile.age}
            </h1>
            <p className="text-sm text-zinc-500">{profile.city}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                Match {match}%
              </span>
              <span className="text-xs text-zinc-400">Last active today</span>
            </div>
            <p className="mt-3 text-sm text-zinc-600">{profile.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {interests.map((i) => (
                <span
                  key={i}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600"
                >
                  {i}
                </span>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700">Avatar</span>
                <Badge variant={isUntrained ? "not-trained" : "ready"} />
              </div>
              <ProgressBar value={isUntrained ? readinessPercent : 100} className="mt-2" />
            </div>
            <Button href={`/avatar/${id}`} variant="primary" className="mt-6 w-full">
              Chat with Avatar
            </Button>
          </CardContent>
        </Card>

        <div>
          <div className="mb-6 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={classNames(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  tab === t.id
                    ? "bg-gradient-to-r from-rose-500 to-violet-500 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "about" && (
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-zinc-500">Looking for</h3>
                  <p className="mt-1 text-zinc-800">Someone genuine and easy to talk to.</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-500">Communication style</h3>
                  <p className="mt-1 text-zinc-800">{voiceProfile?.tone ?? "Casual and friendly."}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-500">Ideal first date</h3>
                  <p className="mt-1 text-zinc-800">Coffee or a walk. Low key.</p>
                </div>
                <p className="text-zinc-600">{profile.bio}</p>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((i) => (
                    <span key={i} className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600">
                      {i}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "setup" && (
            <Card>
              <CardContent>
                {isFirst ? (
                  <div className="space-y-4">
                    <h2 className="font-semibold text-zinc-900">Avatar Setup</h2>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">Setup answers (JSON)</label>
                      <textarea
                        value={answersJson}
                        onChange={(e) => setAnswersJson(e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        placeholder='{"q1": "...", "a1": "..."}'
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700">Style sample</label>
                      <textarea
                        value={styleSample}
                        onChange={(e) => setStyleSample(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        placeholder="A short sample of how you write..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        variant="secondary"
                        className="bg-amber-100 text-amber-800 hover:bg-amber-200"
                      >
                        {regenerating ? "Regenerating..." : "Regenerate voice profile"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-zinc-600">This avatar is pre-trained with synthetic demo data.</p>
                    {voiceProfile && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <Card hover={false} className="border-zinc-100 bg-zinc-50">
                          <CardContent className="py-3">
                            <p className="text-xs font-medium text-zinc-500">Tone</p>
                            <p className="text-sm text-zinc-800">{voiceProfile.tone}</p>
                          </CardContent>
                        </Card>
                        <Card hover={false} className="border-zinc-100 bg-zinc-50">
                          <CardContent className="py-3">
                            <p className="text-xs font-medium text-zinc-500">Emoji</p>
                            <p className="text-sm text-zinc-800">{voiceProfile.emojiUsage}</p>
                          </CardContent>
                        </Card>
                        <Card hover={false} className="border-zinc-100 bg-zinc-50">
                          <CardContent className="py-3">
                            <p className="text-xs font-medium text-zinc-500">Verbosity</p>
                            <p className="text-sm text-zinc-800">{voiceProfile.verbosity}</p>
                          </CardContent>
                        </Card>
                        <Card hover={false} className="border-zinc-100 bg-zinc-50">
                          <CardContent className="py-3">
                            <p className="text-xs font-medium text-zinc-500">Personality</p>
                            <p className="text-sm text-zinc-800">{voiceProfile.personality}</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {tab === "calibration" && (
            <Card>
              <CardContent>
                {isFirst ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-zinc-900">Real Conversation Calibration</h2>
                      <span className="text-sm text-zinc-500">
                        {calibrationReplies.filter((r) => r?.trim()).length}/8
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600">Answer as {profile.name} would.</p>
                    <div className="space-y-4">
                      {CALIBRATION_PROMPTS.map((prompt, i) => (
                        <div key={i} className="space-y-2">
                          <ChatBubble role="assistant" content={prompt} />
                          <div className="flex justify-end">
                            <input
                              type="text"
                              value={calibrationReplies[i] ?? ""}
                              onChange={(e) => {
                                const next = [...calibrationReplies];
                                next[i] = e.target.value;
                                setCalibrationReplies(next);
                              }}
                              placeholder="Your reply..."
                              className="max-w-[85%] flex-1 rounded-2xl rounded-br-md border border-zinc-200 bg-white px-4 py-2 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <h3 className="font-semibold text-zinc-900">Scenario replies</h3>
                    {SCENARIO_TEMPLATES.map((t, i) => {
                      const s = scenarioReplies[i] ?? { scenario: t.scenario, options: t.options, chosen: t.options[0] };
                      return (
                        <div key={i} className="rounded-xl border border-zinc-200 p-4">
                          <p className="mb-2 text-sm font-medium text-zinc-700">{s.scenario}</p>
                          <div className="space-y-1">
                            {s.options.map((opt) => (
                              <label key={opt} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`scenario-${i}`}
                                  checked={s.chosen === opt}
                                  onChange={() => {
                                    const next = [...scenarioReplies];
                                    while (next.length <= i)
                                      next.push({
                                        scenario: SCENARIO_TEMPLATES[next.length].scenario,
                                        options: SCENARIO_TEMPLATES[next.length].options,
                                        chosen: SCENARIO_TEMPLATES[next.length].options[0],
                                      });
                                    next[i] = { ...next[i], scenario: t.scenario, options: t.options, chosen: opt };
                                    setScenarioReplies(next);
                                  }}
                                />
                                <span className="text-sm">{opt}</span>
                              </label>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={s.chosen}
                            onChange={(e) => {
                              const next = [...scenarioReplies];
                              while (next.length <= i)
                                next.push({
                                  scenario: SCENARIO_TEMPLATES[next.length].scenario,
                                  options: SCENARIO_TEMPLATES[next.length].options,
                                  chosen: SCENARIO_TEMPLATES[next.length].options[0],
                                });
                              next[i] = { ...next[i], scenario: t.scenario, options: t.options, chosen: e.target.value };
                              setScenarioReplies(next);
                            }}
                            className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                          />
                        </div>
                      );
                    })}
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save calibration"}
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="text-zinc-600">Pre-trained synthetic demo. Calibration is read-only.</p>
                    {voiceProfile && (
                      <div className="mt-4 rounded-xl bg-zinc-50 p-4">
                        <h3 className="font-medium text-zinc-800">Voice traits</h3>
                        <ul className="mt-2 space-y-1 text-sm text-zinc-600">
                          <li><strong>Tone:</strong> {voiceProfile.tone}</li>
                          <li><strong>Emoji:</strong> {voiceProfile.emojiUsage}</li>
                          <li><strong>Verbosity:</strong> {voiceProfile.verbosity}</li>
                          <li><strong>Personality:</strong> {voiceProfile.personality}</li>
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {tab === "preview" && (
            <Card>
              <CardContent>
                {isFirst ? (
                  <div className="space-y-4">
                    <p className="text-sm text-zinc-600">
                      Save setup and calibration, then &quot;Regenerate voice profile&quot;. Preview your avatar below.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleRegenerate} disabled={regenerating} variant="secondary">
                        {regenerating ? "Regenerating..." : "Regenerate voice profile"}
                      </Button>
                      <Button href={`/avatar/${id}`}>Preview in full chat</Button>
                    </div>
                    <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4">
                      <p className="mb-2 text-xs font-medium text-zinc-500">Preview your avatar</p>
                        <div className="flex max-h-80 flex-col space-y-3 overflow-y-auto">
                          {previewMessages.map((m, i) => (
                            <div key={i}>
                              <ChatBubble role={m.role} content={m.content} />
                              {m.role === "assistant" && (
                                <div className="mt-1 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setMessageFeedback(i, "up")}
                                    className={classNames(
                                      "rounded-full p-1.5 text-sm transition",
                                      feedback[i] === "up" ? "text-emerald-600" : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                    aria-label="Thumbs up"
                                  >
                                    👍
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMessageFeedback(i, "down")}
                                    className={classNames(
                                      "rounded-full p-1.5 text-sm transition",
                                      feedback[i] === "down" ? "text-rose-600" : "text-zinc-400 hover:text-zinc-600"
                                    )}
                                    aria-label="Thumbs down"
                                  >
                                    👎
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          {previewLoading && (
                            <div className="flex justify-start">
                              <div className="rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-500">
                                ...
                              </div>
                            </div>
                          )}
                        </div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            sendPreviewMessage(previewInput);
                          }}
                          className="mt-3 flex gap-2"
                        >
                          <input
                            type="text"
                            value={previewInput}
                            onChange={(e) => setPreviewInput(e.target.value)}
                            placeholder="Type a message..."
                            disabled={previewLoading}
                            className="flex-1 rounded-full border border-zinc-200 px-4 py-2 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:opacity-50"
                          />
                          <Button type="submit" disabled={previewLoading || !previewInput.trim()}>
                            Send
                          </Button>
                        </form>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-zinc-600">Synthetic demo avatar — preview available in Avatar Chat.</p>
                    <Button href={`/avatar/${id}`} className="mt-4">
                      Chat with Avatar
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

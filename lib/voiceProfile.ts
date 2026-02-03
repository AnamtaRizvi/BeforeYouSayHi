import type { VoiceProfileJson } from "./types";

/**
 * Deterministic voice profile generator from text inputs.
 * Same inputs → same output for stable demo.
 */
export function generateVoiceProfileFromInputs(
  name: string,
  answersJson: string | null,
  styleSample: string | null,
  convoCalibrationJson: string | null,
  scenarioRepliesJson: string | null
): VoiceProfileJson {
  const seed =
    [name, answersJson ?? "", styleSample ?? "", convoCalibrationJson ?? "", scenarioRepliesJson ?? ""].join("|");
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const r = (x: number) => {
    const s = Math.sin(x * 9999) * 10000;
    return s - Math.floor(s);
  };

  const personalities: Array<{
    tone: string;
    emojiUsage: string;
    verbosity: string;
    catchphrases: string[];
    personality: string;
  }> = [
    {
      tone: "warm and bubbly",
      emojiUsage: "heavy (😊✨💕)",
      verbosity: "medium-long",
      catchphrases: ["omg", "haha", "that's so fun"],
      personality: "enthusiastic, friendly",
    },
    {
      tone: "dry and sarcastic",
      emojiUsage: "minimal, occasional 😏",
      verbosity: "short",
      catchphrases: ["sure", "obviously", "I mean..."],
      personality: "witty, understated",
    },
    {
      tone: "soft and poetic",
      emojiUsage: "light (🌙✨)",
      verbosity: "medium",
      catchphrases: ["sometimes", "you know?", "kind of"],
      personality: "thoughtful, gentle",
    },
    {
      tone: "nerdy and technical",
      emojiUsage: "rare",
      verbosity: "medium-long",
      catchphrases: ["actually", "fun fact", "so basically"],
      personality: "curious, precise",
    },
    {
      tone: "formal and polite",
      emojiUsage: "none",
      verbosity: "medium",
      catchphrases: ["I'd be glad to", "Certainly", "Thank you"],
      personality: "courteous, reserved",
    },
    {
      tone: "super short texter",
      emojiUsage: "some 👍😂",
      verbosity: "very short",
      catchphrases: ["lol", "ok", "nice", "same"],
      personality: "concise, casual",
    },
    {
      tone: "flirty and playful",
      emojiUsage: "moderate (😉💜)",
      verbosity: "medium",
      catchphrases: ["you're cute", "maybe you'll find out", "we'll see"],
      personality: "teasing, warm",
    },
    {
      tone: "direct and honest",
      emojiUsage: "minimal",
      verbosity: "medium",
      catchphrases: ["honestly", "real talk", "no cap"],
      personality: "straightforward, genuine",
    },
    {
      tone: "goofy and random",
      emojiUsage: "heavy (🤪🐸💀)",
      verbosity: "variable",
      catchphrases: ["random but", "wait", "anyway"],
      personality: "silly, spontaneous",
    },
  ];

  const idx = Math.abs(h) % personalities.length;
  const p = personalities[idx];
  const sampleReplies = [
    p.catchphrases[0] + " " + (styleSample?.slice(0, 30) || "Hey there."),
    p.catchphrases[1] || "Sounds good.",
    p.catchphrases[2] || "Cool.",
  ];
  return {
    tone: p.tone,
    emojiUsage: p.emojiUsage,
    verbosity: p.verbosity,
    catchphrases: p.catchphrases,
    sampleReplies,
    personality: p.personality,
  };
}

import type { VoiceProfileJson } from "./types";

const SAFETY_REPLIES = {
  areYouThem: "I'm an AI avatar based on {name}'s inputs.",
  contact: "I can't share contact info or socials—this is just a preview.",
  meet: "This is a preview simulation. When you're ready, message the real person in the app!",
};

function applySafety(message: string, name: string): string | null {
  const lower = message.toLowerCase();
  if (
    lower.includes("are you them") ||
    lower.includes("are you real") ||
    lower.includes("is this really") ||
    lower.includes("actual person")
  )
    return SAFETY_REPLIES.areYouThem.replace("{name}", name);
  if (
    lower.includes("instagram") ||
    lower.includes("snap") ||
    lower.includes("number") ||
    lower.includes("contact") ||
    lower.includes("social")
  )
    return SAFETY_REPLIES.contact;
  if (
    lower.includes("meet") ||
    lower.includes("coffee") ||
    lower.includes("drinks") ||
    lower.includes("hang out") ||
    lower.includes("in person")
  )
    return SAFETY_REPLIES.meet;
  return null;
}

function pickFrom<T>(arr: T[], seed: number): T {
  return arr[Math.abs(Math.floor(seed * 1e6)) % arr.length];
}

export function mockAvatarReply(
  userMessage: string,
  name: string,
  voiceProfile: VoiceProfileJson | null,
  options: { mode?: string; length?: string; vibe?: number }
): string {
  const safety = applySafety(userMessage, name);
  if (safety) return safety;

  const mode = options.mode || "friendly";
  const length = options.length || "medium";
  const vibe = Math.min(100, Math.max(0, options.vibe ?? 50)) / 100;

  if (!voiceProfile) {
    const generic = [
      "Hey! I'm just a demo avatar—train my voice profile on my profile page to get more personalized replies.",
      "Thanks for messaging! This is a generic reply until my voice is set up.",
      "Hi there! Once my profile is trained, I'll sound more like me.",
    ];
    return pickFrom(generic, Math.random());
  }

  const { tone, emojiUsage, verbosity, catchphrases = [], personality } = voiceProfile;
  const useEmoji = vibe > 0.3 && (emojiUsage?.includes("heavy") || emojiUsage?.includes("moderate"));
  const short = verbosity === "very short" || length === "short";
  const long = verbosity === "medium-long" && length === "long";

  const openers = [
    catchphrases[0] || "Hey",
    catchphrases[1] || "So",
    catchphrases[2] || "Anyway",
  ].filter(Boolean);
  const opener = openers.length ? pickFrom(openers, Math.random()) : "Hey";

  let reply = opener;
  if (mode === "flirty" && vibe > 0.4) {
    reply += useEmoji ? " 😉 " : " ";
    reply += short ? "you're cute." : "I like where this is going...";
  } else if (mode === "serious") {
    reply += ". ";
    reply += short ? "Got it." : "I hear you. Let me know if you want to go deeper.";
  } else {
    reply += short ? "!" : ", that's cool. ";
    if (!short) reply += "I'm " + (personality || "pretty chill") + ". ";
    if (long) reply += "Feel free to ask me anything—I don't mind longer chats. ";
  }

  if (useEmoji) {
    const emojis = ["😊", "✨", "💕", "👍", "😂", "💜", "🌙"];
    reply += " " + pickFrom(emojis, Math.random());
  }

  return reply.trim();
}

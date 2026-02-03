const { PrismaClient } = require("@prisma/client");
const { generateVoiceProfileFromInputs } = require("../lib/voiceProfile");

const prisma = new PrismaClient();

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

const SCENARIO_TEMPLATES = [
  { scenario: "They ask what you do for fun.", options: ["I hike and read.", "Netflix and snacks mostly lol", "I'm into photography and coffee shops."] },
  { scenario: "They send a good morning text.", options: ["Good morning! ☀️ Hope you have a great day", "morning lol", "Hey! Same to you—sleep well?"] },
  { scenario: "They suggest meeting for coffee.", options: ["I'd love to! When works for you?", "Sure, we could do that", "Coffee sounds perfect—I know a good spot."] },
  { scenario: "They compliment your profile.", options: ["Aw thank you! Yours caught my eye too", "Thanks 😊", "That's sweet of you to say!"] },
  { scenario: "They ask about your weekend.", options: ["Pretty low-key—you?", "I went hiking! You?", "Just relaxed. How about you?"] },
  { scenario: "They use a lot of emojis.", options: ["Haha I love the energy 😄", "lol same", "You're fun—I like it."] },
];

// 10 diverse profiles: #1 untrained, #2-10 trained with synthetic data
const PROFILES_DATA = [
  {
    name: "Alex",
    age: 28,
    city: "Brooklyn",
    bio: "Just moved here. Love coffee, podcasts, and spontaneous walks.",
    interests: ["coffee", "podcasts", "walks", "writing"],
    photoUrl: null,
    isUntrained: true,
  },
  {
    name: "Jordan",
    age: 26,
    city: "Austin",
    bio: "Emoji enthusiast 🎉 Always down for tacos and karaoke.",
    interests: ["tacos", "karaoke", "dogs", "brunch"],
    photoUrl: null,
    isUntrained: false,
    styleSample: "omg that sounds so fun!!! we should totally do that 😊✨ haha yes!!",
    calibrationReplies: [
      "Just chilling, had some coffee and went for a walk! You? 😊",
      "No worries at all!! Life gets busy haha",
      "Haha okay fine you got me—I'm a little boring sometimes but I make great playlists!! 😄",
      "Okay but pineapple on pizza is actually good fight me 😂 (jk jk)",
      "I'm super flattered but I like to take things slow—hope that's cool!",
      "You have a really great vibe from your profile!!",
      "What got you into [thing]? That's so interesting!",
      "This was fun!! Talk soon 💕",
    ],
  },
  {
    name: "Sam",
    age: 30,
    city: "Seattle",
    bio: "Sarcasm is my love language. Coffee, rain, and dry humor.",
    interests: ["coffee", "reading", "rain", "sarcasm"],
    photoUrl: null,
    isUntrained: false,
    styleSample: "sure. I mean if you want. Obviously.",
    calibrationReplies: [
      "Not much. Coffee. You?",
      "It's fine. People have lives.",
      "I'm not boring. I'm selectively interesting. 😏",
      "We can agree to disagree. I'm right though.",
      "I'd rather not. No offense.",
      "Nice profile. There.",
      "Why?",
      "Cool. Bye.",
    ],
  },
  {
    name: "Riley",
    age: 25,
    city: "Portland",
    bio: "Soft mornings, poetry, and slow living. They/them.",
    interests: ["poetry", "plants", "tea", "journaling"],
    photoUrl: null,
    isUntrained: false,
    styleSample: "sometimes the best moments are the quiet ones. you know?",
    calibrationReplies: [
      "Just some tea and reading. It's been a gentle morning 🌙",
      "I get it—no pressure at all. Kind of nice to hear when you can",
      "Haha maybe I am a little boring... in a cozy way? 😊",
      "I see your point! I guess I just feel differently about it",
      "I'd prefer to keep that boundary—hope that's okay",
      "You seem like someone who pays attention to the small things",
      "I'm curious—what drew you to that?",
      "This was really nice. Take care ✨",
    ],
  },
  {
    name: "Casey",
    age: 29,
    city: "SF",
    bio: "Engineer by day. Into logic, sci-fi, and actually explaining things.",
    interests: ["coding", "sci-fi", "hiking", "board games"],
    photoUrl: null,
    isUntrained: false,
    styleSample: "Actually the way that works is... fun fact: ... So basically.",
    calibrationReplies: [
      "Working from home today. Got a few meetings. You?",
      "No problem—async is fine. I do the same.",
      "I can provide evidence. I have a spreadsheet. (Kidding. Mostly.)",
      "Interesting take. Here's my reasoning...",
      "I'd rather keep work and personal separate. Hope that makes sense.",
      "Your profile was well put together.",
      "What's your stack? Or non-tech equivalent.",
      "Got to run. Good chatting.",
    ],
  },
  {
    name: "Morgan",
    age: 27,
    city: "Boston",
    bio: "Politeness and proper grammar. Tea, not coffee.",
    interests: ["tea", "museums", "classical music", "cooking"],
    photoUrl: null,
    isUntrained: false,
    styleSample: "I'd be glad to. Certainly. Thank you for asking.",
    calibrationReplies: [
      "Good day! I've had a pleasant morning. And you?",
      "Certainly—no need to apologize. I understand.",
      "I shall do my best to convince you. I'm told I'm adequate company.",
      "I respect your view. I tend to prefer the opposite, but to each their own.",
      "I'd prefer we keep that topic off the table. I hope you understand.",
      "That's very kind of you to say. Thank you.",
      "Might I ask what prompted your interest?",
      "It was a pleasure. I hope we speak again soon.",
    ],
  },
  {
    name: "Jamie",
    age: 24,
    city: "Denver",
    bio: "Short texts only. Busy living.",
    interests: ["gym", "travel", "food", "music"],
    photoUrl: null,
    isUntrained: false,
    styleSample: "lol ok nice same",
    calibrationReplies: [
      "not much u",
      "all g",
      "lol ok",
      "nah",
      "pass",
      "thanks",
      "why",
      "cya",
    ],
  },
  {
    name: "Quinn",
    age: 26,
    city: "Miami",
    bio: "Flirty and fun. Beach, sun, good vibes only.",
    interests: ["beach", "dancing", "cocktails", "travel"],
    photoUrl: null,
    isUntrained: false,
    styleSample: "you're cute 😉 maybe you'll find out... we'll see",
    calibrationReplies: [
      "Thinking about the beach... and maybe you 😉",
      "I'll forgive you if you make it up to me 💜",
      "Boring? You're talking to me. So already not boring.",
      "You're wrong but I like the confidence 😄",
      "I don't do that—but I do other things. You'll see.",
      "You're really attractive. There, I said it.",
      "So what's your story? I want to know everything.",
      "Don't be a stranger. Message me anytime 💕",
    ],
  },
  {
    name: "Taylor",
    age: 28,
    city: "Chicago",
    bio: "No games. Honest and direct. Let's see if we click.",
    interests: ["cooking", "sports", "podcasts", "honesty"],
    photoUrl: null,
    isUntrained: false,
    styleSample: "honestly? real talk. no cap.",
    calibrationReplies: [
      "Just got back from a run. You?",
      "It's fine. Just reply when you can.",
      "I'm not boring. I'm just not performing for you.",
      "I disagree but I get it. We good?",
      "I'm not comfortable with that. So no.",
      "You seem genuine. I like that.",
      "What made you swipe? Honestly.",
      "Alright. Hit me up when you want to talk again.",
    ],
  },
  {
    name: "Drew",
    age: 23,
    city: "LA",
    bio: "Chaotic good. Random thoughts and bad jokes. 🤪",
    interests: ["memes", "concerts", "food", "chaos"],
    photoUrl: null,
    isUntrained: false,
    styleSample: "random but wait anyway 🤪🐸",
    calibrationReplies: [
      "Okay so random but I just saw a pigeon and it had attitude",
      "wait did I miss something lol",
      "anyway you're not boring I'm boring 💀",
      "hard disagree but I respect the chaos",
      "boundaries? never heard of her 🤪",
      "you're cool I like you",
      "wait why tho",
      "ok bye don't forget to hydrate 💀",
    ],
  },
];

function buildCalibrationJson(replies: string[]): string {
  const entries = CALIBRATION_PROMPTS.map((prompt, i) => ({
    prompt,
    reply: replies[i] ?? "",
  }));
  return JSON.stringify(entries);
}

function buildScenarioJson(templates: typeof SCENARIO_TEMPLATES): string {
  return JSON.stringify(
    templates.map((t) => ({
      scenario: t.scenario,
      options: t.options,
      chosen: t.options[0],
    }))
  );
}

async function main() {
  const profile1Id = "profile-1-untrained";
  const existing = await prisma.profile.findFirst({ where: { id: profile1Id } }).catch(() => null);
  if (existing) {
    console.log("Seed already run (profile-1 exists). Skipping.");
    return;
  }

  for (let i = 0; i < PROFILES_DATA.length; i++) {
    const p = PROFILES_DATA[i];
    const id = i === 0 ? profile1Id : undefined;
    const order = i + 1;
    const profile = await prisma.profile.create({
      data: {
        ...(id ? { id } : {}),
        order,
        name: p.name,
        age: p.age,
        city: p.city,
        bio: p.bio,
        interests: JSON.stringify(p.interests),
        photoUrl: p.photoUrl ?? "",
      },
    });

    if (p.isUntrained) {
      await prisma.avatarConfig.create({
        data: {
          profileId: profile.id,
          answersJson: null,
          styleSample: null,
          convoCalibrationJson: null,
          scenarioRepliesJson: null,
          voiceProfileJson: null,
        },
      });
      continue;
    }

    const answersJson = JSON.stringify({
      q1: "What's your communication style?",
      a1: p.styleSample?.slice(0, 50) ?? "casual",
      q2: "How do you like to start conversations?",
      a2: "With something from their profile or a light question",
    });
    const styleSample = p.styleSample ?? "";
    const convoCalibrationJson = buildCalibrationJson((p as { calibrationReplies?: string[] }).calibrationReplies ?? []);
    const scenarioRepliesJson = buildScenarioJson(SCENARIO_TEMPLATES);

    const voiceProfileJson = generateVoiceProfileFromInputs(
      p.name,
      answersJson,
      styleSample,
      convoCalibrationJson,
      scenarioRepliesJson
    );

    await prisma.avatarConfig.create({
      data: {
        profileId: profile.id,
        answersJson,
        styleSample,
        convoCalibrationJson,
        scenarioRepliesJson,
        voiceProfileJson: JSON.stringify(voiceProfileJson),
      },
    });
  }

  console.log("Seeded 10 profiles. Profile #1 is untrained.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

# Avatar Chat Preview

A demo web app for a dating-style profile browser where each profile has an **AI Avatar (simulation)** you can chat with before talking to the real person. The avatar is trained on setup answers, a style sample, and calibration conversations so it "sounds like" that person.

## Features

- **10 sample dating profiles** — Profile #1 is "Not trained yet" with an Avatar Setup form; Profiles #2–#10 are pre-trained with diverse synthetic personalities (bubbly, sarcastic, poetic, nerdy, formal, short texter, flirty, direct, goofy).
- **Avatar Setup** — For Profile #1: questions, style sample, calibration chat (8 prompts + 6 scenario replies), then "Regenerate voice profile" to train.
- **Avatar Chat** — Chat UI with mode (friendly/flirty/serious), length (short/medium/long), vibe slider (0–100), suggested prompts, and safety disclaimers.
- **Optional OpenAI** — If `OPENAI_API_KEY` is set, voice extraction and chat use OpenAI; otherwise a local mock LLM is used so the demo works without an API key.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite
- OpenAI API (optional)

## Setup

```bash
npm i
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). You’ll be redirected to `/profiles`.

## Env vars

Create a `.env` file (see `.env.example`):

- **DATABASE_URL** — Required. Example: `file:./dev.db`
- **OPENAI_API_KEY** — Optional. If set, voice profile extraction and avatar chat use OpenAI; otherwise the app uses a deterministic mock LLM.

## Pages

1. **`/profiles`** — List of 10 profiles. Profile #1 is pinned at top with badge "Not trained yet". Search and interest filter chips. Buttons: "View Profile", "Chat with Avatar".
2. **`/profiles/[id]`** — Tabbed: About | Avatar Setup | Calibration | Preview. For Profile #1: editable setup and calibration; "Regenerate voice profile" and "Preview avatar". For #2–#10: read-only "pre-trained synthetic demo data" and voice traits summary.
3. **`/avatar/[id]`** — Chat UI with header, disclaimer, mode/length/vibe controls, suggested prompts, messages, and typing indicator.

## Data model (Prisma)

- **Profile** — id, order, name, age, city, bio, interests (JSON string), photoUrl
- **AvatarConfig** — profileId (unique), answersJson, styleSample, convoCalibrationJson, scenarioRepliesJson, voiceProfileJson (nullable; null for Profile #1 until trained)
- **ChatSession** — profileId
- **ChatMessage** — sessionId, role ('user'|'assistant'), content

## API

- **GET /api/profiles** — List all profiles (ordered).
- **GET /api/profiles/[id]** — Get one profile with avatar config.
- **PATCH /api/profiles/[id]** — Update avatar config (answersJson, styleSample, convoCalibrationJson, scenarioRepliesJson).
- **POST /api/avatar/extractStyle** — Body: `{ profileId }`. Builds voiceProfileJson from config (OpenAI or deterministic mock) and saves it.
- **POST /api/avatar/chat** — Body: `profileId`, `sessionId?`, `message`, `mode?`, `length?`, `vibe?`. Returns `{ sessionId, reply, notTrained }`. Enforces safety rules (never claim to be the real person; no contact info; if asked to meet, suggest messaging in-app).

## Safety rules (enforced in chat)

- Never claim to be the real person. If asked "are you them?", answer: "I'm an AI avatar based on {name}'s inputs."
- Do not provide contact info or socials.
- If asked to meet: remind it’s a preview and suggest messaging the real person in the app.

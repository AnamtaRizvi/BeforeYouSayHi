import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVoiceProfileFromInputs } from "@/lib/voiceProfile";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId } = body;
    if (!profileId) {
      return NextResponse.json({ error: "profileId required" }, { status: 400 });
    }

    const config = await prisma.avatarConfig.findUnique({
      where: { profileId },
      include: { profile: true },
    });
    if (!config) {
      return NextResponse.json({ error: "AvatarConfig not found" }, { status: 404 });
    }

    const answersJson = config.answersJson ?? null;
    const styleSample = config.styleSample ?? null;
    const convoCalibrationJson = config.convoCalibrationJson ?? null;
    const scenarioRepliesJson = config.scenarioRepliesJson ?? null;

    let voiceProfileJson: object;

    if (process.env.OPENAI_API_KEY) {
      try {
        const { default: OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const systemContent = `You are an expert at extracting communication style from user inputs.
Given the following inputs, produce a compact JSON object with exactly these keys (all strings or string arrays):
tone, emojiUsage, verbosity, catchphrases (array), personality.
No other keys. Output only valid JSON.`;

        const userContent = [
          "answersJson: " + (answersJson ?? "{}"),
          "styleSample: " + (styleSample ?? ""),
          "convoCalibrationJson: " + (convoCalibrationJson ?? "[]"),
          "scenarioRepliesJson: " + (scenarioRepliesJson ?? "[]"),
        ].join("\n");

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemContent },
            { role: "user", content: userContent },
          ],
          temperature: 0.3,
        });
        const text = completion.choices[0]?.message?.content?.trim() ?? "{}";
        const parsed = JSON.parse(text.replace(/^```json?\s*|\s*```$/g, ""));
        voiceProfileJson = {
          tone: parsed.tone ?? "friendly",
          emojiUsage: parsed.emojiUsage ?? "minimal",
          verbosity: parsed.verbosity ?? "medium",
          catchphrases: Array.isArray(parsed.catchphrases) ? parsed.catchphrases : [],
          personality: parsed.personality ?? "friendly",
        };
      } catch (err) {
        console.error("OpenAI extractStyle error:", err);
        voiceProfileJson = generateVoiceProfileFromInputs(
          config.profile.name,
          answersJson,
          styleSample,
          convoCalibrationJson,
          scenarioRepliesJson
        );
      }
    } else {
      voiceProfileJson = generateVoiceProfileFromInputs(
        config.profile.name,
        answersJson,
        styleSample,
        convoCalibrationJson,
        scenarioRepliesJson
      );
    }

    const updated = await prisma.avatarConfig.update({
      where: { profileId },
      data: { voiceProfileJson: JSON.stringify(voiceProfileJson) },
    });

    return NextResponse.json({
      voiceProfileJson: updated.voiceProfileJson ? JSON.parse(updated.voiceProfileJson) : null,
    });
  } catch (e) {
    console.error("extractStyle error:", e);
    return NextResponse.json({ error: "Failed to extract style" }, { status: 500 });
  }
}

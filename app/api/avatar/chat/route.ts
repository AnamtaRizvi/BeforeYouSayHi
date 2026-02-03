import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockAvatarReply } from "@/lib/mockLLM";

const SAFETY_RULES = `
- Never claim to be the real person. If asked "are you them?" or similar, answer: "I'm an AI avatar based on {name}'s inputs."
- Do not provide contact info or socials.
- If asked to meet in person, remind that this is a preview and suggest messaging the real person in the app.
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, sessionId: bodySessionId, message, mode, length, vibe } = body;
    if (!profileId || !message) {
      return NextResponse.json({ error: "profileId and message required" }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { avatar: true },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let sessionId = bodySessionId;
    if (!sessionId) {
      const session = await prisma.chatSession.create({
        data: { profileId },
      });
      sessionId = session.id;
    } else {
      const existing = await prisma.chatSession.findFirst({
        where: { id: sessionId, profileId },
      });
      if (!existing) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
    }

    await prisma.chatMessage.create({
      data: { sessionId, role: "user", content: message },
    });

    const voiceProfileJson = profile.avatar?.voiceProfileJson
      ? (JSON.parse(profile.avatar.voiceProfileJson) as object)
      : null;
    const notTrained = !voiceProfileJson;

    let assistantContent: string;

    if (process.env.OPENAI_API_KEY && !notTrained) {
      try {
        const { default: OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const systemPrompt = [
          `You are an AI Avatar simulation of ${profile.name}.`,
          "Traits: " + JSON.stringify(voiceProfileJson),
          "Apply viewer controls: mode=" + (mode || "friendly") + ", length=" + (length || "medium") + ", vibe=" + (vibe ?? 50),
          SAFETY_RULES.replace(/{name}/g, profile.name),
        ].join("\n");

        const history = await prisma.chatMessage.findMany({
          where: { sessionId },
          orderBy: { createdAt: "asc" },
          take: 20,
        });
        const messages = history.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }));
        messages.unshift({ role: "system" as const, content: systemPrompt });

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: messages as { role: "user" | "assistant" | "system"; content: string }[],
          temperature: 0.7,
          max_tokens: 300,
        });
        assistantContent = completion.choices[0]?.message?.content?.trim() ?? "I'm not sure what to say.";
      } catch (err) {
        console.error("OpenAI chat error:", err);
        assistantContent = mockAvatarReply(
          message,
          profile.name,
          voiceProfileJson,
          { mode, length, vibe }
        );
      }
    } else {
      assistantContent = mockAvatarReply(
        message,
        profile.name,
        voiceProfileJson,
        { mode, length, vibe }
      );
    }

    await prisma.chatMessage.create({
      data: { sessionId, role: "assistant", content: assistantContent },
    });

    return NextResponse.json({
      sessionId,
      reply: assistantContent,
      notTrained,
    });
  } catch (e) {
    console.error("chat error:", e);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}

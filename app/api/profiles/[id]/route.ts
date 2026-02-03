import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const profile = await prisma.profile.findUnique({
    where: { id },
    include: { avatar: true },
  });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const profile = await prisma.profile.findUnique({
    where: { id },
    include: { avatar: true },
  });
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const avatar = profile.avatar;
  if (!avatar) return NextResponse.json({ error: "No avatar config" }, { status: 404 });

  const updates: { answersJson?: string; styleSample?: string; convoCalibrationJson?: string; scenarioRepliesJson?: string } = {};
  if (body.answersJson !== undefined) updates.answersJson = typeof body.answersJson === "string" ? body.answersJson : JSON.stringify(body.answersJson);
  if (body.styleSample !== undefined) updates.styleSample = body.styleSample;
  if (body.convoCalibrationJson !== undefined) updates.convoCalibrationJson = typeof body.convoCalibrationJson === "string" ? body.convoCalibrationJson : JSON.stringify(body.convoCalibrationJson);
  if (body.scenarioRepliesJson !== undefined) updates.scenarioRepliesJson = typeof body.scenarioRepliesJson === "string" ? body.scenarioRepliesJson : JSON.stringify(body.scenarioRepliesJson);

  await prisma.avatarConfig.update({
    where: { profileId: id },
    data: updates,
  });

  const updated = await prisma.profile.findUnique({
    where: { id },
    include: { avatar: true },
  });
  return NextResponse.json(updated);
}

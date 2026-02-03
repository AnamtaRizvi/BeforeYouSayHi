import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profiles = await prisma.profile.findMany({
    orderBy: { order: "asc" },
    include: { avatar: true },
  });
  return NextResponse.json(profiles);
}

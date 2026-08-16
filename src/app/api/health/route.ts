import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ database: "ok", status: "ok" });
  } catch {
    return NextResponse.json({ database: "unavailable", status: "degraded" }, { status: 503 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 });
  const preferences = await prisma.user.findUnique({ where: { id: user.id }, select: { emailAlertsEnabled: true } });
  return NextResponse.json(preferences);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 });
  const body = await request.json() as { emailAlertsEnabled?: unknown };
  if (typeof body.emailAlertsEnabled !== "boolean") return NextResponse.json({ error: "Preferencia invalida" }, { status: 400 });
  const preferences = await prisma.user.update({ where: { id: user.id }, data: { emailAlertsEnabled: body.emailAlertsEnabled }, select: { emailAlertsEnabled: true } });
  return NextResponse.json(preferences);
}

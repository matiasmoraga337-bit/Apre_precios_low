import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 });
  const preferences = await prisma.user.findUnique({ where: { id: user.id }, select: { emailAlertsEnabled: true, telegramAlertsEnabled: true, telegramChatId: true } });
  return NextResponse.json(preferences);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 });
  const body = await request.json() as { emailAlertsEnabled?: unknown; telegramAlertsEnabled?: unknown; telegramChatId?: unknown };
  if (typeof body.emailAlertsEnabled !== "boolean" && typeof body.telegramAlertsEnabled !== "boolean" && body.telegramChatId === undefined) return NextResponse.json({ error: "Preferencia invalida" }, { status: 400 });
  const telegramChatId = body.telegramChatId === undefined ? undefined : typeof body.telegramChatId === "string" && body.telegramChatId.trim() !== "" ? body.telegramChatId.trim() : null;
  if (telegramChatId !== undefined && telegramChatId !== null && !/^-?\d{1,20}$/.test(telegramChatId)) return NextResponse.json({ error: "Chat ID de Telegram invalido" }, { status: 400 });
  if (body.telegramAlertsEnabled === true && !telegramChatId) return NextResponse.json({ error: "Agrega un Chat ID antes de activar Telegram" }, { status: 400 });
  const preferences = await prisma.user.update({ where: { id: user.id }, data: { ...(typeof body.emailAlertsEnabled === "boolean" ? { emailAlertsEnabled: body.emailAlertsEnabled } : {}), ...(typeof body.telegramAlertsEnabled === "boolean" ? { telegramAlertsEnabled: body.telegramAlertsEnabled } : {}), ...(telegramChatId !== undefined ? { telegramChatId } : {}) }, select: { emailAlertsEnabled: true, telegramAlertsEnabled: true, telegramChatId: true } });
  return NextResponse.json(preferences);
}

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  createSession,
  consumeAuthRateLimit,
  hashPassword,
  normalizeEmail,
  requestRateLimitKey,
  SESSION_COOKIE,
  sessionCookieOptions,
  validateCredentials,
} from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: unknown; password?: unknown };
    const credentials = validateCredentials(body.email, body.password);
    if (!consumeAuthRateLimit(requestRateLimitKey(request, credentials.email))) {
      return NextResponse.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });
    }
    const user = await prisma.user.create({ data: { email: normalizeEmail(credentials.email), passwordHash: await hashPassword(credentials.password) } });
    const session = await createSession(user.id);
    const response = NextResponse.json({ user: { email: user.email, id: user.id } }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.expiresAt));
    return response;
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "No fue posible crear la cuenta" }, { status: 409 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "No fue posible crear la cuenta" }, { status: 400 });
  }
}

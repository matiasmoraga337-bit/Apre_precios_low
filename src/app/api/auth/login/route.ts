import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeAuthRateLimit, createSession, requestRateLimitKey, SESSION_COOKIE, sessionCookieOptions, validateCredentials, verifyPassword } from "@/server/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: unknown; password?: unknown };
    const credentials = validateCredentials(body.email, body.password);
    if (!consumeAuthRateLimit(requestRateLimitKey(request, credentials.email))) {
      return NextResponse.json({ error: "Demasiados intentos. Espera unos minutos." }, { status: 429 });
    }
    const user = await prisma.user.findUnique({ where: { email: credentials.email } });
    if (!user || !(await verifyPassword(credentials.password, user.passwordHash))) {
      return NextResponse.json({ error: "Correo o contrasena incorrectos" }, { status: 401 });
    }
    const session = await createSession(user.id);
    const response = NextResponse.json({ user: { email: user.email, id: user.id } });
    response.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.expiresAt));
    return response;
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Solicitud invalida" }, { status: 400 });
  }
}

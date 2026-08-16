import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, SESSION_COOKIE, validatePassword, verifyPassword } from "@/server/auth";

export async function DELETE(request: Request) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 });

  try {
    const body = await request.json() as { password?: unknown };
    validatePassword(body.password);
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id }, select: { passwordHash: true } });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return NextResponse.json({ error: "La contrasena no coincide" }, { status: 403 });
    }
    await prisma.user.delete({ where: { id: sessionUser.id } });
    const response = NextResponse.json({ ok: true });
    response.cookies.delete(SESSION_COOKIE);
    return response;
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Solicitud invalida" }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { consumePasswordResetToken, validatePassword } from "@/server/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { password?: unknown; token?: unknown };
    if (typeof body.token !== "string" || body.token.length > 200) throw new Error("Token invalido");
    validatePassword(body.password);
    const consumed = await consumePasswordResetToken(body.token, body.password);
    if (!consumed) return NextResponse.json({ error: "El enlace no es valido o ya expiro" }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No fue posible cambiar la contrasena" }, { status: 400 });
  }
}

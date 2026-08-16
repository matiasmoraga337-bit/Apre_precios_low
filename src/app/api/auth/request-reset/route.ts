import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeAuthRateLimit, createPasswordResetToken, normalizeEmail, requestRateLimitKey } from "@/server/auth";
import { sendPasswordResetEmail } from "@/server/email";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: unknown };
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    if (!email || !email.includes("@") || !consumeAuthRateLimit(requestRateLimitKey(request, email))) return NextResponse.json({ message: "Si la cuenta existe, recibiras un correo." });
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const reset = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail(user.email, reset.token);
    }
    return NextResponse.json({ message: "Si la cuenta existe, recibiras un correo." });
  } catch {
    return NextResponse.json({ message: "Si la cuenta existe, recibiras un correo." });
  }
}

import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "../lib/prisma";

export const SESSION_COOKIE = "apre_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 60;
const PASSWORD_SALT_ROUNDS = 12;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; expiresAt: number }>();

export type PublicUser = { email: string; id: string };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateCredentials(email: unknown, password: unknown): { email: string; password: string } {
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) {
    throw new Error("Ingresa un correo valido");
  }
  validatePassword(password);
  return { email: normalizeEmail(email), password };
}

export function validatePassword(password: unknown): asserts password is string {
  if (typeof password !== "string" || password.length < 12 || password.length > 128) throw new Error("La contrasena debe tener entre 12 y 128 caracteres");
}

export function consumeAuthRateLimit(key: string): boolean {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.expiresAt <= now) {
    attempts.set(key, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_LIMIT_MAX_ATTEMPTS) return false;
  current.count += 1;
  return true;
}

export function requestRateLimitKey(request: Request, email: string): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return `${forwardedFor}:${normalizeEmail(email)}`;
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  await prisma.passwordResetToken.create({ data: { expiresAt, tokenHash: hashResetToken(token), userId } });
  return { expiresAt, token };
}

export async function consumePasswordResetToken(token: string, password: string): Promise<boolean> {
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashResetToken(token) } });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) return false;
  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ data: { passwordHash }, where: { id: resetToken.userId } }),
    prisma.passwordResetToken.update({ data: { usedAt: new Date() }, where: { id: resetToken.id } }),
    prisma.session.deleteMany({ where: { userId: resetToken.userId } }),
  ]);
  return true;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { expiresAt, tokenHash: hashSessionToken(token), userId } });
  return { expiresAt, token };
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    expires: expiresAt,
    httpOnly: true,
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({ where: { tokenHash: hashSessionToken(token), }, include: { user: true } });
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return { email: session.user.email, id: session.user.id };
}

export async function deleteCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

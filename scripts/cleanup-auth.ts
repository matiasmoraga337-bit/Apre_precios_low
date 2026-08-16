import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const now = new Date();
  const sessions = await prisma.session.deleteMany({ where: { expiresAt: { lt: now } } });
  const resetTokens = await prisma.passwordResetToken.deleteMany({ where: { OR: [{ expiresAt: { lt: now } }, { usedAt: { not: null } }] } });
  console.log(`Sesiones eliminadas: ${sessions.count}. Tokens de recuperacion eliminados: ${resetTokens.count}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Auth cleanup failed");
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());

import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const offers = await prisma.offer.findMany({ include: { priceSnapshots: true } });
  const groups = new Map<string, typeof offers>();
  for (const offer of offers) {
    const key = `${offer.productId}:${offer.storeId}`;
    groups.set(key, [...(groups.get(key) ?? []), offer]);
  }

  let removed = 0;
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const [survivor, ...duplicates] = [...group].sort((left, right) => {
      const leftDate = left.lastCheckedAt?.getTime() ?? 0;
      const rightDate = right.lastCheckedAt?.getTime() ?? 0;
      return rightDate - leftDate || right.priceSnapshots.length - left.priceSnapshots.length;
    });

    for (const duplicate of duplicates) {
      await prisma.$transaction(async (transaction) => {
        for (const snapshot of duplicate.priceSnapshots) {
          await transaction.priceSnapshot.upsert({
            where: { offerId_capturedAt: { capturedAt: snapshot.capturedAt, offerId: survivor.id } },
            update: { available: snapshot.available, discountPercent: snapshot.discountPercent, originalPriceClp: snapshot.originalPriceClp, priceClp: snapshot.priceClp },
            create: { available: snapshot.available, capturedAt: snapshot.capturedAt, discountPercent: snapshot.discountPercent, offerId: survivor.id, originalPriceClp: snapshot.originalPriceClp, priceClp: snapshot.priceClp },
          });
        }
        await transaction.offer.delete({ where: { id: duplicate.id } });
      });
      removed += 1;
      console.log(`Consolidada oferta duplicada: ${duplicate.externalProductId} -> ${survivor.externalProductId}`);
    }
  }
  console.log(`Ofertas duplicadas eliminadas: ${removed}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Offer deduplication failed");
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());

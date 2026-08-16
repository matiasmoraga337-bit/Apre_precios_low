import { PrismaClient, StoreCode } from "@prisma/client";
import { mockDeals } from "../src/data/mock-deals";
import { mockPriceHistory } from "../src/data/mock-history";

const prisma = new PrismaClient();

const storeDetails: Record<StoreCode, { name: string; website: string }> = {
  STEAM: { name: "Steam", website: "https://store.steampowered.com" },
  ENEBA: { name: "Eneba", website: "https://www.eneba.com" },
  XBOX: { name: "Xbox", website: "https://www.xbox.com" },
  EPIC: { name: "Epic Games", website: "https://store.epicgames.com" },
};

function storeCodeFromId(store: string): StoreCode {
  return store.toUpperCase() as StoreCode;
}

async function main() {
  for (const [code, details] of Object.entries(storeDetails) as [StoreCode, { name: string; website: string }][]) {
    await prisma.store.upsert({
      where: { code },
      update: details,
      create: { code, ...details },
    });
  }

  for (const deal of mockDeals) {
    const product = await prisma.product.upsert({
      where: { slug: deal.id },
      update: { accent: deal.accent, genre: deal.genre, initials: deal.initials, title: deal.title },
      create: { accent: deal.accent, genre: deal.genre, initials: deal.initials, slug: deal.id, title: deal.title },
    });
    const store = await prisma.store.findUniqueOrThrow({ where: { code: storeCodeFromId(deal.store) } });
    const offer = await prisma.offer.upsert({
      where: { storeId_externalProductId: { externalProductId: deal.id, storeId: store.id } },
      update: {
        available: true,
        currentPriceClp: deal.currentPrice,
        discountPercent: deal.discountPercent,
        lastCheckedAt: new Date(),
        originalPriceClp: Math.round(deal.currentPrice / (1 - deal.discountPercent / 100)),
        productId: product.id,
        url: `${store.website}/app/${deal.id}`,
      },
      create: {
        available: true,
        currency: "CLP",
        currentPriceClp: deal.currentPrice,
        discountPercent: deal.discountPercent,
        externalProductId: deal.id,
        lastCheckedAt: new Date(),
        originalPriceClp: Math.round(deal.currentPrice / (1 - deal.discountPercent / 100)),
        productId: product.id,
        storeId: store.id,
        url: `${store.website}/app/${deal.id}`,
      },
    });
    const history = mockPriceHistory[deal.id] ?? [];
    for (const point of history) {
      await prisma.priceSnapshot.upsert({
        where: { offerId_capturedAt: { capturedAt: new Date(point.date), offerId: offer.id } },
        update: { available: true, discountPercent: deal.discountPercent, priceClp: point.price },
        create: { available: true, capturedAt: new Date(point.date), discountPercent: deal.discountPercent, offerId: offer.id, priceClp: point.price },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());

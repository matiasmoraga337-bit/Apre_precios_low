import { StoreCode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SteamAdapter, type SteamOffer } from "@/integrations/steam/steam-adapter";

function slugForSteamApp(app: SteamOffer): string {
  return `steam-${app.externalProductId}`;
}

function snapshotTime(): Date {
  const now = Date.now();
  return new Date(Math.floor(now / 60000) * 60000);
}

export async function syncSteamApp(appId: number): Promise<SteamOffer> {
  const steamOffer = await new SteamAdapter().getAppDetails(appId);
  const store = await prisma.store.upsert({
    where: { code: StoreCode.STEAM },
    update: {},
    create: { code: StoreCode.STEAM, name: "Steam", website: "https://store.steampowered.com" },
  });
  const existingProduct = await prisma.product.findFirst({ where: { title: steamOffer.title } });
  const product = existingProduct
    ? await prisma.product.update({
        where: { id: existingProduct.id },
        data: { genre: steamOffer.genre, initials: steamOffer.initials, title: steamOffer.title },
      })
    : await prisma.product.create({
        data: { accent: "#6f7cf5", genre: steamOffer.genre, initials: steamOffer.initials, slug: slugForSteamApp(steamOffer), title: steamOffer.title },
      });
  const existingOffer = await prisma.offer.findFirst({ where: { productId: product.id, storeId: store.id } });
  const offerData = {
    available: true,
    currency: steamOffer.currency,
    currentPriceClp: steamOffer.priceClp,
    discountPercent: steamOffer.discountPercent,
    externalProductId: steamOffer.externalProductId,
    lastCheckedAt: new Date(),
    originalPriceClp: steamOffer.originalPriceClp,
    productId: product.id,
    storeId: store.id,
    url: steamOffer.url,
  };
  const offer = existingOffer
    ? await prisma.offer.update({ data: offerData, where: { id: existingOffer.id } })
    : await prisma.offer.create({ data: offerData });

  const capturedAt = snapshotTime();
  await prisma.priceSnapshot.upsert({
    where: { offerId_capturedAt: { capturedAt, offerId: offer.id } },
    update: { available: true, discountPercent: steamOffer.discountPercent, originalPriceClp: steamOffer.originalPriceClp, priceClp: steamOffer.priceClp },
    create: { available: true, capturedAt, discountPercent: steamOffer.discountPercent, offerId: offer.id, originalPriceClp: steamOffer.originalPriceClp, priceClp: steamOffer.priceClp },
  });

  return steamOffer;
}

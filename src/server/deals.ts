import { prisma } from "@/lib/prisma";
import type { Deal, PricePoint } from "@/types/deals";

const relativeFormatter = new Intl.RelativeTimeFormat("es-CL", { numeric: "always" });
const historyFormatter = new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short" });

function formatRelative(date: Date | null): string {
  if (!date) return "sin registro";

  const minutes = Math.round((date.getTime() - Date.now()) / 60000);
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, "minute");
  return relativeFormatter.format(Math.round(minutes / 60), "hour");
}

function formatHistoryLabel(date: Date): string {
  return historyFormatter.format(date).replace(".", "");
}

function mapOffer(offer: {
  currentPriceClp: number;
  discountPercent: number;
  id: string;
  lastCheckedAt: Date | null;
  priceSnapshots: { priceClp: number }[];
  product: { accent: string; genre: string; initials: string; slug: string; title: string };
  store: { code: string; name: string };
}): Deal {
  const historicalLow = offer.priceSnapshots.reduce(
    (lowest, snapshot) => Math.min(lowest, snapshot.priceClp),
    offer.currentPriceClp,
  );

  return {
    accent: offer.product.accent,
    currentPrice: offer.currentPriceClp,
    discountPercent: offer.discountPercent,
    genre: offer.product.genre,
    historicalLow,
    id: offer.product.slug,
    initials: offer.product.initials,
    lastChecked: formatRelative(offer.lastCheckedAt),
    store: offer.store.code.toLowerCase() as Deal["store"],
    storeLabel: offer.store.name,
    title: offer.product.title,
  };
}

const offerInclude = {
  priceSnapshots: { orderBy: { capturedAt: "asc" as const }, select: { capturedAt: true, priceClp: true } },
  product: { select: { accent: true, genre: true, initials: true, slug: true, title: true } },
  store: { select: { code: true, name: true } },
};

export async function getDeals(): Promise<Deal[]> {
  const offers = await prisma.offer.findMany({ include: offerInclude, orderBy: { lastCheckedAt: "desc" } });
  return offers.map(mapOffer);
}

export async function getDealDetails(slug: string): Promise<{ deal: Deal; history: PricePoint[] } | null> {
  const offer = await prisma.offer.findFirst({
    include: offerInclude,
    where: { product: { slug } },
  });

  if (!offer) return null;

  return {
    deal: mapOffer(offer),
    history: offer.priceSnapshots.map((snapshot) => ({
      date: snapshot.capturedAt.toISOString(),
      label: formatHistoryLabel(snapshot.capturedAt),
      price: snapshot.priceClp,
    })),
  };
}

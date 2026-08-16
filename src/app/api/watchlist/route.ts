import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });
  const items = await prisma.watchlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { product: { select: { genre: true, slug: true, title: true } } },
  });
  const alerts = await prisma.priceAlert.findMany({ where: { userId: user.id, active: true }, select: { productId: true, targetDiscountPercent: true, targetPriceClp: true } });
  const alertByProduct = new Map(alerts.map((alert) => [alert.productId, alert]));
  return NextResponse.json({ items: items.map((item) => ({ alert: alertByProduct.get(item.productId) ?? null, genre: item.product.genre, slug: item.product.slug, title: item.product.title })) });
}

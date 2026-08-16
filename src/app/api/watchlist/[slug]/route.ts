import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth";

type RouteContext = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  return prisma.product.findUnique({ where: { slug }, select: { id: true, slug: true } });
}

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  const { slug } = await params;
  if (!user) return NextResponse.json({ alert: null, followed: false });
  const product = await getProduct(slug);
  if (!product) return NextResponse.json({ error: "Videojuego no encontrado" }, { status: 404 });
  const [watchlist, alert] = await Promise.all([
    prisma.watchlistItem.findUnique({ where: { userId_productId: { productId: product.id, userId: user.id } } }),
    prisma.priceAlert.findUnique({ where: { userId_productId: { productId: product.id, userId: user.id } }, select: { active: true, targetDiscountPercent: true, targetPriceClp: true } }),
  ]);
  return NextResponse.json({ alert, followed: Boolean(watchlist) });
}

export async function POST(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 });
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return NextResponse.json({ error: "Videojuego no encontrado" }, { status: 404 });
  await prisma.watchlistItem.upsert({ where: { userId_productId: { productId: product.id, userId: user.id } }, update: {}, create: { productId: product.id, userId: user.id } });
  return NextResponse.json({ followed: true });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 });
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return NextResponse.json({ error: "Videojuego no encontrado" }, { status: 404 });
  await prisma.watchlistItem.deleteMany({ where: { productId: product.id, userId: user.id } });
  return NextResponse.json({ followed: false });
}

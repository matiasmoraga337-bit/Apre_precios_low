import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAlertInput } from "@/domain/alerts";
import { getCurrentUser } from "@/server/auth";

type RouteContext = { params: Promise<{ slug: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 });
  try {
    const { slug } = await params;
    const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!product) return NextResponse.json({ error: "Videojuego no encontrado" }, { status: 404 });
    const input = validateAlertInput(await request.json());
    const alert = await prisma.priceAlert.upsert({
      where: { userId_productId: { productId: product.id, userId: user.id } },
      update: { active: true, ...input },
      create: { active: true, productId: product.id, userId: user.id, ...input },
      select: { active: true, targetDiscountPercent: true, targetPriceClp: true },
    });
    return NextResponse.json({ alert });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Regla invalida" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 });
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (!product) return NextResponse.json({ error: "Videojuego no encontrado" }, { status: 404 });
  await prisma.priceAlert.deleteMany({ where: { productId: product.id, userId: user.id } });
  return NextResponse.json({ alert: null });
}

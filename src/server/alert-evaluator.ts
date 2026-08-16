import { Prisma } from "@prisma/client";
import { alertMatchesPrice } from "@/domain/alerts";
import { prisma } from "@/lib/prisma";
import { sendPriceAlertEmail } from "@/server/email";
import { sendTelegramAlert } from "@/server/telegram";

export async function evaluatePriceAlertsForSnapshot(snapshotId: string): Promise<number> {
  const snapshot = await prisma.priceSnapshot.findUnique({
    where: { id: snapshotId },
    include: { offer: { include: { product: true, store: true } } },
  });
  if (!snapshot || !snapshot.available) return 0;

  const alerts = await prisma.priceAlert.findMany({ where: { active: true, productId: snapshot.offer.productId, user: { OR: [{ emailAlertsEnabled: true }, { telegramAlertsEnabled: true, telegramChatId: { not: null } }] } }, include: { user: true } });
  let sent = 0;
  for (const alert of alerts) {
    if (!alertMatchesPrice(alert, { discountPercent: snapshot.discountPercent, priceClp: snapshot.priceClp })) continue;
    try {
      await prisma.alertDelivery.create({ data: { alertId: alert.id, snapshotId } });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") continue;
      throw error;
    }
    let delivered = false;
    if (alert.user.emailAlertsEnabled) {
      try {
        await sendPriceAlertEmail({ currentPriceClp: snapshot.priceClp, discountPercent: snapshot.discountPercent, storeName: snapshot.offer.store.name, targetDiscountPercent: alert.targetDiscountPercent, targetPriceClp: alert.targetPriceClp, title: snapshot.offer.product.title, to: alert.user.email });
        delivered = true;
      } catch {
        delivered = false;
      }
    }
    if (alert.user.telegramAlertsEnabled && alert.user.telegramChatId) {
      try {
        await sendTelegramAlert(`Alerta de precio: ${snapshot.offer.product.title} esta en ${snapshot.offer.store.name} por $${snapshot.priceClp.toLocaleString("es-CL")} CLP (${snapshot.discountPercent}% descuento).`, alert.user.telegramChatId);
        delivered = true;
      } catch {
        // Email can still be a successful fallback when Telegram is unavailable.
      }
    }
    if (delivered) {
      await prisma.priceAlert.update({ data: { lastTriggeredAt: new Date() }, where: { id: alert.id } });
      sent += 1;
    } else {
      await prisma.alertDelivery.deleteMany({ where: { alertId: alert.id, snapshotId } });
    }
  }
  return sent;
}

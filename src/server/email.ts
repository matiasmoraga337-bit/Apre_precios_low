import nodemailer from "nodemailer";
import { formatClp } from "@/domain/pricing";

type PriceAlertEmail = {
  currentPriceClp: number;
  discountPercent: number;
  storeName: string;
  targetDiscountPercent: number | null;
  targetPriceClp: number | null;
  title: string;
  to: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export async function sendPriceAlertEmail(alert: PriceAlertEmail): Promise<void> {
  const transporter = nodemailer.createTransport({
    auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD ? { pass: process.env.SMTP_PASSWORD, user: process.env.SMTP_USER } : undefined,
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: false,
  });
  const safeTitle = escapeHtml(alert.title);
  const from = process.env.MAIL_FROM ?? "Apre precios low <alertas@apre.local>";
  await transporter.sendMail({
    from,
    html: `<h2>Tu alerta se activo</h2><p><strong>${safeTitle}</strong> esta en ${escapeHtml(alert.storeName)} por <strong>${formatClp(alert.currentPriceClp)}</strong>.</p><p>Descuento actual: ${alert.discountPercent}%.</p>`,
    subject: `Alerta de precio: ${alert.title}`,
    text: `Tu alerta se activo: ${alert.title} esta en ${alert.storeName} por ${formatClp(alert.currentPriceClp)}. Descuento actual: ${alert.discountPercent}%.`,
    to: alert.to,
  });
}

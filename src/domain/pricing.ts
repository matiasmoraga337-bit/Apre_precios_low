import type { Deal } from "@/types/deals";

const clpFormatter = new Intl.NumberFormat("es-CL", {
  currency: "CLP",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatClp(value: number): string {
  return clpFormatter.format(value);
}

export function percentageAboveHistoricalLow(
  currentPrice: number,
  historicalLow: number,
): number {
  if (historicalLow <= 0 || currentPrice <= historicalLow) {
    return 0;
  }

  return Math.round(((currentPrice - historicalLow) / historicalLow) * 100);
}

export function isHistoricalLow(deal: Pick<Deal, "currentPrice" | "historicalLow">): boolean {
  return deal.currentPrice <= deal.historicalLow;
}

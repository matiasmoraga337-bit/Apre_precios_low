export type AlertInput = {
  targetDiscountPercent?: unknown;
  targetPriceClp?: unknown;
};

export type ValidatedAlert = {
  targetDiscountPercent?: number;
  targetPriceClp?: number;
};

export function alertMatchesPrice(
  alert: { targetDiscountPercent: number | null; targetPriceClp: number | null },
  price: { discountPercent: number; priceClp: number },
): boolean {
  const matchesPrice = alert.targetPriceClp !== null && price.priceClp <= alert.targetPriceClp;
  const matchesDiscount = alert.targetDiscountPercent !== null && price.discountPercent >= alert.targetDiscountPercent;
  return matchesPrice || matchesDiscount;
}

export function validateAlertInput(input: AlertInput): ValidatedAlert {
  const targetPriceClp = input.targetPriceClp === undefined || input.targetPriceClp === "" ? undefined : Number(input.targetPriceClp);
  const targetDiscountPercent = input.targetDiscountPercent === undefined || input.targetDiscountPercent === "" ? undefined : Number(input.targetDiscountPercent);
  if (targetPriceClp === undefined && targetDiscountPercent === undefined) throw new Error("Define un precio o descuento objetivo");
  if (targetPriceClp !== undefined && (!Number.isInteger(targetPriceClp) || targetPriceClp < 0 || targetPriceClp > 100_000_000)) throw new Error("El precio objetivo no es valido");
  if (targetDiscountPercent !== undefined && (!Number.isInteger(targetDiscountPercent) || targetDiscountPercent < 0 || targetDiscountPercent > 100)) throw new Error("El descuento objetivo no es valido");
  return { targetDiscountPercent, targetPriceClp };
}

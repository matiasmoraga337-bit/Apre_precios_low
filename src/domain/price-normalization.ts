export type RawPrice = {
  amount: number;
  currency: string;
  includesTaxes?: boolean;
  observedAt?: Date;
  originalAmount?: number;
};

export type NormalizedPrice = {
  amountClp: number;
  includesTaxes: boolean;
  observedAt: Date;
  originalAmountClp?: number;
  sourceAmount: number;
  sourceCurrency: string;
};

export type CurrencyRates = Record<string, number>;

function convertToClp(amount: number, currency: string, rates: CurrencyRates): number {
  const rate = rates[currency];
  if (rate === undefined || !Number.isFinite(rate) || rate <= 0) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  return Math.round(amount * rate);
}

export function normalizePrice(raw: RawPrice, rates: CurrencyRates): NormalizedPrice {
  const currency = raw.currency.trim().toUpperCase();
  if (!Number.isFinite(raw.amount) || raw.amount < 0) {
    throw new Error("Price amount must be a finite non-negative number");
  }
  if (raw.originalAmount !== undefined && (!Number.isFinite(raw.originalAmount) || raw.originalAmount < raw.amount)) {
    throw new Error("Original price must be finite and greater than or equal to the current price");
  }

  return {
    amountClp: convertToClp(raw.amount, currency, rates),
    includesTaxes: raw.includesTaxes ?? false,
    observedAt: raw.observedAt ?? new Date(),
    originalAmountClp: raw.originalAmount === undefined ? undefined : convertToClp(raw.originalAmount, currency, rates),
    sourceAmount: raw.amount,
    sourceCurrency: currency,
  };
}

export type StoreId = "steam" | "eneba" | "xbox" | "epic";

export type Deal = {
  id: string;
  title: string;
  store: StoreId;
  storeLabel: string;
  genre: string;
  currentPrice: number;
  historicalLow: number;
  discountPercent: number;
  lastChecked: string;
  accent: string;
  initials: string;
  featured?: boolean;
};

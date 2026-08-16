import type { StoreId } from "@/types/deals";

export type StoreOffer = {
  currency: "CLP";
  discountPercent: number;
  externalProductId: string;
  genre: string;
  initials: string;
  originalPriceClp: number;
  priceClp: number;
  title: string;
  url: string;
};

export interface StoreAdapter {
  readonly store: StoreId;
  getOffer(externalProductId: string): Promise<StoreOffer>;
}

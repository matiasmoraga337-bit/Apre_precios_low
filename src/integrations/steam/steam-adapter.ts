const STEAM_APP_DETAILS_URL = "https://store.steampowered.com/api/appdetails";
const REQUEST_TIMEOUT_MS = 10_000;

type SteamPriceOverview = {
  currency: unknown;
  discount_percent: unknown;
  final: unknown;
  initial: unknown;
};

type SteamAppData = {
  genres?: unknown;
  is_free?: unknown;
  name?: unknown;
  price_overview?: SteamPriceOverview;
  steam_appid?: unknown;
};

export type SteamOffer = {
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

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function initialsFor(title: string): string {
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return initials.slice(0, 3) || "STE";
}

function genreFor(data: SteamAppData): string {
  if (!Array.isArray(data.genres)) return "Videojuego digital";
  const genres = data.genres
    .filter(isRecord)
    .map((genre) => genre.description)
    .filter((genre): genre is string => typeof genre === "string")
    .slice(0, 2);
  return genres.length > 0 ? genres.join(" / ") : "Videojuego digital";
}

function parseAppData(payload: unknown, appId: number): SteamAppData {
  if (!isRecord(payload)) throw new Error("Steam response is not an object");
  const entry = payload[String(appId)];
  if (!isRecord(entry) || entry.success !== true || !isRecord(entry.data)) {
    throw new Error(`Steam app ${appId} is unavailable`);
  }
  return entry.data as SteamAppData;
}

function parsePrice(data: SteamAppData): { discountPercent: number; originalPriceClp: number; priceClp: number } {
  if (data.is_free === true) return { discountPercent: 0, originalPriceClp: 0, priceClp: 0 };
  if (!data.price_overview || data.price_overview.currency !== "CLP") {
    throw new Error("Steam app does not provide a CLP price");
  }

  const price = data.price_overview;
  if (!isNonNegativeInteger(price.final) || !isNonNegativeInteger(price.initial) || !isNonNegativeInteger(price.discount_percent)) {
    throw new Error("Steam price data is invalid");
  }

  return {
    discountPercent: price.discount_percent,
    originalPriceClp: Math.round(price.initial / 100),
    priceClp: Math.round(price.final / 100),
  };
}

export class SteamAdapter {
  private readonly fetcher: FetchLike;

  constructor(fetcher: FetchLike = fetch) {
    this.fetcher = fetcher;
  }

  async getAppDetails(appId: number): Promise<SteamOffer> {
    if (!Number.isInteger(appId) || appId <= 0) throw new Error("Steam app id must be a positive integer");

    const url = new URL(STEAM_APP_DETAILS_URL);
    url.searchParams.set("appids", String(appId));
    url.searchParams.set("cc", "cl");
    url.searchParams.set("l", "spanish");
    const response = await this.fetcher(url, {
      headers: { Accept: "application/json", "User-Agent": "AprePreciosLow/0.1" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`Steam request failed with status ${response.status}`);

    const data = parseAppData(await response.json(), appId);
    if (typeof data.name !== "string" || data.name.trim() === "" || data.steam_appid !== appId) {
      throw new Error("Steam product identity is invalid");
    }
    const price = parsePrice(data);

    return {
      currency: "CLP",
      discountPercent: price.discountPercent,
      externalProductId: String(appId),
      genre: genreFor(data),
      initials: initialsFor(data.name),
      originalPriceClp: price.originalPriceClp,
      priceClp: price.priceClp,
      title: data.name.trim(),
      url: `https://store.steampowered.com/app/${appId}/`,
    };
  }
}

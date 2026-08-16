import { describe, expect, it, vi } from "vitest";
import { SteamAdapter, SteamAppUnavailableError } from "./steam-adapter";

describe("SteamAdapter", () => {
  it("maps the Chilean price response to the internal offer shape", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      "1145350": {
        success: true,
        data: {
          genres: [{ description: "Accion" }, { description: "Indie" }],
          name: "Hades II",
          price_overview: { currency: "CLP", discount_percent: 20, final: 1200000, initial: 1500000 },
          steam_appid: 1145350,
        },
      },
    }), { status: 200 }));
    const offer = await new SteamAdapter(fetcher).getAppDetails(1145350);

    expect(offer).toMatchObject({ currency: "CLP", discountPercent: 20, genre: "Accion / Indie", priceClp: 12000, title: "Hades II" });
    const [requestUrl, requestInit] = fetcher.mock.calls[0];
    expect(String(requestUrl)).toContain("cc=cl");
    expect(requestInit).toEqual(expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it("rejects non-CLP prices and malformed products", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ "1": { success: true, data: { name: "Game", steam_appid: 1, price_overview: { currency: "USD", final: 100, initial: 100, discount_percent: 0 } } } }), { status: 200 }));
    await expect(new SteamAdapter(fetcher).getAppDetails(1)).rejects.toThrow("CLP");
  });

  it("rejects invalid ids before making a network request", async () => {
    const fetcher = vi.fn();
    await expect(new SteamAdapter(fetcher).getAppDetails(0)).rejects.toThrow("positive integer");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("identifies an unavailable Steam app separately", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ "404": { success: false } }), { status: 200 }));
    await expect(new SteamAdapter(fetcher).getAppDetails(404)).rejects.toBeInstanceOf(SteamAppUnavailableError);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { sendTelegramAlert } from "./telegram";

describe("Telegram notification channel", () => {
  afterEach(() => { delete process.env.TELEGRAM_BOT_TOKEN; });

  it("sends a message through the bot endpoint", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await sendTelegramAlert("Oferta disponible", "123456789", fetcher);
    expect(fetcher).toHaveBeenCalledWith("https://api.telegram.org/bottest-token/sendMessage", expect.objectContaining({ method: "POST" }));
  });

  it("rejects invalid chat ids before sending", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    const fetcher = vi.fn();
    await expect(sendTelegramAlert("Oferta", "not-a-chat", fetcher)).rejects.toThrow("invalid");
    expect(fetcher).not.toHaveBeenCalled();
  });
});

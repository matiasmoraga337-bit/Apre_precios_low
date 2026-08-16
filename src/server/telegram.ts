const TELEGRAM_API_TIMEOUT_MS = 10_000;

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

export async function sendTelegramAlert(message: string, chatId: string, fetcher: FetchLike = fetch): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Telegram is not configured");
  if (!/^-?\d{1,20}$/.test(chatId)) throw new Error("Telegram chat id is invalid");

  const response = await fetcher(`https://api.telegram.org/bot${token}/sendMessage`, {
    body: JSON.stringify({ chat_id: chatId, disable_web_page_preview: true, text: message }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
    signal: AbortSignal.timeout(TELEGRAM_API_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Telegram request failed with status ${response.status}`);
  const payload = await response.json() as { ok?: unknown };
  if (payload.ok !== true) throw new Error("Telegram rejected the message");
}

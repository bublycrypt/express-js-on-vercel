export default async function handler(req, res) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: "Missing Telegram credentials" });
  }

  // The page you want to watch
  const url = "https://zealy.io/";

  try {
    const response = await fetch(url);
    const html = await response.text();

    // Very simple change detector (you can refine later)
    const hash = html.length;

    // Store last hash in memory (Vercel cold starts so we keep it simple)
    globalThis.lastHash = globalThis.lastHash || null;

    if (globalThis.lastHash && globalThis.lastHash !== hash) {
      const text = `⚡ Change detected on page:\n${url}`;

      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text
          })
        }
      );
    }

    globalThis.lastHash = hash;

    res.json({ status: "ok", hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

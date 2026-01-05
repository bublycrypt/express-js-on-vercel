import fetch from "node-fetch"; // ensures fetch works on Vercel

export default async function handler(req, res) {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ error: "Missing TELEGRAM_BOT_TOKEN or CHAT_ID in env vars" });
    }

    const url = "https://zealy.io/cw/xgram/questboard"; // your Zealy questboard

    const response = await fetch(url);
    const html = await response.text();

    // simple change detector using page length
    const hash = html.length;

    globalThis.lastHash = globalThis.lastHash || null;

    if (globalThis.lastHash && globalThis.lastHash !== hash) {
      const text = `⚡ New change detected on your Zealy questboard!`;

      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: CHAT_ID, text })
        }
      );
    }

    globalThis.lastHash = hash;

    res.status(200).json({ status: "ok", hash });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
}

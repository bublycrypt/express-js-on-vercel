import fetch from "node-fetch"; // ensure fetch works

export default async function handler(req, res) {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ error: "Missing Telegram credentials" });
    }

    const url = "https://zealy.io/your-username/quests"; // put your real page here

    const response = await fetch(url);
    const html = await response.text();

    // simple change detector
    const hash = html.length;
    globalThis.lastHash = globalThis.lastHash || null;

    if (globalThis.lastHash && globalThis.lastHash !== hash) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: `⚡ New change detected on Zealy page!`
        })
      });
    }

    globalThis.lastHash = hash;

    res.status(200).json({ status: "ok", hash });
  } catch (err) {
    console.log("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

const express = require('express');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);
const chatId = process.env.TELEGRAM_CHAT_ID;
const targetURL = process.env.TARGET_URL;

let lastQuests = []; // store last seen quests

// Function to extract quests from page
async function getQuests() {
    try {
        const res = await axios.get(targetURL);
        const html = res.data;

        // Very simple regex to get quest names (adjust if needed)
        const questMatches = html.match(/<h3 class="quest-title">([^<]+)<\/h3>/g) || [];
        const quests = questMatches.map(q => q.replace(/<[^>]+>/g, '').trim());

        return quests;
    } catch (err) {
        console.log('Error fetching page:', err.message);
        return [];
    }
}

async function checkPage() {
    const currentQuests = await getQuests();

    const newQuests = currentQuests.filter(q => !lastQuests.includes(q));

    if (newQuests.length > 0) {
        await bot.sendMessage(chatId, `🎯 New Zealy Quests detected:\n${newQuests.join('\n')}`);
        lastQuests = currentQuests;
    }
}

// Check every 1 minute
setInterval(checkPage, 1 * 60 * 1000);
checkPage();

app.get('/', (req, res) => {
    res.send('Zealy Quest Watcher is running!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

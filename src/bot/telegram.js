const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');

const bot = new TelegramBot(config.telegramToken, { polling: false });

module.exports = bot;

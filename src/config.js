require('dotenv').config();

function required(name) {
  if (!process.env[name]) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return process.env[name];
}

const config = {
  env: process.env.NODE_ENV || 'production',
  port: process.env.PORT || 3000,
  databaseUrl: required('DATABASE_URL'),
  telegramToken: required('TELEGRAM_BOT_TOKEN'),
  webhookSecret: required('TELEGRAM_WEBHOOK_SECRET'),
  cronSecret: required('CRON_SECRET'),
  geminiApiKey: required('GEMINI_API_KEY'),
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest',
  appBaseUrl: required('APP_BASE_URL'),
  timezone: process.env.TZ || 'Asia/Kolkata'
};

module.exports = config;

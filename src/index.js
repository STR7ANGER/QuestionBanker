const express = require('express');
const config = require('./config');
const bot = require('./bot/telegram');
const { onTelegramMessage } = require('./handlers/messageHandler');
const { runMorningJob } = require('./jobs/morningJob');
const { runNightJob } = require('./jobs/nightJob');
const { logInfo, logError } = require('./utils/logger');

const app = express();
app.use(express.json({ limit: '1mb' }));

bot.on('message', async (msg) => {
  try {
    await onTelegramMessage(msg);
  } catch (err) {
    logError('Message handler error', { error: String(err) });
  }
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post(`/webhook/${config.webhookSecret}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.post(`/cron/morning/${config.cronSecret}`, async (req, res) => {
  try {
    await runMorningJob();
    res.json({ ok: true });
  } catch (err) {
    logError('Morning cron failed', { error: String(err) });
    res.status(500).json({ ok: false });
  }
});

app.post(`/cron/night/${config.cronSecret}`, async (req, res) => {
  try {
    await runNightJob();
    res.json({ ok: true });
  } catch (err) {
    logError('Night cron failed', { error: String(err) });
    res.status(500).json({ ok: false });
  }
});

app.listen(config.port, () => {
  logInfo('Server listening', { port: config.port });
});

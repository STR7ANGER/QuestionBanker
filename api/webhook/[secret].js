const config = require('../../src/config');
const bot = require('../../src/bot/telegram');
const { onTelegramMessage } = require('../../src/handlers/messageHandler');
const { logError } = require('../../src/utils/logger');

let initialized = false;
function ensureHandler() {
  if (initialized) return;
  bot.on('message', async (msg) => {
    try {
      await onTelegramMessage(msg);
    } catch (err) {
      logError('Message handler error', { error: String(err) });
    }
  });
  initialized = true;
}

module.exports = async (req, res) => {
  if (req.query.secret !== config.webhookSecret) {
    return res.status(401).json({ ok: false });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    ensureHandler();
    bot.processUpdate(req.body);
    return res.status(200).json({ ok: true });
  } catch (err) {
    logError('Webhook error', { error: String(err) });
    return res.status(500).json({ ok: false });
  }
};

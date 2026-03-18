const config = require('../../src/config');
const { onTelegramMessage } = require('../../src/handlers/messageHandler');
const { logError } = require('../../src/utils/logger');

module.exports = async (req, res) => {
  if (req.query.secret !== config.webhookSecret) {
    return res.status(401).json({ ok: false });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (update && update.message) {
      await onTelegramMessage(update.message);
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    logError('Webhook error', { error: String(err) });
    return res.status(500).json({ ok: false });
  }
};

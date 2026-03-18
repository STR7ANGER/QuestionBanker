const config = require('../../src/config');
const { runNightJob } = require('../../src/jobs/nightJob');
const { logError } = require('../../src/utils/logger');

function isAuthorized(req) {
  const auth = req.headers.authorization || '';
  return auth === `Bearer ${config.cronSecret}`;
}

module.exports = async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ ok: false });
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    await runNightJob();
    return res.status(200).json({ ok: true });
  } catch (err) {
    logError('Night cron failed', { error: String(err) });
    return res.status(500).json({ ok: false });
  }
};

const pool = require('../db');
const { computeRewards } = require('../services/rewardService');
const { getDatePartsInTz } = require('../utils/time');
const { logInfo, logError } = require('../utils/logger');

async function runNightJob() {
  const today = getDatePartsInTz();
  logInfo('Night job start', { date: today });

  const pending = await pool.query(
    'SELECT * FROM daily_logs WHERE date = $1 AND status = $2',
    [today, 'pending']
  );

  for (const log of pending.rows) {
    try {
      const rewards = computeRewards(0, 5);
      await pool.query(
        'UPDATE daily_logs SET status = $1, solved_count = $2 WHERE id = $3',
        ['completed', 0, log.id]
      );
      await pool.query(
        'UPDATE users SET balance_rs = balance_rs + $1, points = points + $2 WHERE id = $3',
        [rewards.net, rewards.points, log.user_id]
      );
    } catch (err) {
      logError('Night job failed for log', { logId: log.id, error: String(err) });
    }
  }

  logInfo('Night job done', { date: today, pending: pending.rows.length });
}

module.exports = { runNightJob };

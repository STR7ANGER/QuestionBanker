const pool = require('../db');
const bot = require('../bot/telegram');
const { generateDailyQuestions, formatQuestionsMessage } = require('../services/questionService');
const { getDatePartsInTz, getYesterdayDateString } = require('../utils/time');
const { logInfo, logError } = require('../utils/logger');

async function runMorningJob() {
  const today = getDatePartsInTz();
  const yesterday = getYesterdayDateString();

  const users = await pool.query('SELECT * FROM users');
  logInfo('Morning job start', { users: users.rows.length, date: today });

  for (const user of users.rows) {
    const existing = await pool.query(
      'SELECT * FROM daily_logs WHERE user_id = $1 AND date = $2',
      [user.id, today]
    );
    if (existing.rows.length > 0) {
      continue;
    }

    let questions = null;
    try {
      const ylog = await pool.query(
        'SELECT * FROM daily_logs WHERE user_id = $1 AND date = $2',
        [user.id, yesterday]
      );
      const y = ylog.rows[0];

      if (y && y.status === 'leave' && y.questions) {
        questions = y.questions;
      } else {
        questions = await generateDailyQuestions(user.id);
      }

      await pool.query(
        'INSERT INTO daily_logs (user_id, date, questions, status) VALUES ($1, $2, $3, $4)',
        [user.id, today, questions ? JSON.stringify(questions) : null, 'pending']
      );

      const message = formatQuestionsMessage(questions);
      await bot.sendMessage(user.telegram_id, message);
    } catch (err) {
      logError('Morning job failed for user', { userId: user.id, error: String(err) });
      await bot.sendMessage(user.telegram_id, 'Sorry, failed to generate today\'s questions. Please try later.');
    }
  }

  logInfo('Morning job done', { date: today });
}

module.exports = { runMorningJob };

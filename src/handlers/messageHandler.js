const pool = require('../db');
const bot = require('../bot/telegram');
const { getOrCreateUser, updateBalanceAndPoints, resetBalance, deductPoints } = require('../services/userService');
const { computeRewards } = require('../services/rewardService');
const { parseSolvedInput } = require('../utils/parse');
const { getDatePartsInTz, getYesterdayDateString, isAfterCutoff } = require('../utils/time');

async function getDailyLog(userId, date) {
  const result = await pool.query(
    'SELECT * FROM daily_logs WHERE user_id = $1 AND date = $2',
    [userId, date]
  );
  return result.rows[0];
}

async function setDailyLogStatus(userId, date, status, solvedCount) {
  const result = await pool.query(
    'UPDATE daily_logs SET status = $1, solved_count = $2 WHERE user_id = $3 AND date = $4 RETURNING *',
    [status, solvedCount, userId, date]
  );
  return result.rows[0];
}

async function createLeave(userId, date) {
  await pool.query('INSERT INTO leaves (user_id, date) VALUES ($1, $2)', [userId, date]);
}

async function handleCommand(chatId, user, text) {
  if (text === '/bank') {
    await bot.sendMessage(chatId, `Balance: Rs ${user.balance_rs}\nPoints: ${user.points}`);
    return true;
  }

  if (text === '/redeem') {
    const updated = await resetBalance(user.id);
    await bot.sendMessage(chatId, `Redeemed. New balance: Rs ${updated.balance_rs}`);
    return true;
  }

  if (text === '/leave') {
    if (user.points < 60) {
      await bot.sendMessage(chatId, 'Not enough points for leave. Need 60 points.');
      return true;
    }
    const today = getDatePartsInTz();
    const existing = await getDailyLog(user.id, today);
    if (existing && existing.status === 'completed') {
      await bot.sendMessage(chatId, 'You already completed today. Leave not allowed.');
      return true;
    }

    await deductPoints(user.id, 60);
    await createLeave(user.id, today);

    if (existing) {
      await pool.query('UPDATE daily_logs SET status = $1 WHERE id = $2', ['leave', existing.id]);
    } else {
      const yesterday = getYesterdayDateString();
      const ylog = await getDailyLog(user.id, yesterday);
      const questions = ylog ? ylog.questions : null;
      await pool.query(
        'INSERT INTO daily_logs (user_id, date, questions, status) VALUES ($1, $2, $3, $4)',
        [user.id, today, questions ? JSON.stringify(questions) : null, 'leave']
      );
    }

    await bot.sendMessage(chatId, 'Leave approved. 60 points deducted.');
    return true;
  }

  return false;
}

async function handleSolvedInput(chatId, user, text) {
  const today = getDatePartsInTz();
  const log = await getDailyLog(user.id, today);
  if (!log) {
    await bot.sendMessage(chatId, 'No active challenge today.');
    return;
  }
  if (log.status === 'completed') {
    await bot.sendMessage(chatId, 'You already submitted today.');
    return;
  }
  if (log.status === 'leave') {
    await bot.sendMessage(chatId, 'You are on leave today.');
    return;
  }
  if (isAfterCutoff()) {
    await bot.sendMessage(chatId, 'Submissions closed after 11 PM IST.');
    return;
  }

  const solvedCount = parseSolvedInput(text);
  if (solvedCount === null) {
    await bot.sendMessage(chatId, 'Invalid reply. Send a single number from 0 to 5 (example: 3).');
    return;
  }

  const rewards = computeRewards(solvedCount, 5);
  await setDailyLogStatus(user.id, today, 'completed', rewards.solved);
  const updated = await updateBalanceAndPoints(user.id, rewards.net, rewards.points);

  const msg = [
    `Solved: ${rewards.solved} / 5`,
    `Earnings: Rs ${rewards.earnings}`,
    `Penalty: Rs ${rewards.penalty}`,
    `Net: Rs ${rewards.net}`,
    `Points +${rewards.points}`,
    `Balance: Rs ${updated.balance_rs}`,
    `Points: ${updated.points}`
  ].join('\n');

  await bot.sendMessage(chatId, msg);
}

async function onTelegramMessage(msg) {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id;
  const username = msg.from.username || msg.from.first_name || 'user';
  const text = (msg.text || '').trim();

  const user = await getOrCreateUser(telegramId, username);

  if (text.startsWith('/')) {
    const handled = await handleCommand(chatId, user, text);
    if (handled) return;
  }

  await handleSolvedInput(chatId, user, text);
}

module.exports = { onTelegramMessage };

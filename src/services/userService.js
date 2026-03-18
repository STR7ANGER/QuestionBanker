const pool = require('../db');

async function getOrCreateUser(telegramId, username) {
  const existing = await pool.query(
    'SELECT * FROM users WHERE telegram_id = $1',
    [telegramId]
  );
  if (existing.rows.length > 0) return existing.rows[0];

  const created = await pool.query(
    'INSERT INTO users (telegram_id, username) VALUES ($1, $2) RETURNING *',
    [telegramId, username || null]
  );
  return created.rows[0];
}

async function updateBalanceAndPoints(userId, balanceDelta, pointsDelta) {
  const result = await pool.query(
    'UPDATE users SET balance_rs = balance_rs + $1, points = points + $2 WHERE id = $3 RETURNING *',
    [balanceDelta, pointsDelta, userId]
  );
  return result.rows[0];
}

async function resetBalance(userId) {
  const result = await pool.query(
    'UPDATE users SET balance_rs = 0 WHERE id = $1 RETURNING *',
    [userId]
  );
  return result.rows[0];
}

async function deductPoints(userId, points) {
  const result = await pool.query(
    'UPDATE users SET points = points - $1 WHERE id = $2 RETURNING *',
    [points, userId]
  );
  return result.rows[0];
}

module.exports = {
  getOrCreateUser,
  updateBalanceAndPoints,
  resetBalance,
  deductPoints
};

const fs = require('fs');
const path = require('path');
const { getQuestionsFromGemini } = require('./geminiService');
const pool = require('../db');
const { getDatePartsInTz } = require('../utils/time');

const COOLDOWN_DAYS = Number(process.env.COOLDOWN_DAYS || 14);

function loadTopics() {
  const topicsPath = path.join(__dirname, '..', '..', 'config', 'topics.json');
  const raw = fs.readFileSync(topicsPath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!parsed.topics || !Array.isArray(parsed.topics) || parsed.topics.length === 0) {
    throw new Error('topics.json must contain a non-empty "topics" array');
  }
  return parsed.topics;
}

function getDateStringMinusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return getDatePartsInTz(d);
}

async function getRecentQuestionIds(userId) {
  const cutoff = getDateStringMinusDays(COOLDOWN_DAYS);
  const result = await pool.query(
    `SELECT questions
     FROM daily_logs
     WHERE user_id = $1
       AND date >= $2`,
    [userId, cutoff]
  );

  const ids = new Set();
  for (const row of result.rows) {
    if (!row.questions) continue;
    for (const q of row.questions) {
      if (q && typeof q.leetcode_id === 'number') {
        ids.add(q.leetcode_id);
      } else if (q && typeof q.link === 'string') {
        ids.add(q.link);
      }
    }
  }
  return ids;
}

async function generateDailyQuestions(userId) {
  const topics = loadTopics();
  const recentIds = userId ? await getRecentQuestionIds(userId) : new Set();

  let lastQuestions = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const questions = await getQuestionsFromGemini(topics, Array.from(recentIds));
    const hasRepeat = questions.some(q => recentIds.has(q.leetcode_id) || recentIds.has(q.link));
    lastQuestions = questions;
    if (!hasRepeat) {
      return questions;
    }
  }
  return lastQuestions;
}

function formatQuestionsMessage(questions) {
  const lines = [];
  lines.push('🔥 Today\'s LeetCode Challenge');
  lines.push('');
  questions.forEach((q, idx) => {
    lines.push(`${idx + 1}) ${q.leetcode_id}: ${q.title}`);
    lines.push(q.link);
    lines.push('');
  });
  lines.push('Reply before 11 PM IST with how many you solved (0-5).');
  lines.push('Example → 3');
  return lines.join('\n');
}

module.exports = {
  generateDailyQuestions,
  formatQuestionsMessage,
  loadTopics
};

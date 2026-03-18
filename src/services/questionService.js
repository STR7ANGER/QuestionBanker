const fs = require('fs');
const path = require('path');
const { getQuestionsFromGemini } = require('./geminiService');

function loadTopics() {
  const topicsPath = path.join(__dirname, '..', '..', 'config', 'topics.json');
  const raw = fs.readFileSync(topicsPath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!parsed.topics || !Array.isArray(parsed.topics) || parsed.topics.length === 0) {
    throw new Error('topics.json must contain a non-empty "topics" array');
  }
  return parsed.topics;
}

async function generateDailyQuestions() {
  const topics = loadTopics();
  const questions = await getQuestionsFromGemini(topics);
  return questions;
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
  lines.push('Reply before 11 PM IST:');
  lines.push('Example → 1 2 3');
  return lines.join('\n');
}

module.exports = {
  generateDailyQuestions,
  formatQuestionsMessage,
  loadTopics
};

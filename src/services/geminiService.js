const { z } = require('zod');
const config = require('../config');
const { logError } = require('../utils/logger');

const questionSchema = z.object({
  leetcode_id: z.number().int(),
  title: z.string().min(1),
  link: z.string().url(),
  topic: z.string().min(1),
  difficulty: z.string().min(1)
});

const responseSchema = z.array(questionSchema).length(5);

function buildPrompt(topics) {
  return `You are selecting LeetCode questions.
Return EXACTLY 5 items as a JSON array. Each item must have:
- leetcode_id (number)
- title (string)
- link (full https://leetcode.com/problems/...)
- topic (one of: ${topics.join(', ')})
- difficulty (Easy|Medium|Hard)

Only return JSON. No markdown. No extra text.`;
}

async function callGemini(topics) {
  const prompt = buildPrompt(topics);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.8,
      topP: 0.9
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini response missing text');
  }
  return text;
}

async function getQuestionsFromGemini(topics) {
  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const text = await callGemini(topics);
      const parsed = JSON.parse(text);
      const validated = responseSchema.parse(parsed);
      return validated;
    } catch (err) {
      lastError = err;
      logError('Gemini parse failure', { attempt, error: String(err) });
    }
  }
  throw lastError;
}

module.exports = { getQuestionsFromGemini };

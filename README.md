# Daily LeetCode Gamified Bot (Telegram + Gemini + Neon)

## Quick Start

1) Install deps

```bash
npm install
```

2) Create `.env` from `.env.example`

3) Create DB schema

```bash
psql "$DATABASE_URL" -f sql/schema.sql
```

4) Start server

```bash
npm start
```

## Telegram Webhook (Vercel)

Set webhook to:

```
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<APP_BASE_URL>/api/webhook/<TELEGRAM_WEBHOOK_SECRET>
```

## Vercel Deployment (Recommended)

1) Import the repo into Vercel.
2) Set environment variables from `.env.example`.
3) Vercel cron jobs are configured in `vercel.json` (UTC schedules).

Cron auth:
- Set `CRON_SECRET` in Vercel env vars.
- Vercel will send `Authorization: Bearer <CRON_SECRET>` to the cron endpoints.

## Topics

Edit `config/topics.json` with your topic list.

## Notes

- Replies accepted only before 11 PM IST.
- One submission per day.
- Leave costs 60 points and reuses yesterday's questions.
- Cooldown prevents repeats for `COOLDOWN_DAYS` (default 14).
- Default Gemini model is `gemini-2.5-flash` (set via `GEMINI_MODEL`).
# QuestionBanker

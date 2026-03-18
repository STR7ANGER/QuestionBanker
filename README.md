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

## Telegram Webhook

Set webhook to:

```
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<APP_BASE_URL>/webhook/<TELEGRAM_WEBHOOK_SECRET>
```

## Render Deployment (Recommended)

Create a Web Service:
- Build: `npm install`
- Start: `npm start`
- Add env vars from `.env.example`

Create two Render Cron Jobs:
- Morning (8:00 AM IST):
  - URL: `<APP_BASE_URL>/cron/morning/<CRON_SECRET>`
  - Method: POST
- Night (11:00 PM IST):
  - URL: `<APP_BASE_URL>/cron/night/<CRON_SECRET>`
  - Method: POST

## Topics

Edit `config/topics.json` with your topic list.

## Notes

- Replies accepted only before 11 PM IST.
- One submission per day.
- Leave costs 60 points and reuses yesterday's questions.
- Cooldown prevents repeats for `COOLDOWN_DAYS` (default 14).
# QuestionBanker

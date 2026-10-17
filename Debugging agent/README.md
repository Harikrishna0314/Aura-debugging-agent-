# Aura Debugging Agent

Aura is a Next.js App Router application that sends code and an optional error hint to an AI model, then displays a diagnosis, explanation, and suggested fix.

## Requirements

- Node.js 20.9 or newer (required by Next.js 16).
- npm (or another Node package manager).
- A valid **Z.AI API-platform API key** with access to a chat-completions model.
- Internet access from the server to the configured AI API.
- For production start, Bun is used by the `start` script in `package.json`.

## Configure the AI provider

The app now calls the official Z.AI chat-completions API with a server-side Bearer API key instead of relying on the platform-specific `X-Token` used by `z-ai-web-dev-sdk`. This avoids the reported `401 invalid X-Token` failure when that platform token is unavailable or invalid.

1. Create an API key in the Z.AI developer/API console. Use an API-platform key, not a website login/session token.
2. Copy `.env.example` to `.env`.
3. Set `ZAI_API_KEY` to your real key.
4. Keep `ZAI_API_KEY` server-side only. Do not prefix it with `NEXT_PUBLIC_`, put it in client-side code, or commit `.env`.
5. The defaults are `ZAI_API_URL=https://api.z.ai/api/paas/v4/chat/completions` and `ZAI_MODEL=glm-4.6`. Change them only if your API account uses a different supported endpoint or model.

For hosted deployment, add these variables in the host's **server/runtime environment variables or secrets** settings, then redeploy:

- Required: `ZAI_API_KEY`
- Optional: `ZAI_API_URL`
- Optional: `ZAI_MODEL`
- Required for database-backed history: `DATABASE_URL` (for a hosted deployment, use a database/file strategy supported by that host; the local SQLite example may not persist on ephemeral filesystems).

## Run locally

From this directory (`Debugging agent`):

```bash
npm install
cp .env.example .env
# Edit .env and set ZAI_API_KEY before using the Debug button.
npm run db:generate
npm run db:push
npm run dev
```

Open http://localhost:3000.

For a production build, use `npm run build`; the configured `start` script runs the standalone server with Bun.

## Troubleshooting

- **“AI provider is not configured”**: set `ZAI_API_KEY` in the server environment and restart/redeploy.
- **401/403 authentication failure**: verify the key is an API-platform key, is active, belongs to the endpoint's account/region, and has access/credits. Do not use a Z.AI website session token.
- **404/model not found**: verify `ZAI_API_URL` and `ZAI_MODEL` against your provider account.
- **History/database errors**: verify `DATABASE_URL` and run `npm run db:generate` and `npm run db:push`.

The code is sent to the configured AI provider for analysis. Do not submit secrets or code you are not allowed to share with that provider.

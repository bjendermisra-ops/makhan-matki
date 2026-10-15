# GitHub se game kaise chalayein

GitHub = source code + history + automated tests. Online game ke liye Cloudflare Worker = server; D1 = room/game/chat storage. GitHub Pages alone runs static files, not this multiplayer backend. The existing ChatGPT Site remains separate from your GitHub deployment.

## 1. Upload the source
Download the source ZIP from the game footer and extract it. Create your GitHub repository. Upload the **contents** of `makhan-matki/`, with `package.json`, `public/`, `server/`, `deploy/`, `drizzle/`, and `.github/` at the repository root. Do not upload the ZIP as the only file. If using phone upload, confirm hidden `.github/workflows/` files are included. GitHub Actions should show “Game checks”. MIT LICENSE is included; choose Public if you want everyone to access the code.

## 2. Create hosting and database
In your Cloudflare account, create a D1 database named `makhan-matki-db`. Copy its database ID and your account ID. Create an API token scoped to your account with Workers Scripts Edit and D1 Edit permissions. Never put this token in source files or chat.

GitHub repository → Settings → Secrets and variables → Actions:

| Type | Name | Value |
| --- | --- | --- |
| Secret | `CLOUDFLARE_API_TOKEN` | Your scoped token |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | Your account ID |
| Variable | `D1_DATABASE_ID` | Your new database UUID |
| Variable (optional) | `WORKER_NAME` | e.g. `makhan-matki` |

Create a GitHub Environment named `production` if your repository policy requires it. The workflow references it and respects its approval rules.

## 3. Deploy
Actions → **Deploy game to Cloudflare** → Run workflow, using your reviewed default branch. It installs locked dependencies, runs regression tests, validates the Worker bundle, applies pending D1 migrations, and deploys the game and assets. Open the `workers.dev` URL printed by Wrangler. HTTPS is required for microphone access.

This portable Worker uses the same browser game and server rules as the hosted Site. It does not require a Vinext build or ChatGPT sign-in. It strips untrusted identity headers and authorizes room members using random tokens. Hourly cleanup removes up to 100 expired rooms per run; room creation also runs cleanup.

Existing Site chats/rooms are not copied to this new database. Players create new rooms on your new URL. Do not apply migrations to an already-managed Sites database: use a fresh external D1 database. Do not edit already-applied SQL migrations; add new ones.

## 4. Future changes
Commit changes → “Game checks” runs automatically. Review changes, then manually run the deploy workflow. Deployment is deliberately manual; a code push does not silently replace the live game. A failed migration stops deployment. Reverting Worker code does not undo database migrations.

For local external-host testing, after `npm ci`:

```bash
export D1_DATABASE_ID='YOUR-DATABASE-UUID'
node scripts/configure-cloudflare.mjs
npx wrangler d1 migrations apply DB --local --config wrangler.external.json
npx wrangler dev --config wrangler.external.json
```

The generated `wrangler.external.json` is ignored by Git. `npm test` runs without installing dependencies on Node 24; Wrangler/build commands require `npm ci`.

## Release limits and phone checklist
No ads or paid voice provider are configured. Cloudflare hosting/database usage is subject to your account limits; open-source does not mean unlimited free server usage. Direct WebRTC has no TURN relay and may fail on restrictive networks. Hindi narration depends on installed device voices.

Before a public launch, check Android Chrome and iPhone Safari: narrow-screen layout, tutorial, solo, four-player pass-and-play, online rooms on two networks, mic allow/deny/mute/background, reconnect, winner → View board → Play Again. Voice and visual layout have not yet been verified on real phones. There is no automatic turn timeout or host transfer; an absent player can stall a match. Closing a room/new room recovers it. Performance at large concurrent traffic has not been load-tested. Treat this as a tested release candidate, not a guarantee of zero bugs or 100-million-user capacity.

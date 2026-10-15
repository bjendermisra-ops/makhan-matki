# Makhan Matki — Vrindavan Race

A free-to-play, no-ads, 100-step devotional board game. Project code is MIT licensed; dependencies retain their respective licenses. Generated artwork is included under the project license to the extent copyright rights exist.

## Play
Collect three matkis, then reach or cross HOME 100. Matki stops are 19, 44, 69 and 89. Each is collectible once per lap. Landing on a monkey moves you four spaces back. Blue slides move you down; green peacock paths move you forward. A shield blocks one hazard. Landing effects do not chain. Passing a tile does not trigger hazards. Shortcut jumps skip intermediate matkis.

Solo supports computer opponents. Pass-and-play supports 2–4 on one device. Online rooms support 2–4 on separate devices: create a room, share the code privately, then the host starts the match. The server checks turns and card use and generates dice rolls. The host can rematch after a win. Explicitly leaving ends an ongoing online match; closing a tab preserves its session for rejoining in the same tab. There is no auto-turn timeout. Rooms expire after 24 hours.

## Voice and narration
Optional browser WebRTC voice uses direct peer-to-peer connections with public STUN and **no paid TURN relay**. Some networks will fail to connect. Join voice is opt-in; microphone permission is required. Mute, speaker mute, individual participant mute, and leave controls are provided. Hiding the page stops the microphone. No audio is recorded. Public STUN and peers may receive network connection information needed for WebRTC. Use private rooms with people you trust.

Hindi game narration uses an installed Hindi system/browser voice via SpeechSynthesis. Availability and voice quality depend on the device; the game remains usable with visual feedback when unavailable. No paid speech API is used.

## Source layout
- `public/play/`: plain HTML, CSS, browser game, tutorial, chat and voice clients, WebP art.
- `server/chat.mjs`: room membership, chat, authoritative online actions, voice signaling.
- `server/rules.mjs`: server copy of the game rules (keep aligned with `public/play/engine.js`).
- `db/schema.ts`, `drizzle/`: D1 schema and append-only migrations.
- `app/`: Vinext API routes and redirect to the game.

No credentials, saved chats, hosting owner information, or database records are included in the downloadable source archive. Source repository history is not included.

## Run locally
Node 24 is recommended. Install dependencies with `npm ci`. Build with `npm run build`. For each `drizzle/*.sql` migration, in sorted filename order, apply it once to the local database:

```
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_simple_human_robot.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_remarkable_master_mold.sql
npm run dev
```

Use the printed local URL and open `/play/index.html`. A production deployment requires HTTPS and a D1 binding named `DB`. Hosting/storage limits still apply: free-to-play and open-source do not promise unlimited free server capacity. This project does not enable paid voice or billing services.

## Verification
`node test-engine.cjs`, `node test-chat.mjs`, `node test-chat-ui.mjs`, and `node test-guide.mjs` cover gameplay, server authority, room isolation, stale responses and tutorial behavior. Browser layout, microphone permission and cross-network audio need real-device testing.

The distributed game has no advertisements, purchase flow, loot boxes, or paid advantage.

## GitHub and independent hosting
See [GITHUB_SETUP.md](GITHUB_SETUP.md) for phone-friendly upload steps, repository settings, and the included manual GitHub Actions → Cloudflare Workers + D1 deployment. `npm test` runs all regression checks. `deploy/worker.mjs` is the portable entrypoint; the existing Sites/Vinext build stays supported. No GitHub or Cloudflare account has been connected automatically.

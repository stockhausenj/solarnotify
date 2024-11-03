# solarnotify

## summary

[SolarNotify site](https://solarnotify.com/)

Improve mean time to detection (MTTD) of issues related to your solar systems.

Long term goal is to use data collected here to hold installers and maintainers
accountable.

## development

Some of the steps below belong in GitHub Actions. The actions below assume you
are in the solarnotify dir.

Updating Cloudflare D1 database.

```bash
npx wrangler login
npx wrangler d1 execute solarnotify --file=./schema.sql --remote
```

Updating Cloudflare worker.

```bash
npx wrangler login
npx wrangler deploy --name solarnotify-worker --compatibility-date 2024-01-01 worker/index.js
```

Adding secret to Cloudflare worker.

```bash
npx wrangler login
npx wrangler secret put SECRET_KEY --name solarnotify-worker
```

Starting local test environment.

```bash
npx wrangler dev functions
npm run dev
```

# Deploying BrandGuard AI to Render

The repo ships with a Render Blueprint (`render.yaml`), so deployment is a form, not a project.

## One-time setup

1. This repo deploys to Vercel (recommended) or Render. Both need a free
   **PostgreSQL** database — [Neon](https://neon.tech) gives one free.
2. **Vercel:** Dashboard → **Add New → Project** → import `chintanmange9-ops/Brand-Gov`
   → add env vars `GROQ_API_KEY` (your Groq key) and `AUTH_SECRET` (any long
   random string) → Deploy. Then create **Project → Storage → Create DB
   (Neon serverless SQL)** and link the project — `DATABASE_URL` is injected
   automatically and the build migrates (`prisma db push`) + seeds itself.
3. **Render (alternative):** New + → **Blueprint** → render.yaml; Render asks
   for `DATABASE_URL` (paste the Neon URL), `GROQ_API_KEY`, and auto-generates
   `AUTH_SECRET`.
5. Note the public URL — this is the link judges open.

## Demo accounts (password `demo123` for all)

| Email | Role | Can do |
|---|---|---|
| `creator@demo.com` | creator | draft content, submit for AI review, act on findings |
| `reviewer@demo.com` | reviewer | review decisions |
| `manager@demo.com` | manager | review decisions + publish |
| `steward@demo.com` | steward | manage the brand kit + publish |
| `admin@demo.com` | admin | everything |

## Behaviour notes on the free tier

- The service sleeps after ~15 min of inactivity; first visit takes ~30–60 s to
  wake. Subsequent requests are fast.
- Seeding runs on every build and is idempotent (`skipDuplicates`), so the demo
  logins always exist.

## Regenerate demo data locally

```bash
npx prisma db push --force-reset
node prisma/seed.js
```

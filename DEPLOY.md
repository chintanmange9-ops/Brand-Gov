# Deploying BrandGuard AI to Render

The repo ships with a Render Blueprint (`render.yaml`), so deployment is a form, not a project.

## One-time setup

1. Push this repository to GitHub (already done: `chintanmange9-ops/Brand-Gov`).
2. Sign in at <https://dashboard.render.com> → **New +** → **Blueprint**.
3. Select the **Brand-Gov** repository → Render reads `render.yaml`.
4. Render will ask for **`GROQ_API_KEY`** — paste your Groq key
   (get a free one at <https://console.groq.com>). `AUTH_SECRET` is auto-generated.
5. Click **Apply** → the first build runs `prisma db push` + build automatically.
6. Note the public URL Render gives, e.g. `https://brandguard-ai.onrender.com` —
   this is the link judges open.

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
- The seeded SQLite database (`prisma/dev.db`, committed) is restored on each
  new deploy, so the demo logins always exist. Content created by users between
  deploys is not preserved — that keeps the demo state consistent.

## Regenerate demo data locally

```bash
npx prisma db push --force-reset
node prisma/seed.js
```

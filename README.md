# BrandGuard AI

Intelligent brand-governance platform: reviews marketing content against the
organisation's approved brand kit **before publication** — and a human decides.

**Team ICYBITS · Team leader: Chintan Mange** · built for Codex 48.

## What it does

The core workflow:

1. **Brand Stewards** maintain the single source of truth — brand guidelines
   (tone, terminology, messaging, visual, accessibility, claims), approved
   facts, terminology table, and asset metadata.
2. **Creators** draft content (text paste, or upload PDF/DOCX/image) and submit
   it for review.
3. An **LLM review engine** checks the draft against the brand kit and returns
   structured findings — category, severity, flagged text, explanation, source
   reference, suggested fix, confidence.
4. Creators **accept or dismiss** each finding (dismissals require a reason).
   Re-reviews keep prior decisions.
5. **Reviewers/Managers** make the human decision — approve, request changes,
   or reject — with comments.
6. **Managers+** publish — only content that was approved can be published.
7. **Insights** aggregate issues by category/severity over time so recurring
   problems surface.

Every AI finding is advisory; nothing publishes without a human approval chain.

## Tech stack

- **Next.js 16** (App Router, TypeScript, Turbopack) + Tailwind CSS
- **Prisma 5** + PostgreSQL (Neon/Vercel Postgres on serverless)
- **Groq** (`openai/gpt-oss-20b`) for the review engine
- Auth: JWT session (`jose`) with bcrypt-hashed passwords, role-based access
  (creator / reviewer / manager / steward / admin)

## Run locally

```bash
npm install
npx prisma db push
node prisma/seed.js
npm run dev                 # http://localhost:3000
```

Demo accounts (password `demo123`): `creator@demo.com`, `reviewer@demo.com`,
`manager@demo.com`, `steward@demo.com`, `admin@demo.com`.

## Deploy

`render.yaml` is included — see [DEPLOY.md](DEPLOY.md). After import the app is
live at `https://brandguard-ai.onrender.com` (or your assigned URL).

## Governance model

| Action | Who | Server-enforced |
|---|---|---|
| Edit brand kit | steward, admin | ✔ |
| Submit for AI review | creator | ✔ |
| Accept / dismiss findings | any member (dismissing requires reason) | ✔ |
| Approve / request changes / reject | reviewer and up | ✔ |
| Publish | manager and up, approved content only | ✔ |
| Edit draft body | the draft's creator, only pre-review | ✔ |

AI assistant tools were used during development (Next.js/TypeScript code
authoring and a Playwright-driven verification pass); all product decisions,
design and code review belong to the team.

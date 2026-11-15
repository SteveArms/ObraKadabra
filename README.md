# ObraKadabra

Turn a photo of a 2D floor plan into a 3D home linked to its construction schedule (4D) and budget (5D), with real progress logged from site photos and a read-only link for the family.

## Run locally

```bash
pnpm install
cp .env.example .env.local   # fill in what you need, see below
pnpm dev                     # http://localhost:3000
pnpm check                   # lint + typecheck + unit + e2e
```

Without Supabase variables the app keeps projects in the browser (localStorage and IndexedDB). The two demos always work, with no keys and no sign-in.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `AI_API_KEY` | server, Vercel | Gemini or OpenAI key for reading plans and site photos |
| `AI_MODEL` | server, Vercel | `gemini-*` (default `gemini-3.5-flash`), `gpt-*` or `fixture` (no key) |
| `NEXT_PUBLIC_SUPABASE_URL` | browser, Vercel | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | browser, Vercel | `sb_publishable_…` key (row level security protects the data) |
| `SUPABASE_SECRET_KEY` | server, Vercel | `sb_secret_…`; only signs photo URLs for the family view |
| `NEXT_PUBLIC_SITE_URL` | optional | Base URL of share links; Vercel's deploy URL is used when empty |
| `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` | your machine | Supabase CLI for migrations; never in Vercel |

## Supabase setup

1. Create the project and copy the URL, the publishable key and the secret key (Project Settings → API Keys).
2. Apply `supabase/migrations/` in one of two ways:
   - SQL Editor: paste each file in order and run it.
   - CLI: `npx supabase login`, `npx supabase link --project-ref <ref>`, `npx supabase db push`.
3. Authentication → Sign In / Providers → turn on **Allow anonymous sign-ins**. Users start without an account; the home page offers to link an email later.
4. Authentication → URL Configuration: set the Site URL to the production URL and add `https://*-<team>.vercel.app/**` to the redirect URLs, so the email confirmation returns to the app.

The migration creates `projects` (FloorPlan as `jsonb`, status, `share_token`), `progress_entries`, `photos` and the private `photos` bucket. Each owner reads and writes only their own rows and files; the public can read a project only through `get_shared_project(token)`.

## Deploy (Vercel)

1. Import the GitHub repo in Vercel (framework: Next.js, install command `pnpm install`).
2. Add the variables above for Production and Preview.
3. Every pull request gets a Preview deploy; `main` deploys to Production.
4. `.github/workflows/preview-smoke.yml` waits for Vercel's successful Preview deploy and runs `playwright test --grep @smoke` with `PLAYWRIGHT_BASE_URL` set to it. If Vercel Deployment Protection is on, either turn it off for Previews or add a bypass token.

## Tests

- `pnpm test`: Vitest. `ProjectRepository` has one contract suite (`src/lib/projects/repository.contract.ts`) run against localStorage and against Supabase with a mocked client.
- `pnpm test:e2e`: Playwright on desktop (1440×900) and mobile (390×844), against a production build that uses browser storage. The AI is always mocked; `@ai` specs call the real model and are skipped on CI.
- `PLAYWRIGHT_BASE_URL=https://… pnpm exec playwright test --grep @smoke`: smoke run against a deployed URL.

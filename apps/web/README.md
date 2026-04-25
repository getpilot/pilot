# `web`

Marketing and waitlist site for Pilot.

[![React Doctor](https://www.react.doctor/share/badge?p=web&s=99&w=6&f=6)](https://www.react.doctor/share?p=web&s=99&w=6&f=6)

## Local Development

From repo root:

```bash
pnpm install
pnpm --filter web dev
```

Site runs on `http://localhost:3001` by default.

The waitlist form writes to the shared Postgres database, so `DATABASE_URL` is required for local development and Vercel deployments of this app.
Copy `.env.example` to `.env.local` inside `apps/web` and set it to your Neon connection string.

## Useful Scripts

From repo root:

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web check-types
pnpm --filter web lint
```

## Monorepo Dependencies

- `@pilot/ui` for shared shadcn/tailwind UI layer
- `@pilot/types` for shared types
- `@pilot/config` for eslint/postcss/tsconfig

## Deployment

Deploy this app as a separate Vercel project with root directory set to:

`apps/web`

Add `DATABASE_URL` in that Vercel project's environment variables.
It is needed by the server action behind `/waitlist`.

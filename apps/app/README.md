# `app`

Main product app (dashboard, automations, contacts, sidekick, billing).

[![React Doctor](https://www.react.doctor/share/badge?p=app&s=92&w=32&f=16)](https://www.react.doctor/share?p=app&s=92&w=32&f=16)

## Local Development

From repo root:

```bash
pnpm install
pnpm --filter app dev
```

App runs on `http://localhost:3000` by default.

## Useful Scripts

From repo root:

```bash
pnpm --filter app dev
pnpm --filter app build
pnpm --filter app check-types
pnpm --filter app lint
```

## Monorepo Dependencies

- `@pilot/ui` for UI components/styles
- `@pilot/db` for DB client/schema
- `@pilot/instagram` for Instagram API transport, token refresh, retries, and webhook helpers
- `@pilot/core` for shared product logic (sidekick prompts, automations, contact workflows)
- `@pilot/types` for shared domain types
- `@pilot/config` for eslint/postcss/tsconfig

## App-Specific Notes

`apps/app` is the delivery layer. It owns routing, auth/session handling, request parsing, and UI.

Domain logic and integrations are pushed down into shared packages:

- `@pilot/core` owns the decision-making layer
- `@pilot/instagram` owns Instagram-specific API logic
- `@pilot/db` owns schema and database wiring

```bash
pnpm --filter app db:generate
pnpm --filter app db:migrate
pnpm --filter app db:push
pnpm --filter app db:studio
```

## Deployment

Deploy this app as its own Vercel project with root directory set to:

`apps/app`

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

# @pilot/instagram

Framework-agnostic Instagram integration layer for the Pilot monorepo.

This package centralizes:
- Instagram graph/auth HTTP calls
- Retry/rate-limit handling
- Webhook signature verification
- Instagram-specific error normalization

It does not contain:
- Next.js route handlers
- DB access
- App-specific auth/session logic
- Webhook challenge handling or subscription setup
- Instagram content publishing helpers

## Module map

- `auth.ts`
  - `buildInstagramAuthUrl`
  - `exchangeCodeForAccessToken`
  - `exchangeLongLivedInstagramToken`
  - `refreshLongLivedInstagramToken`
  - `fetchInstagramProfile`
  - `validateInstagramToken`
  - `fetchRecentInstagramMedia`
- `client.ts`
  - Centralized axios request path (`instagramRequest`)
  - Base URL and API version helpers (`graphUrl`, `authUrl`, `IG_API_VERSION`)
- `comments.ts`
  - Private comment reply, generic template private reply, public comment reply
- `conversations.ts`
  - Conversation/message fetch helpers
- `messaging.ts`
  - DM send helper
- `retry.ts`
  - `sendWithRetry` utility
- `errors.ts`
  - `InstagramApiError`, retry-after parsing, axios error normalization
- `webhooks.ts`
  - `verifyWebhookSignature`

## Test strategy

Live tests (`test:live`) are:
- Real Instagram API calls
- Local opt-in only
- Reads from `packages/instagram/.env.test`
- Write tests require a second explicit flag
- OAuth flow tests are optional and separately gated

## Setup

1. Copy the env template:

```powershell
Copy-Item packages/instagram/.env.test.example packages/instagram/.env.test
```

2. Fill in `packages/instagram/.env.test`.

## Commands

Run these from the repo root.

### Live read tests

```powershell
$env:IG_TEST_LIVE="1"; pnpm --filter @pilot/instagram test:live
```

### Live write tests (side effects)

```powershell
$env:IG_TEST_LIVE="1"; $env:IG_TEST_LIVE_WRITE="1"; pnpm --filter @pilot/instagram test:live
```

### OAuth optional tests

```powershell
$env:IG_TEST_LIVE="1"; $env:IG_TEST_INCLUDE_OAUTH="1"; pnpm --filter @pilot/instagram test:live
```

### Full package test script

```powershell
pnpm --filter @pilot/instagram test
```

## Live test safety

- Default is safe: live tests skip unless `IG_TEST_LIVE=1`.
- Write tests skip unless `IG_TEST_LIVE_WRITE=1`.
- Keep test IDs/tokens scoped to a dedicated test account where possible.
- Do not run write tests unintentionally in shared environments.

## OAuth test notes

- OAuth tests are optional because auth codes are short-lived.
- OAuth block only runs when:
  - `IG_TEST_INCLUDE_OAUTH=1`
  - all OAuth env vars are provided
- Default scopes cover profile/media reads, messages, and comments:
  - `instagram_business_basic`
  - `instagram_business_manage_messages`
  - `instagram_business_manage_comments`

## Env variable reference

| Variable | Required | Used for |
|---|---|---|
| `IG_TEST_LIVE` | yes (for live) | enable read live tests |
| `IG_TEST_ACCESS_TOKEN` | yes (for live) | all token-based live calls |
| `IG_TEST_CONVERSATION_ID` | optional | force message fetch target |
| `IG_TEST_LIVE_WRITE` | yes (for write tests) | enable write live tests |
| `IG_TEST_IG_USER_ID` | yes (write) | send/comment endpoints |
| `IG_TEST_RECIPIENT_ID` | yes (write dm) | dm send test |
| `IG_TEST_COMMENT_ID` | yes (write comment) | comment reply endpoints |
| `IG_TEST_INCLUDE_OAUTH` | yes (oauth block) | enable oauth tests |
| `IG_TEST_INSTAGRAM_CLIENT_ID` | yes (oauth) | code exchange |
| `IG_TEST_INSTAGRAM_CLIENT_SECRET` | yes (oauth) | code exchange + long-lived token exchange |
| `IG_TEST_REDIRECT_URI` | yes (oauth) | code exchange |
| `IG_TEST_OAUTH_CODE` | yes (oauth) | auth code exchange |

## Troubleshooting

- Token invalid/expired:
  - Refresh token or reconnect account.
- Permission/scope failures:
  - Verify Instagram app scopes match endpoint usage.
- Rate limits:
  - Retry later, reduce concurrent live calls.
- OAuth failure:
  - Regenerate auth code and ensure redirect URI exact match.

## CI guidance

- Keep live tests disabled in default CI pipelines.
- If you add a dedicated live CI job, gate with explicit secrets and flags.

## Maintainer notes

- When adding a new Instagram endpoint helper:
  1. Add a live test behind existing env gates if practical.
  2. Update this README env/command docs if new vars are needed.

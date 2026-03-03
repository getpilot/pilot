# Polar Tier Enforcement Plan

## Execution Tracker

### Phase 1: Planning Breakdown

- [x] Convert this plan into an implementation checklist with phased todos
- [x] Keep this checklist updated as tasks are completed

### Phase 2: Pricing Catalog and Billing Foundation

- [x] Refactor `apps/app/src/lib/constants/pricing.ts` into the tier source of truth
- [x] Remove hardcoded plan mappings from checkout, badge, and upgrade UI
- [x] Add app billing resolver/service modules for plan resolution, usage counting, and enforcement

### Phase 3: Database and Usage Ledger

- [x] Add `billing_usage_event` to `packages/db/src/schema.ts`
- [x] Generate and commit the new Drizzle migration artifacts

### Phase 4: Server-Side Enforcement

- [x] Enforce billing limits in automation actions
- [x] Enforce billing limits in contact actions and sync trigger entrypoints
- [x] Enforce billing limits in the Sidekick chat API
- [x] Enforce billing limits in the background contact sync path
- [x] Enforce billing limits in the Instagram webhook auto-reply path

### Phase 5: UI Gating and Operator Docs

- [x] Add minimal UI billing-state gating for Sidekick, Contacts, and Automations
- [x] Add `docs/polar-product-setup.md`

### Phase 6: Validation and Wrap-Up

- [x] Run targeted type/build validation
- [x] Mark all completed tasks in this checklist

## Summary

Implement a single app-owned billing enforcement layer that uses Polar as the source of subscription truth and `pricing.ts` as the source of tier configuration. The app will treat users with no active subscription as the `free` tier, enforce only numeric caps in this pass, and keep over-limit accounts read-only/frozen for existing data.

This pass stays inside the current app scope only: contacts, Sidekick chat/DM/comment reply, and automations. It does not implement analytics/support/community/custom-webhook gating yet.

## Implementation

### 1. Replace the pricing catalog with a real tier model

Update [pricing.ts](C:/Users/USER/Desktop/code/pilot/apps/app/src/lib/constants/pricing.ts) so it becomes the single source of truth for both UI and enforcement.

Add a new tier shape like:

- `planId`: `"free" | "starter" | "growth" | "pro"`
- `title`
- `monthlyPriceCents`
- `displayMonthlyPrice`
- `description`
- `features`
- `polar`: `{ monthlyProductId?: string; monthlySlug?: string; yearlyProductId?: string; yearlySlug?: string }`
- `limits`: `{ maxContactsTotal: number | null; maxNewContactsPerMonth: number | null; maxAutomations: number | null; maxSidekickSendsPerMonth: number | null; maxSidekickChatPromptsPerMonth: number | null }`

Replace the current stale `Starter`/`Premium` display data with `Free`, `Starter`, `Growth`, and `Pro`.

Use these default values so the code is fully wired immediately, with the explicitly ambiguous ones marked `TODO` in the constants file for you to edit later:

- `free`
  - `maxContactsTotal: 100`
  - `maxAutomations: 1`
  - `maxSidekickSendsPerMonth: 3`
  - `maxSidekickChatPromptsPerMonth: 5` (placeholder)
  - `maxNewContactsPerMonth: 25` (placeholder)
- `starter`
  - `maxContactsTotal: 500`
  - `maxAutomations: 3`
  - `maxSidekickSendsPerMonth: 0` (matches your “draft only, no send” copy)
  - `maxSidekickChatPromptsPerMonth: 100`
  - `maxNewContactsPerMonth: 100` (placeholder)
- `growth`
  - `maxContactsTotal: 5000`
  - `maxAutomations: null`
  - `maxSidekickSendsPerMonth: 0` (matches your “draft only, no send” copy)
  - `maxSidekickChatPromptsPerMonth: 300`
  - `maxNewContactsPerMonth: 1000` (placeholder)
- `pro`
  - `maxContactsTotal: 50000`
  - `maxAutomations: null`
  - `maxSidekickSendsPerMonth: null`
  - `maxSidekickChatPromptsPerMonth: null`
  - `maxNewContactsPerMonth: 10000` (placeholder)

### 2. Eliminate hardcoded plan mappings everywhere

Refactor these files to read from the pricing catalog instead of duplicating product IDs, titles, or slugs:

- [auth.ts](C:/Users/USER/Desktop/code/pilot/apps/app/src/lib/auth.ts)
- [client.ts](C:/Users/USER/Desktop/code/pilot/apps/app/src/lib/polar/client.ts)
- [subscription-badge.tsx](C:/Users/USER/Desktop/code/pilot/apps/app/src/components/subscription-badge.tsx)
- [page.tsx](C:/Users/USER/Desktop/code/pilot/apps/app/src/app/(dashboard)/(account)/upgrade/page.tsx)

Changes:

- `auth.ts`
  - Build the Better Auth `checkout({ products: [...] })` list from `pricing.ts`.
  - Exclude `free` from checkout products.
- `lib/polar/client.ts`
  - Replace `PlanTitle = "Starter" | "Premium"` with `PlanId = "starter" | "growth" | "pro"`.
  - Reject checkout for `free`.
  - Resolve slug from `pricing.ts`.
- `subscription-badge.tsx`
  - Map `activeSubscriptions[0].productId` to plan ID using the `pricing.ts` product IDs.
  - Fallback to `free` if no active subscription.
- Upgrade page
  - Render all four plans from `pricing.ts`.
  - `free` renders as informational only, no checkout button.
  - Paid tiers use the centralized checkout metadata.

### 3. Add a server-side billing resolver and enforcement service

Create a new server-only module, for example:

- `apps/app/src/lib/billing/plan.ts`
- `apps/app/src/lib/billing/usage.ts`
- `apps/app/src/lib/billing/enforce.ts`

Core responsibilities:

- `getCurrentPlan(userId)`
  - Call `polarInstance.customers.getStateExternal({ externalId: userId })`.
  - Read `activeSubscriptions`.
  - Map the active product ID to a plan ID using `pricing.ts`.
  - If no active subscription, return `free`.
- `getCurrentUsage(userId, now)`
  - `contactsTotal`: count rows in `contact`
  - `newContactsThisMonth`: count `contact.createdAt >= startOfUtcMonth`
  - `automationsTotal`: count rows in `automation`
  - `sidekickSendsThisMonth`: count rows in `sidekickActionLog.createdAt >= startOfUtcMonth`
  - `sidekickChatPromptsThisMonth`: count rows in a new usage-event table (see step 4)
- `getBillingStatus(userId)`
  - Returns `{ planId, limits, usage, flags }`
  - `flags` should include:
    - `isStructurallyFrozen`
    - `canCreateContact`
    - `canMutateContacts`
    - `canCreateAutomation`
    - `canMutateAutomations`
    - `canUseSidekickChat`
    - `canSendSidekickReply`
- `assertBillingAllowed(userId, capability)`
  - Throws a typed app error with a stable code and user-facing message when blocked.

Define the freeze rule exactly like this:

- `isStructurallyFrozen = contactsTotal > maxContactsTotal || automationsTotal > maxAutomations` for any non-null cap.
- When `isStructurallyFrozen` is true:
  - existing data remains readable
  - all mutations are blocked
  - background writes are skipped
- Monthly quota exhaustion does not globally freeze the account.
- Monthly quota exhaustion only disables that capability until the next month:
  - chat prompt cap blocks Sidekick chat
  - send cap blocks outbound Sidekick DM/comment sends
  - new-contact cap blocks creation of new contacts only

### 4. Add an immutable usage ledger for Sidekick chat prompts

Add a new DB table in [schema.ts](C:/Users/USER/Desktop/code/pilot/packages/db/src/schema.ts), plus a migration, for example:

- `billing_usage_event`
  - `id`
  - `userId` FK to `user`
  - `kind` (v1 only needs `"sidekick_chat_prompt"`)
  - `referenceId` nullable
  - `createdAt defaultNow()`

Reason: the current chat persistence in [chat-store.ts](C:/Users/USER/Desktop/code/pilot/apps/app/src/lib/chat-store.ts) deletes and recreates `chat_message` rows on every save, so `chat_message.createdAt` is not a reliable monthly quota signal.

Usage rules:

- Insert one `billing_usage_event(kind="sidekick_chat_prompt")` immediately after a chat request passes quota checks, before calling `streamText()`.
- Do not try to backfill from `chat_message`.
- Use this table only for chat prompts in v1.

### 5. Enforce billing in all real mutation paths

Add checks in the actual write paths, not just UI buttons.

#### Automations

Update [automations.ts](C:/Users/USER/Desktop/code/pilot/apps/app/src/actions/automations.ts):

- `createAutomation`
  - block when `isStructurallyFrozen`
  - block when current automation count has reached `maxAutomations`
- `updateAutomation`
- `deleteAutomation`
- `toggleAutomation`

For the last three, block when `isStructurallyFrozen` so frozen accounts stay read-only.

#### Contacts and contact mutations

Update [contacts.ts](C:/Users/USER/Desktop/code/pilot/apps/app/src/actions/contacts.ts):

- Block all contact mutation actions when `isStructurallyFrozen`
  - `updateContactStage`
  - `updateContactSentiment`
  - `updateContactNotes`
  - `updateContactHRNState`
  - `updateContactFollowUpStatus`
  - `updateContactAfterFollowUp`
  - `addContactTagAction`
  - `removeContactTagAction`
  - `generateFollowUpMessage`
- `syncInstagramContacts(fullSync?)`
  - check `isStructurallyFrozen` before enqueueing sync
  - if frozen, refuse the sync request up front

#### Background contact sync

Enforce in the real sync implementation at [sync.ts](C:/Users/USER/Desktop/code/pilot/packages/core/src/contacts/sync.ts), not only in the button action.

Inside `storeContacts(...)`:

- If `isStructurallyFrozen`, return without inserts/updates.
- For each row:
  - if the contact already exists, allow updates only when not frozen
  - if the contact is new:
    - block insert when `contactsTotal >= maxContactsTotal`
    - block insert when `newContactsThisMonth >= maxNewContactsPerMonth`
- Continue processing remaining contacts; do not crash the sync
- Update `lastSyncedAt` normally only if the sync path itself ran successfully

This ensures scheduled syncs and Inngest syncs respect limits too.

#### Instagram webhook auto-replies

Enforce in [instagram-webhook.ts](C:/Users/USER/Desktop/code/pilot/packages/core/src/workflows/instagram-webhook.ts).

For direct-message flow:

- Keep the duplicate-message guard first.
- Then resolve billing status for `integration.userId`.
- If `isStructurallyFrozen`, skip all writes and sends.
- If the sender is a new contact and the user is at either contact cap, skip contact creation and skip sending.
- If the sender is an existing contact and the account is not structurally frozen, existing-contact updates may continue.
- Before sending any Sidekick reply:
  - block when `maxSidekickSendsPerMonth` is reached
- If send is blocked:
  - do not call Instagram send APIs
  - do not insert `sidekickActionLog`

For comment automation flow:

- Before any comment reply or DM-like send behavior, check `canSendSidekickReply`
- If blocked, skip the reply and skip automation usage logging

#### Sidekick chat API

Update [route.ts](C:/Users/USER/Desktop/code/pilot/apps/app/src/app/api/chat/route.ts):

- Resolve billing status at the top of `POST`.
- If `isStructurallyFrozen`, reject the request before `streamText()`.
- If `maxSidekickChatPromptsPerMonth` is reached, reject the request before `streamText()`.
- If allowed, insert one `billing_usage_event` row before starting the model stream.

Do not use `chat_message` for quota counting.

### 6. Add a small UI billing-state surface

Add a reusable server action or loader that returns `BillingStatus`, then use it to disable obvious mutation UI instead of only failing after click.

Recommended minimal UI points:

- Sidekick panel:
  - disable prompt input when chat is blocked or account is structurally frozen
  - show an upgrade message inline
- Contacts:
  - disable sync button when sync/new-contact creation is blocked
  - keep tables readable
- Automations:
  - disable “new automation”
  - optionally show a banner if the account is frozen
- Upgrade page:
  - show current plan from the centralized plan resolver

Do not attempt to implement analytics gating now, because there is no analytics page in the current app route tree.

### 7. Add a product setup document

Create `docs/polar-product-setup.md` as a separate operator document.

It should cover:

- Create three recurring Polar products for `starter`, `growth`, `pro`
- Configure them with no trial period
- Record the monthly/yearly product IDs and slugs
- Paste those IDs/slugs into `pricing.ts`
- Confirm Better Auth checkout is using those slugs
- Optional future step: configure Polar webhooks once you want local cache invalidation

Because this implementation uses live Polar customer-state reads, webhook setup is not required to ship v1.

## Public APIs / Interfaces / Types

Add or standardize these interfaces so the implementation is consistent:

- `type PlanId = "free" | "starter" | "growth" | "pro"`
- `type BillingCapability = "contact:create" | "contact:mutate" | "automation:create" | "automation:mutate" | "sidekick:chat" | "sidekick:send"`
- `type BillingLimits = { maxContactsTotal: number | null; maxNewContactsPerMonth: number | null; maxAutomations: number | null; maxSidekickSendsPerMonth: number | null; maxSidekickChatPromptsPerMonth: number | null }`
- `type BillingUsage = { contactsTotal: number; newContactsThisMonth: number; automationsTotal: number; sidekickSendsThisMonth: number; sidekickChatPromptsThisMonth: number }`
- `type BillingStatus = { planId: PlanId; limits: BillingLimits; usage: BillingUsage; flags: { isStructurallyFrozen: boolean; canCreateContact: boolean; canMutateContacts: boolean; canCreateAutomation: boolean; canMutateAutomations: boolean; canUseSidekickChat: boolean; canSendSidekickReply: boolean } }`

Use typed error codes for blocked operations, for example:

- `BILLING_STRUCTURALLY_FROZEN`
- `BILLING_CONTACT_LIMIT_REACHED`
- `BILLING_NEW_CONTACT_LIMIT_REACHED`
- `BILLING_AUTOMATION_LIMIT_REACHED`
- `BILLING_SIDEKICK_SEND_LIMIT_REACHED`
- `BILLING_SIDEKICK_CHAT_LIMIT_REACHED`

## Test Cases and Scenarios

- No active Polar subscription resolves to `free`.
- Each paid product ID resolves to the correct plan ID.
- `pricing.ts` is the only place product IDs/slugs and limits are edited.
- Free user at 99 contacts can add one more; at 100 cannot add new contacts.
- User at `maxNewContactsPerMonth - 1` can create one new contact; the next new contact is blocked.
- Existing contacts can still update when only the monthly new-contact cap is exhausted.
- User over a downgraded structural cap becomes read-only:
  - contacts list still loads
  - automation list still loads
  - all mutations fail
  - scheduled sync and webhook writes are skipped
- User at automation cap cannot create another automation.
- User at sidekick send cap does not send DMs/comments and does not log a new `sidekickActionLog`.
- User at chat cap gets rejected before model execution and before consuming another usage event.
- Sidekick chat prompt usage is counted from `billing_usage_event`, not `chat_message`.
- Sync job in [functions.ts](C:/Users/USER/Desktop/code/pilot/apps/app/src/lib/inngest/functions.ts) still completes gracefully when some contacts are skipped due to billing limits.
- Upgrade UI shows four plans, and `free` is non-checkout.

## Assumptions and Defaults Chosen

- Users without an active Polar subscription are the `free` tier, not hard-paywalled.
- This first pass only enforces numeric caps.
- Monthly quotas reset on UTC calendar-month boundaries (00:00 UTC on the 1st).
- Structural overage freezes the account read-only; monthly quota exhaustion only disables the specific exhausted capability.
- `starter` and `growth` default to `maxSidekickSendsPerMonth = 0` because your pricing copy says “draft only, no sending.”
- `generateFollowUpMessage` is blocked only when the account is structurally frozen in v1; it is not separately metered as a chat prompt yet.
- Minor one-event overshoot under concurrent webhook traffic is acceptable in v1; no lock/reservation system is introduced.
- No work is done for analytics/support/community/custom-webhook gating in this pass.

## Research Basis

- Polar recommends using Customer State as the single object for access provisioning, including active subscriptions and granted state: https://docs.polar.sh/integrate/customer-state
- Polar exposes customer-state data via the customer-portal APIs used by Better Auth: https://docs.polar.sh/api-reference/customer-portal/customer-state
- The installed Better Auth Polar plugin documents `authClient.customer.state()` and notes it includes active subscriptions, granted benefits, and active meters: [@polar-sh/better-auth README](C:/Users/USER/Desktop/code/pilot/apps/app/node_modules/@polar-sh/better-auth/README.md)
- The same plugin documents the webhook plugin at `/polar/webhooks`; in this repo, because Better Auth is mounted at [route.ts](C:/Users/USER/Desktop/code/pilot/apps/app/src/app/api/auth/[...all]/route.ts), the effective path is inferred to be `/api/auth/polar/webhooks` if you add that plugin later.

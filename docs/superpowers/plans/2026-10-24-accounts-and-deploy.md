# Accounts, Database, and Vercel Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sign in by email link, store each user's tastings in Supabase, show every can's community rating, and deploy the site to Vercel.

**Architecture:** The Vite SPA stays static on Vercel and talks to Supabase directly with `@supabase/supabase-js` and the publishable key; Row Level Security keeps each user's rows private. Pure logic (row mapping, merging, write queue, ratings, skin URLs) lives in `src/lib/` with Vitest tests first; thin Supabase calls live in a new `src/services/`; the existing `userDataStore` gains a guest mode and a signed-in mode that writes optimistically and rolls back on failure.

**Tech Stack:** Vite 8, React 19, TypeScript 6 (strict), React Router 8, Vitest 5, `@supabase/supabase-js` 2.x, Supabase (Auth, Postgres, Storage), Vercel.

**Spec:** `docs/superpowers/specs/2026-10-24-accounts-and-deploy-design.md`

## Global Constraints

- One new dependency only: `@supabase/supabase-js`. No Supabase CLI.
- Environment variables, exactly: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SKIN_BASE_URL`. Never put a secret key (`sb_secret_…`) in the client or the repo.
- Missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` → the Supabase client is `null` and the app runs in guest mode; it never crashes.
- Auth client options: `{ flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true }`.
- Tables: `public.tasting_entries (user_id, can_id, tried, want_to_try, rating, note, updated_at)`, primary key `(user_id, can_id)`; `public.can_rating_stats (can_id, rating_count, rating_sum)`.
- Constraints in SQL: `rating` null or 1–5; `note` at most 2000 characters (matches `NOTE_LIMIT` in `CanPage.tsx`).
- localStorage keys: legacy data `nrgasm:v1`; after moving it `nrgasm:v1:moved`; per-account cache `nrgasm:v1:user:<userId>`.
- Notes are written 600 ms after the last keystroke.
- `src/lib/` stays pure (no React, no Supabase imports); tests only in `src/lib/**/*.test.ts` (see `vite.config.ts`).
- Code rules from `CLAUDE.md`: strict TypeScript without `any`; colors and spacing from `src/styles/tokens.css` only; one PascalCase folder per component with its CSS module; real `<button>`/`<a>`/`<label>`; targets at least 44px; respect `prefers-reduced-motion`.
- UI copy in English. Talk to the owner in Russian. The owner creates every account and enters every key; `docs/DEPLOY.md` gives the exact steps.
- `public/cans/` stays git-ignored; skins reach production through the Supabase Storage bucket `cans`.

## Review Focus

1. **Fast repeated clicks on one can** (Tried on, off, on within a second): the final database state must equal the last click. Pinned by the `createWriteQueue` tests in Task 2.
2. **A failed write** (offline, RLS rejection, constraint error): the screen must return to exactly the previous entry, including removing an entry that did not exist before. Pinned by the `restoreEntry` tests in Task 1.
3. **A link opened in another browser, or expired:** the user lands on `/sign-in` with a plain-words explanation instead of a silent guest state. Pinned by the `authErrorFromUrl` tests in Task 4.
4. **Signing out on a shared computer:** the next person must not see the previous account's tastings. Pinned in Task 5 (sign-out removes `nrgasm:v1:user:<userId>`; checked by hand in Step 9).
5. **An import that fails halfway:** importing must never leave the account emptier than before. Pinned by the `importPlan` tests in Task 1 (upsert first, delete leftovers second).

---

## File Structure

| File | Responsibility |
|---|---|
| `supabase/migrations/20261024000000_tastings.sql` | Tables, constraints, RLS, grants, stats trigger (Task 3) |
| `src/lib/rows.ts` | DB row ↔ `TastingEntry`, write planning, rollback, import planning (Task 1) |
| `src/lib/merge.ts` | Merge browser data into account data (Task 1) |
| `src/lib/queue.ts` | Per-key serial write queue (Task 2) |
| `src/lib/ratings.ts` | Stats rows → community rating per can (Task 2) |
| `src/lib/skins.ts` | `skinUrl(path, base)` (Task 2) |
| `src/lib/authUrl.ts` | Read Supabase auth errors from the redirect URL (Task 4) |
| `src/lib/storage.ts` | Add legacy/cache key helpers (Task 6) |
| `src/services/supabase.ts` | The one Supabase client, or `null` (Task 4) |
| `src/services/auth.ts` | Send link, sign out, listen to session changes (Task 4) |
| `src/services/entries.ts` | Load, upsert, delete, import tastings (Task 5) |
| `src/services/ratings.ts` | Load `can_rating_stats` (Task 7) |
| `src/hooks/authStore.ts`, `src/hooks/useAuth.ts` | Session state for React (Task 4) |
| `src/hooks/userDataStore.ts` | Guest and signed-in modes (Task 5) |
| `src/hooks/ratingsStore.ts`, `src/hooks/useCommunityRatings.ts` | Community ratings for React (Task 7) |
| `src/pages/SignInPage/` | `/sign-in` (Task 4) |
| `src/components/AccountMenu/` | Header: Sign in / email + Sign out (Task 4) |
| `src/components/SignInPrompt/` | "Sign in to keep track of your cans" dialog (Task 5) |
| `src/components/MoveDataPrompt/` | "Move N tastings…" dialog (Task 6) |
| `src/components/CommunityRating/` | "★ 4.2 · 37 ratings" (Task 7) |
| `vercel.json`, `.env.example`, `docs/DEPLOY.md` | Deploy config and the owner's setup guide (Tasks 3, 8, 9) |

---

### Task 1: Row mapping, merge, rollback, and import planning

**Files:**
- Create: `src/lib/rows.ts`, `src/lib/merge.ts`
- Test: `src/lib/rows.test.ts`, `src/lib/merge.test.ts`

**Interfaces:**
- Consumes: `TastingEntry`, `UserData`, `Rating` from `src/types/tasting.ts`; `isRating` from `src/lib/validate.ts`.
- Produces:
  - `interface EntryRow { user_id: string; can_id: string; tried: boolean; want_to_try: boolean; rating: number | null; note: string; updated_at: string }`
  - `rowToEntry(row: unknown): [canId: string, entry: TastingEntry] | null` — returns `null` for any malformed row.
  - `rowsToUserData(rows: unknown[]): UserData` — skips malformed rows.
  - `entryToRow(userId: string, canId: string, entry: TastingEntry): EntryRow`
  - `type WritePlan = { kind: 'upsert'; row: EntryRow } | { kind: 'delete'; canId: string }`
  - `planWrite(userId: string, canId: string, data: UserData): WritePlan` — `delete` when `data[canId]` is missing (blank entries are already removed by `updateEntry`).
  - `restoreEntry(data: UserData, canId: string, previous: TastingEntry | undefined): UserData` — returns a new map.
  - `importPlan(userId: string, current: UserData, incoming: UserData): { upserts: EntryRow[]; deletes: string[] }` — `deletes` are can ids in `current` but not in `incoming`.
  - `mergeUserData(account: UserData, browser: UserData): UserData` — per can, the entry with the later `updatedAt` wins; ties keep the account's entry.

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/rows.test.ts
const row = { user_id: 'u1', can_id: 'mango-loco', tried: true, want_to_try: false, rating: 4, note: 'Sweet', updated_at: '2026-10-24T10:00:00.000Z' };

it('maps a database row to an entry', () => {
  expect(rowToEntry(row)).toEqual(['mango-loco', { tried: true, wantToTry: false, rating: 4, note: 'Sweet', updatedAt: '2026-10-24T10:00:00.000Z' }]);
});
it('rejects a row with a rating outside 1–5', () => {
  expect(rowToEntry({ ...row, rating: 7 })).toBeNull();
});
it('rejects a row without a can id or with a bad date', () => {
  expect(rowToEntry({ ...row, can_id: '' })).toBeNull();
  expect(rowToEntry({ ...row, updated_at: 'yesterday' })).toBeNull();
});
it('skips bad rows and keeps good ones', () => {
  expect(Object.keys(rowsToUserData([row, { ...row, can_id: 'khaotic', tried: 'yes' }]))).toEqual(['mango-loco']);
});
it('round-trips an entry through a row', () => {
  const [id, entry] = rowToEntry(row)!;
  expect(entryToRow('u1', id, entry)).toEqual(row);
});
it('plans an upsert for an existing entry and a delete for a removed one', () => {
  const data = rowsToUserData([row]);
  expect(planWrite('u1', 'mango-loco', data)).toEqual({ kind: 'upsert', row });
  expect(planWrite('u1', 'khaotic', data)).toEqual({ kind: 'delete', canId: 'khaotic' });
});
it('restores the previous entry after a failed write', () => {
  const data = rowsToUserData([row]);
  const changed = { ...data, 'mango-loco': { ...data['mango-loco'], rating: 1 as const } };
  expect(restoreEntry(changed, 'mango-loco', data['mango-loco'])).toEqual(data);
});
it('removes an entry that did not exist before the failed write', () => {
  const data = rowsToUserData([row]);
  expect(restoreEntry(data, 'mango-loco', undefined)).toEqual({});
});
it('imports by upserting everything first and deleting only leftovers', () => {
  const current = rowsToUserData([row, { ...row, can_id: 'khaotic' }]);
  const incoming = rowsToUserData([{ ...row, rating: 5 }]);
  const plan = importPlan('u1', current, incoming);
  expect(plan.upserts).toEqual([{ ...row, rating: 5 }]);
  expect(plan.deletes).toEqual(['khaotic']);
});
```

```ts
// src/lib/merge.test.ts
const older = { tried: true, wantToTry: false, rating: 3 as const, note: 'old', updatedAt: '2026-10-01T00:00:00.000Z' };
const newer = { ...older, rating: 5 as const, note: 'new', updatedAt: '2026-10-20T00:00:00.000Z' };

it('keeps the newer entry per can', () => {
  expect(mergeUserData({ a: older }, { a: newer })).toEqual({ a: newer });
  expect(mergeUserData({ a: newer }, { a: older })).toEqual({ a: newer });
});
it('keeps the account entry on a tie', () => {
  const tie = { ...newer, note: 'browser' };
  expect(mergeUserData({ a: newer }, { a: tie })).toEqual({ a: newer });
});
it('adds cans that only one side has', () => {
  expect(mergeUserData({ a: older }, { b: newer })).toEqual({ a: older, b: newer });
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npm run test -- --run src/lib/rows.test.ts src/lib/merge.test.ts`
Expected: FAIL, "Cannot find module './rows'" and "'./merge'".

- [ ] **Step 3: Implement the functions in `src/lib/rows.ts` and `src/lib/merge.ts`**

`rowToEntry` validates with `isRecord`/`isRating` from `validate.ts` (same checks as `isTastingEntry`, plus a non-empty `can_id` string). Compare dates with `Date.parse`.

- [ ] **Step 4: Run the tests to see them pass**

Run: `npm run test -- --run`
Expected: all test files pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/rows.ts src/lib/rows.test.ts src/lib/merge.ts src/lib/merge.test.ts
git commit -m "feat: map tasting rows, merge browser data, plan writes and imports"
```

---

### Task 2: Write queue, community ratings, skin URLs

**Files:**
- Create: `src/lib/queue.ts`, `src/lib/ratings.ts`, `src/lib/skins.ts`
- Test: `src/lib/queue.test.ts`, `src/lib/ratings.test.ts`, `src/lib/skins.test.ts`

**Interfaces:**
- Produces:
  - `createWriteQueue(): (key: string, job: () => Promise<void>) => Promise<void>` — jobs with the same key run one after another in call order; different keys run independently; a rejected job does not block later jobs for that key (its promise still rejects to the caller).
  - `interface CommunityRating { average: number; count: number }`
  - `ratingsFromStats(rows: unknown[]): Record<string, CommunityRating>` — `average = rating_sum / rating_count`; skips rows with `rating_count <= 0` or non-numeric fields.
  - `skinUrl(path: string, base: string | undefined): string` — with a base, joins `base` and the file name after `/cans/` with exactly one `/`; without a base (undefined or empty), returns `path` unchanged.

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/queue.test.ts
it('runs jobs for one key in call order', async () => {
  const run = createWriteQueue();
  const log: string[] = [];
  const slow = () => new Promise<void>((done) => setTimeout(() => { log.push('first'); done(); }, 20));
  const fast = async () => { log.push('second'); };
  await Promise.all([run('mango-loco', slow), run('mango-loco', fast)]);
  expect(log).toEqual(['first', 'second']);
});
it('does not let a failed job block the next one', async () => {
  const run = createWriteQueue();
  const failing = run('a', async () => { throw new Error('offline'); });
  await expect(failing).rejects.toThrow('offline');
  let ran = false;
  await run('a', async () => { ran = true; });
  expect(ran).toBe(true);
});
it('runs different keys independently', async () => {
  const run = createWriteQueue();
  const log: string[] = [];
  const blocker = run('a', () => new Promise<void>((done) => setTimeout(() => { log.push('a'); done(); }, 20)));
  await run('b', async () => { log.push('b'); });
  await blocker;
  expect(log).toEqual(['b', 'a']);
});
```

```ts
// src/lib/ratings.test.ts
it('turns stats rows into averages', () => {
  expect(ratingsFromStats([{ can_id: 'assault', rating_count: 4, rating_sum: 14 }])).toEqual({ assault: { average: 3.5, count: 4 } });
});
it('skips empty and malformed rows', () => {
  expect(ratingsFromStats([{ can_id: 'a', rating_count: 0, rating_sum: 0 }, { can_id: 'b', rating_count: '2' }, null])).toEqual({});
});
```

```ts
// src/lib/skins.test.ts
it('points a skin at the storage bucket', () => {
  expect(skinUrl('/cans/mango-loco.jpg', 'https://x.supabase.co/storage/v1/object/public/cans/')).toBe('https://x.supabase.co/storage/v1/object/public/cans/mango-loco.jpg');
  expect(skinUrl('/cans/mango-loco.jpg', 'https://x.supabase.co/storage/v1/object/public/cans')).toBe('https://x.supabase.co/storage/v1/object/public/cans/mango-loco.jpg');
});
it('keeps the local path without a base', () => {
  expect(skinUrl('/cans/mango-loco.jpg', undefined)).toBe('/cans/mango-loco.jpg');
  expect(skinUrl('/cans/mango-loco.jpg', '')).toBe('/cans/mango-loco.jpg');
});
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `npm run test -- --run src/lib/queue.test.ts src/lib/ratings.test.ts src/lib/skins.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the three modules**

`createWriteQueue` keeps a `Map<string, Promise<void>>` of each key's tail; chain the new job after the tail with `.catch(() => {})` on the stored tail so a failure does not poison it.

- [ ] **Step 4: Run all tests**

Run: `npm run test -- --run`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/queue.ts src/lib/queue.test.ts src/lib/ratings.ts src/lib/ratings.test.ts src/lib/skins.ts src/lib/skins.test.ts
git commit -m "feat: per-can write queue, community ratings, skin URLs"
```

---

### Task 3: Database schema and Supabase setup guide

**Files:**
- Create: `supabase/migrations/20261024000000_tastings.sql`, `docs/DEPLOY.md` (sections "1. Supabase project" and "2. Database")

**Interfaces:**
- Produces: the tables and policies named in Global Constraints, which Tasks 5 and 7 query by those exact names.

- [ ] **Step 1: Write the migration**

It must contain, in this order:
1. `create table public.tasting_entries` with the columns and types from the spec, `primary key (user_id, can_id)`, `user_id uuid not null references auth.users(id) on delete cascade`, `check (rating is null or rating between 1 and 5)`, `check (char_length(note) <= 2000)`, and an index on `user_id`.
2. `alter table … enable row level security`; `revoke all on public.tasting_entries from anon, authenticated`; `grant select, insert, update, delete … to authenticated`; four policies `to authenticated` with `(select auth.uid()) = user_id` (`using` for select/delete, `with check` for insert, both for update).
3. `create table public.can_rating_stats (can_id text primary key, rating_count integer not null default 0, rating_sum integer not null default 0)`; RLS on; `revoke all … from anon, authenticated`; `grant select … to anon, authenticated`; one policy `for select to anon, authenticated using (true)`.
4. `create schema if not exists private`; function `private.refresh_can_rating(target text) returns void` (`security definer`, `set search_path = ''`, every name schema-qualified) that upserts `count(rating)` and `coalesce(sum(rating), 0)` for `target` from `public.tasting_entries`; trigger function `private.on_tasting_change()` calling it for `new.can_id` and, on update/delete, `old.can_id`; `create trigger … after insert or update or delete on public.tasting_entries for each row`.
5. `revoke all on schema private from anon, authenticated`.

- [ ] **Step 2: Write `docs/DEPLOY.md` sections 1–2 (in English)**

Steps for the owner: create a Supabase project (free tier, region close to the owner); open SQL Editor, paste the migration, Run; Project Settings → API Keys: copy the Project URL and the publishable key (`sb_publishable_…`), never the secret key; Authentication → URL Configuration: Site URL `https://nrgasm.vercel.app`, redirect URLs `http://localhost:5173/**`, `http://localhost:4173/**`, `https://*-<vercel-account-slug>.vercel.app/**`; Authentication → Users: note that only members of the Supabase team can receive emails until custom SMTP is set up (2 per hour).

- [ ] **Step 3: Owner runs the migration; verify in SQL Editor**

Claude gives the owner these queries; expected results in brackets:
- `select relrowsecurity from pg_class where relname in ('tasting_entries','can_rating_stats');` → [two rows, both `true`]
- `select policyname, cmd from pg_policies where tablename = 'tasting_entries';` → [four rows: SELECT, INSERT, UPDATE, DELETE]

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20261024000000_tastings.sql docs/DEPLOY.md
git commit -m "feat: tastings schema with RLS and rating stats"
```

---

### Task 4: Supabase client, sign-in page, account menu

**Files:**
- Create: `src/lib/authUrl.ts`, `src/lib/authUrl.test.ts`, `src/services/supabase.ts`, `src/services/auth.ts`, `src/hooks/authStore.ts`, `src/hooks/useAuth.ts`, `src/pages/SignInPage/SignInPage.tsx` + `.module.css`, `src/components/AccountMenu/AccountMenu.tsx` + `.module.css`, `.env.example`
- Modify: `package.json` (dependency), `src/App.tsx` (route `sign-in`), `src/components/Layout/Layout.tsx` (header: `AccountMenu`; tried counter only when signed in)

**Interfaces:**
- Consumes: nothing from earlier tasks except the env variable names.
- Produces:
  - `authErrorFromUrl(url: string): string | null` — reads `error_description` (or `error`) from the query string or the hash; returns a plain-words message, `null` when there is no error.
  - `supabase: SupabaseClient | null` (`src/services/supabase.ts`)
  - `sendSignInLink(email: string, redirectTo: string): Promise<{ ok: true } | { ok: false; message: string }>`
  - `signOut(): Promise<void>`
  - `onSessionChange(listener: (user: { id: string; email: string } | null) => void): () => void`
  - `type AuthState = { status: 'loading' } | { status: 'guest' } | { status: 'signed-in'; user: { id: string; email: string } }`
  - `authStore.getSnapshot(): AuthState`, `authStore.subscribe(listener): () => void`; `useAuth(): AuthState`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/authUrl.test.ts
it('explains an expired or reused link', () => {
  expect(authErrorFromUrl('https://nrgasm.vercel.app/?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired'))
    .toBe('This sign-in link has expired or was already used. Ask for a new one, and open it in this browser.');
});
it('reads errors from the hash too', () => {
  expect(authErrorFromUrl('https://nrgasm.vercel.app/#error=server_error&error_description=Boom')).toBe('Sign-in failed: Boom');
});
it('returns null without an error', () => {
  expect(authErrorFromUrl('https://nrgasm.vercel.app/catalog?code=abc')).toBeNull();
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npm run test -- --run src/lib/authUrl.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `authErrorFromUrl`; run tests**

`error_code` `otp_expired` maps to the expiry message above; anything else is `Sign-in failed: <description>`.
Run: `npm run test -- --run` → all pass.

- [ ] **Step 4: Install the dependency (after confirming the current API in the Supabase docs)**

Run: `npm install @supabase/supabase-js`
Expected: `package.json` lists `@supabase/supabase-js` with a `^2.` range.

- [ ] **Step 5: Implement `src/services/supabase.ts`, `src/services/auth.ts`, `authStore`, `useAuth`**

`supabase.ts` returns `null` when either env variable is missing, else `createClient(url, key, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true } })`. `sendSignInLink` calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })` and maps errors: message containing "not authorized" → `Only invited email addresses can sign in for now.`; status 429 → `Too many sign-in emails. Try again in an hour.`; network failure → `Could not reach the server. Check your connection.`. `authStore` starts `loading`, becomes `guest` when the client is `null`, and follows `onAuthStateChange`.

- [ ] **Step 6: Build `SignInPage` and `AccountMenu`; wire the route and header**

Sign-in page copy: heading `Sign in`; label `Email`; button `Send link`; after sending: `Check your inbox. Open the link in this browser — it works for 5 minutes.`; when `authErrorFromUrl(window.location.href)` returns a message, show it above the form. A signed-in visitor to `/sign-in` is redirected to `/catalog`. Header: guest → link `Sign in`; signed in → the email (truncated with CSS) and a `Sign out` button.

- [ ] **Step 7: Add `.env.example`**

Three lines with empty values: `VITE_SUPABASE_URL=`, `VITE_SUPABASE_PUBLISHABLE_KEY=`, `VITE_SKIN_BASE_URL=`. Confirm `.env.local` is ignored (`*.local` is already in `.gitignore`).

- [ ] **Step 8: Verify by hand**

With `.env.local` filled: `npm run dev`; in the built-in browser open `/sign-in`, send a link to the owner's (team member) address, open it in the same browser → the header shows the email; `Sign out` → `Sign in` again. Without `.env.local`: the site loads as a guest, no console errors. Then `npm run build` and `npm run lint` pass.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json .env.example src/lib/authUrl.ts src/lib/authUrl.test.ts src/services src/hooks/authStore.ts src/hooks/useAuth.ts src/pages/SignInPage src/components/AccountMenu src/App.tsx src/components/Layout/Layout.tsx
git commit -m "feat: sign in by email link"
```

---

### Task 5: Tastings in the database, guest gating

**Files:**
- Create: `src/services/entries.ts`, `src/components/SignInPrompt/SignInPrompt.tsx` + `.module.css`
- Modify: `src/hooks/userDataStore.ts`, `src/hooks/useUserData.ts`, `src/components/Layout/Layout.tsx`, `src/pages/CanPage/CanPage.tsx` (note debounce, guest focus), `src/pages/StatsPage/StatsPage.tsx` (guest prompt), `src/components/DataTransfer/DataTransfer.tsx` (import through the account; hidden for guests)

**Interfaces:**
- Consumes: `rowsToUserData`, `planWrite`, `restoreEntry`, `importPlan` (Task 1); `createWriteQueue` (Task 2); `supabase`, `useAuth`, `authStore` (Task 4); `updateEntry` from `src/lib/entries.ts`.
- Produces:
  - `fetchEntries(): Promise<unknown[]>`; `writeEntry(plan: WritePlan): Promise<void>`; `applyImport(plan: { upserts: EntryRow[]; deletes: string[] }): Promise<void>` (upserts first, then deletes) — all throw on error.
  - `UserDataSnapshot` gains `mode: 'guest' | 'signed-in'` and `signInPrompt: boolean`.
  - `userDataStore.update(id, patch)` — guest: sets `signInPrompt: true`, changes nothing; signed in: applies `updateEntry` at once, saves the cache, queues `writeEntry(planWrite(…))` per can id, on failure calls `restoreEntry` and sets `notice`.
  - `userDataStore.replaceAll(data)` — signed in only; runs `applyImport(importPlan(…))`, then reloads.
  - `userDataStore.requestSignIn()`, `userDataStore.closeSignInPrompt()`.

- [ ] **Step 1: Implement `src/services/entries.ts`**

Table `tasting_entries`; upsert with `onConflict: 'user_id,can_id'`; delete by `can_id` (RLS limits it to the user's rows).

- [ ] **Step 2: Rework `userDataStore` into two modes**

Subscribe to `authStore`. On `signed-in`: show the cache `nrgasm:v1:user:<id>` at once, then `fetchEntries` → `rowsToUserData` → replace data and cache. On `guest`: data `{}`. On sign-out: remove that user's cache key. Failure notice text: `Could not save your change, so it was undone. Check your connection and try again.` Load failure: `Could not load your tastings. Showing the last saved copy.` The old `storage` event listener and `STORAGE_KEY` writes go away (legacy data is handled in Task 6).

- [ ] **Step 3: Debounce notes on the can page**

`CanPage` keeps its local draft and calls `updateEntry(can.id, { note })` 600 ms after the last change (and on unmount if a change is pending). For guests, focusing the textarea calls `requestSignIn()`; note tags do the same through `updateEntry`.

- [ ] **Step 4: Add `SignInPrompt` and show it from `Layout`**

A `role="dialog"` with heading `Sign in to keep track of your cans`, text `Mark cans, rate them, and keep notes on any device.`, a primary link `Sign in` to `/sign-in`, and a `Not now` button; Escape closes it; focus returns to the control that opened it.

- [ ] **Step 5: Guests on Stats and in DataTransfer**

Stats for a guest: a panel with `Sign in to see your stats` and a `Sign in` link instead of the personal numbers. `DataTransfer` renders only when signed in.

- [ ] **Step 6: Verify by hand**

Signed in: mark Tried, rate, write a note; reload → still there. Second browser, same account → same data. Tried on/off/on quickly → after reload it is on. Devtools offline → change a rating → it snaps back with the notice. Guest: every control opens the prompt; nothing is written. Sign out → the tastings disappear from the screen and `nrgasm:v1:user:<id>` is gone from localStorage. `npm run build`, `npm run lint`, `npm run test -- --run` pass.

- [ ] **Step 7: Commit**

```bash
git add src/services/entries.ts src/hooks src/components/SignInPrompt src/components/Layout src/pages/CanPage src/pages/StatsPage src/components/DataTransfer
git commit -m "feat: store tastings per account, guests browse read-only"
```

---

### Task 6: Move the browser's old data into the account

**Files:**
- Modify: `src/lib/storage.ts`, `src/lib/storage.test.ts`, `src/hooks/userDataStore.ts`
- Create: `src/components/MoveDataPrompt/MoveDataPrompt.tsx` + `.module.css`

**Interfaces:**
- Consumes: `loadUserData`, `STORAGE_KEY` (`src/lib/storage.ts`); `mergeUserData` (Task 1); `applyImport`, `importPlan` (Tasks 1, 5).
- Produces:
  - `MOVED_KEY = 'nrgasm:v1:moved'`; `userCacheKey(userId: string): string` → `'nrgasm:v1:user:' + userId`.
  - `markLegacyMoved(storage: KeyValueStorage & Pick<Storage, 'removeItem'>): void` — copies `nrgasm:v1` to `nrgasm:v1:moved`, then removes `nrgasm:v1`.
  - Snapshot field `legacyCount: number` (entries waiting to move; 0 when none); `userDataStore.moveLegacy(): Promise<void>`; `userDataStore.skipLegacy(): void`.

- [ ] **Step 1: Write the failing tests**

```ts
it('builds the per-account cache key', () => {
  expect(userCacheKey('u1')).toBe('nrgasm:v1:user:u1');
});
it('keeps the old data under the moved key', () => {
  const storage = fakeStorage({ 'nrgasm:v1': '{"a":1}' });
  markLegacyMoved(storage);
  expect(storage.getItem('nrgasm:v1')).toBeNull();
  expect(storage.getItem('nrgasm:v1:moved')).toBe('{"a":1}');
});
```

(`fakeStorage` is the in-memory helper already used in `storage.test.ts`; extend it with `removeItem`.)

- [ ] **Step 2: Run to fail, implement, run to pass**

Run: `npm run test -- --run src/lib/storage.test.ts` → FAIL, then implement, then all tests pass.

- [ ] **Step 3: Offer the move after sign-in**

After the account's rows load, if `loadUserData(localStorage)` has entries, set `legacyCount`. `MoveDataPrompt` (dialog) text: heading `Move your tastings?`, body `This browser has N tastings saved from before you signed in. Move them to your account? When both have the same can, the newer one is kept.`, buttons `Move them` and `Not now`. `moveLegacy`: `mergeUserData(account, legacy)` → `applyImport(importPlan(userId, account, merged))` → `markLegacyMoved` → reload. `skipLegacy` only hides it for this session.

- [ ] **Step 4: Verify by hand**

Put sample data under `nrgasm:v1` (import the owner's export into a guest-era build, or set it in devtools), sign in → prompt with the right count → `Move them` → the tastings show in the account and in a second browser; `nrgasm:v1:moved` exists, `nrgasm:v1` is gone. Build, lint, tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts src/hooks/userDataStore.ts src/components/MoveDataPrompt
git commit -m "feat: move a browser's old tastings into the account"
```

---

### Task 7: Community ratings on cards and the can page

**Files:**
- Create: `src/services/ratings.ts`, `src/hooks/ratingsStore.ts`, `src/hooks/useCommunityRatings.ts`, `src/components/CommunityRating/CommunityRating.tsx` + `.module.css`
- Modify: `src/components/CanCard/CanCard.tsx`, `src/pages/CanPage/CanPage.tsx`

**Interfaces:**
- Consumes: `ratingsFromStats`, `CommunityRating` (Task 2); `supabase` (Task 4).
- Produces: `fetchRatingStats(): Promise<unknown[]>` (table `can_rating_stats`, all rows); `useCommunityRatings(): Record<string, CommunityRating>` (loaded once per page load, `{}` while loading or on error); `<CommunityRating rating={CommunityRating | undefined} />` renders nothing for `undefined`.

- [ ] **Step 1: Implement service, store, hook, component**

Text: `★ 4.2 · 37 ratings` (one decimal; `1 rating` singular); accessible name `Average rating 4.2 from 37 people`. Mono font and hint color from tokens. Shown next to the personal stars on `CanCard` and in the tasting row on `CanPage`.

- [ ] **Step 2: Verify by hand**

Rate a can with two accounts (4 and 5) → after reload both see `★ 4.5 · 2 ratings`; a guest sees it too; an unrated can shows nothing. Build, lint, tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/services/ratings.ts src/hooks/ratingsStore.ts src/hooks/useCommunityRatings.ts src/components/CommunityRating src/components/CanCard src/pages/CanPage
git commit -m "feat: show each can's community rating"
```

---

### Task 8: Skins from Supabase Storage, service worker rules

**Files:**
- Modify: `src/data/cans.ts` (apply `skinUrl` to `label` and `image` in the `cans` merge), `public/sw.js`, `docs/DEPLOY.md` (section "3. Can skins")

**Interfaces:**
- Consumes: `skinUrl` (Task 2); `import.meta.env.VITE_SKIN_BASE_URL`.

- [ ] **Step 1: Map skin paths in the catalog merge**

In the existing `catalog.map(…)` in `cans.ts`, replace `label` and `image` with `skinUrl(path, import.meta.env.VITE_SKIN_BASE_URL)` when they are set.

- [ ] **Step 2: Service worker**

In `public/sw.js`: never call `respondWith` for hosts ending in `.supabase.co` except paths starting with `/storage/v1/object/public/`, which use `staleWhileRevalidate`. Bump `CACHE` to `nrgasm-v2`.

- [ ] **Step 3: `docs/DEPLOY.md` section 3**

Storage → New bucket `cans`, public; upload every file from `public/cans/`; copy the bucket's public URL base (`https://<project>.supabase.co/storage/v1/object/public/cans/`) into `VITE_SKIN_BASE_URL`. Note the owner's decision and risk from the spec, and that deleting files from the bucket takes skins down without a redeploy.

- [ ] **Step 4: Verify by hand**

With `VITE_SKIN_BASE_URL` set and `public/cans/` temporarily renamed, `npm run dev` → 3D cans still have skins (Network tab: requests to `supabase.co/storage/…`); restore the folder. Without the variable → skins load from `/cans/`. `npm run build` + `npx vite preview` → Supabase API calls are not served from the cache (devtools → Application → Cache Storage has no `/rest/` or `/auth/` entries). Build, lint, tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/data/cans.ts public/sw.js docs/DEPLOY.md
git commit -m "feat: serve skins from Supabase Storage"
```

---

### Task 9: Vercel deploy and documentation

**Files:**
- Create: `vercel.json`
- Modify: `docs/DEPLOY.md` (sections "4. Vercel", "5. Opening sign-up later"), `CLAUDE.md`, `docs/PRODUCT.md`, `docs/PROGRESS.md`

- [ ] **Step 1: `vercel.json`**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 2: `docs/DEPLOY.md` sections 4–5**

4: Vercel → Add New Project → import the GitHub repository `nrgasm`; framework preset Vite (build `npm run build`, output `dist`); Environment Variables: the three `VITE_` variables for Production and Preview; Deploy; then put the real production URL into Supabase's Site URL if it differs from `nrgasm.vercel.app`. 5: buy a domain; verify it with an email provider; Supabase → Authentication → SMTP Settings; raise the email rate limit; add the domain in Vercel and in Supabase's Site URL and redirect URLs.

- [ ] **Step 3: Update `CLAUDE.md`, `docs/PRODUCT.md`, `docs/PROGRESS.md`**

`CLAUDE.md`: stack rows for Supabase and Vercel; the data rule (catalog static in `src/data/`; user data in Supabase, cached per account in localStorage); `src/services/` in the structure. `PRODUCT.md`: `tasting_entries` and `can_rating_stats`, route `/sign-in`, guest rules. `PROGRESS.md`: decisions table rows from the spec's "What the owner decided", and a session log entry.

- [ ] **Step 4: Owner deploys; verify the live site**

On the deployed URL: `/can/assault` opens directly (no 404); skins load from Storage; the owner signs in by link; a tasting saved on the phone shows on the computer; a guest sees community ratings; RLS check — signed in as a second team member, the browser console query `await supabase.from('tasting_entries').select('*')` returns only that member's rows.

- [ ] **Step 5: Commit**

```bash
git add vercel.json docs/DEPLOY.md CLAUDE.md docs/PRODUCT.md docs/PROGRESS.md
git commit -m "feat: Vercel config and deploy guide"
```

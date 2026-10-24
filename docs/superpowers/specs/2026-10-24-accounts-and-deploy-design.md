# Accounts, database, and Vercel deploy: design

Date: 2026-10-24. Status: approved in chat, waiting for the owner's review of this file.

## Goal

Put NRGASM on Vercel so people can use it from any device: sign in with a link sent by email, keep their tastings in a database, and see how everyone rated each can.

## What the owner decided

| Question | Decision |
|---|---|
| Who uses the site | Anyone. Sign-up is meant to be open to everyone |
| How people sign in | Only by a link sent by email (magic link), no passwords |
| Visitors who are not signed in | Can browse the catalog, can pages, and Compare; cannot mark, rate, or write notes |
| Privacy | Tastings and notes are private. Each can shows the average rating of all users and the number of ratings |
| Can skins | All 68 skins are published. The owner accepts the risk: most are third-party photos (© Energy Drink Cans UK) and Monster artwork, and the rights holders may ask for them to be taken down |
| Stack | Supabase (Auth + Postgres + Storage) with the static site on Vercel |
| Email | First launch on `nrgasm.vercel.app` with Supabase's built-in email. A custom domain and SMTP come later |

## Scope

In scope:

- Sign in and sign out by email link.
- Tastings (`tried`, `wantToTry`, `rating`, `note`) stored per user in Postgres.
- Average rating and rating count per can, shown to everyone.
- Moving the owner's existing browser data into the account.
- Can skins served from Supabase Storage.
- Deploying to Vercel from GitHub.
- A step-by-step guide in `docs/DEPLOY.md`.

Out of scope for this stage:

- A custom domain, custom SMTP, and open sign-up for everyone (no code changes needed later; see "Email limits").
- Deleting an account from inside the app (the owner can delete users in the Supabase dashboard).
- Public profiles, sharing, comments, moderation.
- Offline writes.

## Email limits (why the first launch is not yet open to everyone)

Supabase's built-in email sends only to members of the project's Supabase team, and at most 2 emails per hour. Anyone else gets "Email address not authorized" ([Supabase: custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)).

So on the first launch only the owner, and people the owner adds to the Supabase team, can sign in. Opening sign-up to everyone needs a custom SMTP server, which needs a sending domain verified with an email provider (for example Resend). This is set up in the Supabase dashboard and needs no code changes. Then the default limit is 30 emails per hour, which can be raised.

## Architecture

```
Browser (Vite + React SPA, served by Vercel)
 ├─ src/data/cans.ts, tastes.ts      static catalog (unchanged)
 ├─ src/lib/                         pure logic, tested (entries, merge, rows, skins)
 ├─ src/services/                    thin Supabase calls (auth, entries, ratings)
 └─ src/hooks/userDataStore.ts       in-memory store the components already read
        │  @supabase/supabase-js (publishable key)
        ▼
Supabase
 ├─ Auth            magic link, PKCE flow
 ├─ Postgres        tasting_entries (RLS), can_rating_stats (public read)
 └─ Storage         bucket "cans" (public) with the 68 skins
```

- No own server. The browser talks to Supabase with the publishable key (`sb_publishable_…`), which is safe to expose; the data is protected by Row Level Security ([Supabase: API keys](https://supabase.com/docs/guides/api/api-keys)).
- The catalog stays static in `src/data/`. The database holds only user data. The two data sources still never mix.
- New dependency: `@supabase/supabase-js` (the only one).

## Data model

### `public.tasting_entries`

| Column | Type | Rule |
|---|---|---|
| `user_id` | `uuid` | references `auth.users(id)` on delete cascade |
| `can_id` | `text` | a catalog id, not checked against the catalog in SQL |
| `tried` | `boolean` | not null |
| `want_to_try` | `boolean` | not null, default false |
| `rating` | `smallint` | null, or between 1 and 5 |
| `note` | `text` | not null, default `''`, at most 2000 characters |
| `updated_at` | `timestamptz` | not null |

- Primary key: `(user_id, can_id)`.
- Row Level Security on. The `anon` role gets no access. The `authenticated` role can select, insert, update, and delete only rows where `user_id = (select auth.uid())`, following the per-user pattern in [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security). The update policy uses both `using` and `with check`, so a row cannot be handed to another user.
- The same rules as `src/lib/entries.ts` apply on the client: rating marks a can as tried, un-trying clears the rating, a tried can is no longer "want to try", and a blank entry is deleted instead of stored.

### `public.can_rating_stats`

| Column | Type |
|---|---|
| `can_id` | `text` primary key |
| `rating_count` | `integer` |
| `rating_sum` | `integer` |

- Readable by everyone (`anon` and `authenticated`, select only). Nobody can write to it directly.
- Kept up to date by a trigger on `tasting_entries` (insert, update, delete), which recomputes the row for the affected can. The trigger function lives in a private schema that the Data API does not expose, uses `security definer` with `search_path = ''`, and schema-qualifies every name, as the Supabase guide recommends for security definer functions.
- The client computes the average as `rating_sum / rating_count`.
- This table instead of a public view or a `security definer` function in `public`: Supabase warns that views and definer functions in an exposed schema bypass RLS.

### Migration file

`supabase/migrations/20261024000000_tastings.sql` holds the tables, constraints, index on `user_id`, RLS policies, grants, the private schema, the trigger function, and the trigger. The owner runs it once in the Supabase SQL Editor; no Supabase CLI.

## Client

### Supabase client: `src/services/supabase.ts`

- Created from `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, with `auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true }`. The PKCE guide sets these explicitly rather than relying on defaults ([Supabase: PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow)).
- When either variable is missing, the client is `null` and the app runs in guest mode without crashing (useful for a fresh clone).

### Signing in: `/sign-in` page

- One email field and a "Send link" button calling `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })`, where `emailRedirectTo` is the current origin.
- After sending: "Check your inbox. Open the link in this browser." The PKCE code exchange must happen in the browser that asked for the link, and the code is valid for 5 minutes.
- Errors are shown in plain words: not authorized (only team members on the first launch), too many requests, network.
- Header: "Sign in" for guests; for a signed-in user, their email and "Sign out". The tried counter shows only when signed in.

### Session and user data

- A small auth store (in `src/hooks/`) listens to `supabase.auth.onAuthStateChange` and exposes `{ status: 'loading' | 'guest' | 'signed-in', user }`.
- `userDataStore` stays the one in-memory source the components read through `useSyncExternalStore`. It gets two modes:
  - **Guest:** empty data; `updateEntry` does not write and instead asks the UI to show the sign-in prompt.
  - **Signed in:** on sign-in, all of the user's rows are loaded with one select. Changes apply on screen at once, then are sent in the background: `upsert` for a real entry, `delete` for a blank one. If a write fails, the change is rolled back and the header notice says what happened.
- Notes are sent 600 ms after the last keystroke, not on every key.
- Cache: the last loaded data of each account is kept in localStorage under `nrgasm:v1:user:<userId>` and shown at once on the next visit, before the database answers, and offline. Writes need the network; offline they fail with a notice.

### Guests

- Tried, Want to try, stars, notes, and note tags look the same. Using them opens a prompt: "Sign in to keep track of your cans", with a link to `/sign-in`.
- Stats shows a sign-in prompt instead of personal numbers. Compare works, without personal ratings.

### Moving existing browser data

- On the first sign-in in a browser that still has data under the old key `nrgasm:v1`, the app asks: "Move N tastings from this browser to your account?"
- Yes: merge with the account's rows, where the newer `updatedAt` wins per can, then upsert the result. The old key is renamed to `nrgasm:v1:moved` (kept, not deleted), as with unreadable data today.
- No: nothing is written; the question comes back on the next sign-in.
- Export and import of JSON stay. Import keeps today's rule, replace after confirmation: while signed in, it deletes the account's rows and upserts the imported ones. Guests cannot import.

### Community rating

- `can_rating_stats` is loaded once when the app starts (up to 144 rows), for guests too.
- Cards and the can page show, for example, "★ 4.2 · 37 ratings" next to the personal stars. Cans without ratings show nothing.
- The numbers refresh on the next load, not live after your own rating.

### Skins

- `Can.label` keeps paths like `/cans/mango-loco.jpg`.
- A pure helper `skinUrl(path, base)` in `src/lib/` maps them to `VITE_SKIN_BASE_URL` (the public URL of the Storage bucket) when it is set, and leaves them as they are otherwise, so local development still uses `public/cans/`.
- `public/cans/` stays git-ignored. The skins are not committed to the public GitHub repository.

### Service worker

- Requests to the Supabase API and Auth are never cached.
- Skins from Supabase Storage are cached like other images (stale-while-revalidate).

## Pure logic and tests (`src/lib/`, tests first)

| Module | What it does |
|---|---|
| `rows.ts` | Database row ↔ `TastingEntry`, validated the same way as `validate.ts` (a bad row is skipped, not trusted) |
| `merge.ts` | Merges browser data into account data; newer `updatedAt` wins |
| `ratings.ts` | Stats rows → average and count per can; ignores rows with zero count |
| `skins.ts` | `skinUrl(path, base)` |

The code in `src/services/` stays thin and is checked by hand (see below).

## Deploy and setup

The owner creates the accounts and enters every key; Claude gives the exact steps in `docs/DEPLOY.md`.

1. **Supabase project:** create it; run the migration in the SQL Editor.
2. **Auth settings:** Site URL `https://nrgasm.vercel.app`. Redirect URLs `http://localhost:5173/**`, `http://localhost:4173/**`, and `https://*-<vercel-account-slug>.vercel.app/**` for previews ([Supabase: redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)).
3. **Storage:** create a public bucket `cans` and upload the 68 files from `public/cans/`.
4. **Vercel:** import the GitHub repository; framework Vite. Environment variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SKIN_BASE_URL`.
5. **`vercel.json`:** rewrite every path to `/index.html`, so deep links such as `/can/assault` work ([Vercel: Vite](https://vercel.com/docs/frameworks/frontend/vite)).
6. **Local:** `.env.local` (git-ignored) with the same three variables; `.env.example` committed with empty values.
7. **Later, to open sign-up:** buy a domain, verify it with an email provider, enter its SMTP settings in Supabase, and point the domain at Vercel.

## Checking it works

- `npm run build`, `npm run lint`, `npm run test` pass.
- In the built-in browser: sign in by link; mark, rate, and write a note; reload; the data is still there.
- A second browser signed in to the same account sees the same data.
- A guest sees the catalog and the community ratings, and gets the sign-in prompt on every write control.
- RLS: a second account cannot read the first account's rows (an empty result through the API).
- Moving browser data: old data is offered, merged, and the old key is renamed.
- The deployed site: a deep link opens, skins load from Storage, sign-in works for a team member.

## Documentation updates

- `CLAUDE.md`: stack table (Supabase, Vercel), the data rule (catalog static; user data in Supabase, cached in localStorage), the new `src/services/` folder.
- `docs/PRODUCT.md`: data model, the `/sign-in` route, guest rules.
- `docs/PROGRESS.md`: decisions and the session log.
- `docs/DEPLOY.md`: the setup steps above.

## Risks

- **Skins:** publishing third-party photos and Monster artwork may lead to a takedown request. It is the owner's decision; removing the files from the bucket takes the skins down without a redeploy.
- **Email:** until custom SMTP is set up, only team members can sign in, at 2 emails per hour.
- **Same browser:** a link opened in another browser or app (for example a mail app's built-in browser) will not sign in. The sign-in page says so.
- **Legacy keys:** the app uses the publishable key, not the `anon` key that Supabase plans to retire by the end of 2026.

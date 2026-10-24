# Deploying NRGASM

How to put NRGASM online with Supabase (sign-in, database, can skins) and Vercel (the website). You create the accounts and enter every key yourself; nothing here needs a credit card on the free tiers.

The design behind these steps is in `docs/superpowers/specs/2026-10-24-accounts-and-deploy-design.md`.

## 1. Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project (free tier). Pick a region close to you, and save the database password somewhere safe; the app never needs it.
2. Wait until the project says it is ready.

## 2. Database

1. Open **SQL Editor** → **New query**.
2. Paste the whole file `supabase/migrations/20261024000000_tastings.sql` and click **Run**. Expected: "Success. No rows returned".
3. Check it worked. Run these two queries:

   ```sql
   select relname, relrowsecurity from pg_class where relname in ('tasting_entries', 'can_rating_stats');
   ```

   Expected: two rows, both with `relrowsecurity = true`.

   ```sql
   select policyname, cmd from pg_policies where tablename = 'tasting_entries';
   ```

   Expected: four rows, for SELECT, INSERT, UPDATE, and DELETE.

4. **Project Settings → API Keys.** Copy two values for later:
   - the **Project URL** (`https://<project>.supabase.co`);
   - the **publishable key** (`sb_publishable_…`).

   Never copy the **secret key** (`sb_secret_…`) into the app, `.env.local`, or Vercel: it bypasses every privacy rule.
5. **Authentication → URL Configuration.**
   - Site URL: `https://nrgasm.vercel.app` (change it later if Vercel gives the project another address).
   - Redirect URLs, one per line:
     - `http://localhost:5173/**`
     - `http://localhost:4173/**`
     - `https://*-<your-vercel-account-slug>.vercel.app/**` (preview deployments; the slug is in your Vercel URL)
6. **Who can sign in for now.** Until you set up your own email server (section 5), Supabase only sends sign-in emails to members of your Supabase team, at most 2 per hour. To let a friend in, invite them under **Organization → Team**.

## Local development

Create `.env.local` in the project root (it is git-ignored) from `.env.example`:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SKIN_BASE_URL=
```

Without `.env.local` the site still runs, as a guest who can only browse.

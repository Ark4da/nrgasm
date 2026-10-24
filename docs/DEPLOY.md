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

## 3. Can skins

The 68 can skins are not in the GitHub repository (`public/cans/` is git-ignored). Production loads them from a Supabase Storage bucket.

1. **Storage → New bucket.** Name it `cans` and switch **Public bucket** on.
2. Open the bucket and drag in every file from `public/cans/` on your computer.
3. Click any file → **Get URL**. Copy the part up to and including `/cans/`, for example
   `https://<project>.supabase.co/storage/v1/object/public/cans/`. This is `VITE_SKIN_BASE_URL`.

You decided to publish all 68 skins. Most are third-party photos (© Energy Drink Cans UK) and Monster artwork, and the rights holders may ask for them to be taken down. Deleting the files from the bucket takes the skins down at once, without a new deploy; the cans then fall back to the drawn labels.

## 4. Vercel

1. Sign up at [vercel.com](https://vercel.com) with your GitHub account.
2. **Add New → Project** → import the GitHub repository `nrgasm`. Vercel detects Vite: build command `npm run build`, output directory `dist`. Leave them.
3. **Environment Variables**, for Production and Preview:
   - `VITE_SUPABASE_URL` — the Project URL from section 2;
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — the publishable key from section 2;
   - `VITE_SKIN_BASE_URL` — the bucket URL from section 3.
4. **Deploy.** After a minute the site is live at an address like `https://nrgasm.vercel.app`.
5. If the address is not `nrgasm.vercel.app`, put the real one into Supabase: **Authentication → URL Configuration → Site URL**.
6. From now on every `git push` to `main` deploys a new version; other branches get preview addresses.

Check the live site:

- open `/can/assault` directly (not through the menu): the page opens, no 404;
- the 3D cans have their skins (they come from Storage);
- sign in with your email and open the link in the same browser;
- mark a can on your phone, reload on the computer: it is there;
- in a private window (signed out) the catalog and the "★ … ratings" lines still show.

## 5. Opening sign-up to everyone (later)

The built-in email sends only to your Supabase team, 2 emails per hour. To let anyone sign up:

1. Buy a domain (any registrar).
2. Sign up with an email provider that offers SMTP (for example Resend) and verify the domain there (it gives you DNS records to add at the registrar).
3. Supabase → **Authentication → SMTP Settings**: turn on custom SMTP and enter the provider's host, port, user, password, and a sender such as `no-reply@your-domain`.
4. Supabase → **Authentication → Rate Limits**: raise the email limit (it starts at 30 per hour with custom SMTP).
5. Vercel → **Settings → Domains**: add the domain. Then update Supabase's Site URL and redirect URLs to the new address.

No code changes are needed.

### Adding a skin later

1. Put the file in `public/cans/`, named after the can's id: `vanilla-shot.jpg` (`.png` and `.webp` work too). The id is the last part of the can page's address, `/can/vanilla-shot`.
2. With `npm run dev` running, `src/data/skinFiles.json` updates by itself and the can shows its skin. No change to `cans.ts` is needed.
3. Commit `src/data/skinFiles.json` and push, and upload the same file to the `cans` bucket. The live site then shows it too.

The file is an unrolled label: about 1.38 : 1 (1024 × 741 works well), the front in the middle, and the top ~7% is printed on the can's neck.

## Local development

Create `.env.local` in the project root (it is git-ignored) from `.env.example`:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SKIN_BASE_URL=
```

Without `.env.local` the site still runs, as a guest who can only browse.

# NRGASM — Progress

## Now

- **Milestone:** v1.2 accounts and deploy, built on branch `feat/accounts` (not merged yet).
- **Next step:** the owner follows `docs/DEPLOY.md` (Supabase project, migration, bucket, Vercel) and checks sign-in on the live site.

Legend for who makes each file:

- 🧑 the owner writes it;
- 🤖 Claude writes it, with an explanation;
- ⚙️ a tool generates it.

## Milestones

- [x] M0 — Setup
- [x] M1 — One card
- [x] M2 — Catalog
- [x] M3 — User data
- [x] M4 — Can page
- [x] M5 — Search and filters
- [x] M6 — 3D hero
- [x] M7 — Stats + export
- [x] M8 — Polish

## Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-10-22 | v1 includes catalog, card, can page, tried / rating / notes, search and filters, 3D hero, stats, export | Full portfolio-ready version, built in milestones |
| 2026-10-22 | User data lives in localStorage; no backend or accounts in v1 | Smallest moving parts; JSON export as a safety net |
| 2026-10-22 | Visual direction D, "Acid Lab", with the owner's palette | Chosen on the Design canvas over A, B, and C |
| 2026-10-22 | Added `#80808A` for hint text | `#52525B` fails text contrast (about 2.5:1) |
| 2026-10-22 | Stack: Vite + React + TypeScript, plain CSS + CSS Modules | Focus on TypeScript, not on framework magic |
| 2026-10-22 | Ratings are whole stars, 1–5 | Simple; half stars can come later |
| 2026-10-22 | Can artwork is made by the owner; code ships a neutral placeholder | Brand rule: no recreated logos or can designs |
| 2026-10-22 | Docs are written in English | The repository is a portfolio piece |
| 2026-10-22 | ESLint, not Oxlint | Standard tooling; includes the `react-hooks` rules |
| 2026-10-22 | `"strict": true` written explicitly in `tsconfig.app.json` | Do not rely on compiler defaults |
| 2026-10-23 | Local imports are written without file extensions (`'./App'`) | One consistent style |
| 2026-10-23 | The can placeholder's metal greys are tokens (`--can-*`, `--shadow-can`) | Keeps the "no raw hex in components" rule |
| 2026-10-23 | The placeholder shows the name on a dark label inside the flavor band | Readable on any flavor color |
| 2026-10-23 | The owner handed M1–M8 to Claude in one go ("make it polished"); teaching mode paused | The owner had finished experimenting and wanted the finished v1 |
| 2026-10-23 | Installed the approved stack: react-router 8, motion 14, three + @react-three/fiber 9 + drei 10, vitest 5 | All listed in the CLAUDE.md stack table |
| 2026-10-23 | User data lives in a small external store read with `useSyncExternalStore` (`src/hooks/`) | Saves on every change without effects; no provider needed |
| 2026-10-23 | Rating a can marks it tried; un-marking tried clears the rating; blank entries are removed | No "untried but rated 5" state; storage holds only real data |
| 2026-10-23 | Catalog filters live in the URL (`?q=&line=&tried=&rating=`) | Survive reload and the back button; shareable |
| 2026-10-23 | Unreadable saved data is moved to `nrgasm:v1:unreadable` before starting empty | A later save never destroys it |
| 2026-10-23 | Export files are wrapped: `{ app: "nrgasm", version: 1, exportedAt, entries }` | A random JSON file is not mistaken for a backup |
| 2026-10-23 | The 3D label is drawn on a 2D canvas with colors read from tokens; an owner image replaces it | Keeps the "no raw hex" rule and the brand rule |
| 2026-10-23 | Catalog cards show spinning 3D cans: one fixed canvas with drei `View`s, not one canvas per card | Browsers allow about 16 WebGL contexts; off-screen views are skipped |
| 2026-10-23 | 3D skins use a separate `Can.label` field (unrolled label, about 1.38 : 1, front in the middle); `image` stays the flat photo | An unrolled label would look wrong as a flat picture on the can page |
| 2026-10-23 | The owner supplied the Monster Energy label (`public/cans/monster-energy.jpg`, padded with black to 1.38 : 1) | The owner's call; the brand rule only forbids Claude drawing the artwork |
| 2026-10-23 | Skins may be stitched from the photos on energy-drink-cans.onrender.com (© Energy Drink Cans UK), local use only; `public/cans/` is git-ignored | The owner chose this over shooting their own cans; the photos are not ours to publish |
| 2026-10-23 | With a skin, the can's neck takes the label's top-edge color; only the lid and base stay metal | The owner asked for no bare silver on skinned cans |
| 2026-10-24 | Replaces the row above: the label's top strip (about 7%, the neck's slant out of the printed length) is printed on the neck up to the lid | Real cans carry their top band ("VITAMINS + TAURINE …") onto the shoulder; the owner asked for it |
| 2026-10-23 | The catalog covers every Monster sold in Europe or the US, current and discontinued, all lines (incl. coffee, Hydro, Muscle); one entry per flavor with `regions` | The owner's choice; avoids duplicate cards per region |
| 2026-10-23 | Facts come from cited sources only, with `factsRegion` and `source`: official UK/DE pages (EU, 500 ml: caffeine, sugar), official US pages (caffeine, calories; sugar only when 0), Energy Drink Mania for discontinued cans (volume, caffeine, calories) | Keeps "never invent facts" while filling the catalog; the owner can check every number |
| 2026-10-23 | "Discontinued" = not on the official US, UK, or German product lists as of October 2026 | A rule anyone can re-check |
| 2026-10-23 | Japan-only versions and the alcoholic Beast Unleashed line are left out | Outside EU/US, or not an energy drink |
| 2026-10-23 | Catalog cards mount the 3D can only near the viewport (`useNearViewport`) | 144 cards would otherwise hold 144 label textures in GPU memory |
| 2026-10-24 | "Want to try" is a stored field (`wantToTry`); old entries without it read as `false` | A shopping list must survive reload and export; no migration step needed |
| 2026-10-24 | The catalog shows cans on sale by default (`?show=all` / `discontinued` to widen) | 76 of 144 cans are discontinued; they buried the ones you can buy |
| 2026-10-24 | Note tags are `#words` inside the note text | They travel through export/import with no new storage field |
| 2026-10-24 | The glow behind a can uses its `flavorColor` (cards, can page, compare) | The owner asked for each can's own color |
| 2026-10-24 | PWA without a plugin: hand-written `manifest.webmanifest` and `public/sw.js`, registered in production builds only | No new dependency; in dev a cached copy would hide Vite's changes |
| 2026-10-24 | Bottle-shaped products (Hydro, Hydrosport, M3) get no photo skin | A bottle photo cannot be wrapped onto the can model |
| 2026-10-24 | The owner's label scans and print files (`E:ImagesMonster_label`) replace the photo skins where both exist | Flat artwork is sharper and shows the whole can; the replaced skins are kept outside the repo |
| 2026-10-24 | A print file narrower than 1.382 : 1 gets a fill at the back in the label's own background color, not a stretch | Stretching would squash the logo by up to 17% |
| 2026-10-24 | Taste descriptions live in `src/data/tastes.ts` (keyed by can id, merged into `cans`), each with its source links | Keeps `cans.ts` lines readable; every claim can be checked |
| 2026-10-24 | Accounts: Supabase (email-link sign-in, Postgres with RLS, Storage) with the static site on Vercel | Fewest moving parts; one new dependency; no own server |
| 2026-10-24 | Sign-up is meant for everyone; the first launch uses Supabase's built-in email (team members only, 2 per hour) | A custom domain and SMTP open it later without code changes |
| 2026-10-24 | Guests browse only; marking, rating, and notes need an account | The owner's choice |
| 2026-10-24 | Tastings are private; each can shows the average of everyone's ratings and their count | The owner's choice; totals live in `can_rating_stats`, kept by a trigger, never a view or definer function in `public` |
| 2026-10-24 | All 68 skins are published from a public Supabase Storage bucket, not from git | The owner's decision, accepting the takedown risk; the GitHub repository stays free of third-party photos |
| 2026-10-24 | Sign-in changed from an email link to email + password, with "Confirm email" off in Supabase; no password reset yet | Friends hit the built-in email limit (2 per hour, team only); without confirmation no email is sent. Cost: addresses are not verified |
| 2026-10-24 | A skin is found by file name: `public/cans/<can id>.jpg` (or .png, .webp); `src/data/skinFiles.json` lists the files, is rewritten by a Vite plugin, and is committed | The owner can add a skin by dropping a file; the explicit `label` lines in `cans.ts` were removed |
| 2026-10-24 | Descriptions are written in our own words from the official page, the Energy Drink Mania review, and the Monster Energy wiki; no source, no description | "Never invent product facts"; copying the reviews word for word is not ours to publish |
| 2026-10-25 | The `/ratings` chart ranks by a weighted average: every can starts with 3 votes at the overall average; ties go to more ratings, then the name. The plain average is what it shows | One 5-star vote must not top cans that many people rated highly |
| 2026-10-25 | On phones (≤520px) the header has two rows: wordmark and account on top, the four links below; its height is the `--header-height` token | Four links and the account icon need about 490px in one row |

## Session log

### 2026-10-22: Kick-off

- Brainstormed v1 scope, the visual direction, and the stack.
- Compared four visual directions on a Claude Design canvas and chose D.
- Wrote `CLAUDE.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`, and `docs/PROGRESS.md`.
- `README.md` is postponed until after the Vite scaffold, because Vite ships its own README.
- Installed Git and Node, set up the noreply commit email, created the public `nrgasm` repository on GitHub.
- Task 1: scaffolded Vite 8 + React 19 + TypeScript 6, made the first commit, and pushed to GitHub.

### 2026-10-23: M0 done

- Task 2: added design tokens, global styles, and fonts, and removed the template leftovers.
- Fixed: `main.tsx` had inlined the markup instead of rendering `<App />`.
- Fixed: edits had not been saved in VS Code. Auto Save is recommended.
- Task 3: wrote the `Can`, `Rating`, and `TastingEntry` types and a catalog with Mango Loco. Proved the types work by breaking them on purpose.
- Review fixes: a missing `export`, removing `tastingId`, extracting `Rating`, using a hex `flavorColor`.
- Task 4: built the `CanPlaceholder` component. The tricky parts were closing JSX tags and passing `--flavor` through `style`.
- Task 5: built the `StarRating` component. The owner got most of the way; Claude supplied the final version on request.

### 2026-10-23: v1 built (M1–M8)

- `src/lib/` with Vitest tests first: `validate`, `storage`, `entries`, `filters`, `stats`, `transfer`, `format` (39 tests).
- Catalog of 23 cans across Original, Juice, Ultra, Rehab, and Reserve. Names and lines only; every fact is still `undefined`.
- Components: `CanCard` (grid card with stretched link and Tried toggle), `CanVisual`, sized `CanPlaceholder`, interactive `StarRating` (native radios), `TriedToggle` (checkbox), `FilterBar`, `DataTransfer`, `Layout`, `ErrorBoundary`, shared `buttonClass`.
- Pages: home with a lazy-loaded 3D can ring (pauses on hover/focus, featured names turn their can to the front, static fallback without WebGL, no spin under reduced motion), catalog, can page with notes, stats with export/import, 404.
- Motion: one hero entrance, card entrance and layout animation on filtering, view transitions that glide the can from card to page, star pop, self-drawing tick. All respect `prefers-reduced-motion`.
- Verified in the built-in browser at 1440px and 375px: persistence after reload, filters, rating, notes, stats, 404, the unreadable-data notice, no horizontal scroll.
- `npm run build`, `npm run lint`, and `npm run test` all pass.

### 2026-10-23: 3D cans in the catalog

- The owner asked for every catalog can to be 3D and spinning, filling the card's can column.
- `three/CanMesh.tsx` holds the can model shared by the home ring and the catalog; `three/token.ts` reads tokens.
- `three/CatalogCans.tsx`: `CatalogCanvas` (one canvas over the window, below the sticky header) and `CanView` (a card's box the canvas draws into). Shared reflections from `RoomEnvironment`.
- Each can starts at its own angle; with reduced motion the cans stand still, label turned to the camera.
- Fallbacks: flat placeholder while the 3D code loads, without WebGL, or if the canvas throws (`ErrorBoundary` got an `onError` prop).
- Checked with headless Edge at 1440px and 390px; build, lint, and tests pass.
- Tried the dev server on the owner's phone with `npm run dev -- --host`.
- First skin: Monster Energy. Owner labels get a less metallic, glossier material and are shifted so their middle faces the camera; the home ring now turns each label outwards.
- Stitched skins for Pipeline Punch, Zero Ultra, and Ultra Violet from 5 photos each: per-row perspective unwarp, edge matching between neighbours, loop closed to 360°, narrow blends. The stitching script lives outside the repo (Claude's scratchpad).
- Only six catalog cans have photos all around on that site (also Pacific Punch, Monarch, Ultra Paradise); the other 17 have a front photo only.
- All 23 cans now have skins: 6 stitched all around, Monster Energy from the owner, 16 from one front photo. Front-only skins repeat the front on the back with the can's background color between, so the logo shows for most of a turn. Pacific Punch is a price-marked can (£1.39 on the back).
- Skins are 1024 px wide (about 2.5 MB for all 23) to keep GPU memory reasonable on phones.

### 2026-10-23: Full Monster catalog

- Catalog grew from 23 to 144 cans in 13 lines: Original, Reserve, Juice, Ultra, Rehab, Coffee, Dragon Tea, Hydro, Muscle, Maxx, Extra Strength, Mutant, Dub. New cans have no skins yet (drawn placeholder).
- Scraped the official US, UK, and German product pages and the Energy Drink Mania reviews; every number in `cans.ts` has a `source` URL.
- `Can` gained `regions`, `discontinued`, `flavor`, `caloriesKcal`, `factsRegion`, `source`. New `CanTags` component (EU / US / Discontinued) on cards and the can page; the can page shows calories, the flavor, "Figures for the 500 ml EU can · Source".
- Search also matches the flavor. `formatFactsBasis` added to `src/lib/format.ts` (tests first); 43 tests pass.
- Some cans exist only by name (Export, BFC, M3, Java Big Black, Hydro Mean Green, Hydrosport, three Muscle flavors): no facts found.

### 2026-10-24: UX pass (v1.1)

- Logic first, with tests: `wantToTry` in entries and validation, filters by availability and region, six sort orders, line averages and caffeine total in stats, note tags (`noteTags.ts`), "Surprise me" (`surprise.ts`), and `compare.ts` (including caffeine per 100 ml). 71 tests pass.
- Catalog: search, sort, and a Filters button stay sticky on phones; the filters open in a bottom sheet with a count. Stars on cards are clickable; cards show calories when sugar is unknown; "Want to try" sits next to "Tried".
- Can page: the 3D can turns by drag or arrow keys (state in a ref, so the frame loop reads it without re-renders), glow in the can's color, quick note tags, a link to Compare.
- New `/compare` page: two pickers, spinning cans, a facts table marking the larger value, a note when EU and US figures are mixed.
- Stats: want-to-try count (links to the filtered catalog), caffeine drunk, average rating per line.
- PWA: app icon (`public/icon.svg` + PNGs), manifest, a service worker (network-first pages, cache-first `/assets/`). Checked offline with `vite preview` and the server stopped. The Vite favicon was removed.
- Skins: 41 new ones from the collector site (front photo, alpha cut-out), Ultra Black, Ultra Blue, and Ultra Red stitched all around; 64 of 144 cans have skins. Hydro, Hydrosport, M3 are bottles; Full Throttle and Papillon had no matching can.
- Fixed on the way: a lint error from mutating state in the drag code, the Filters icon squeezed to a dot on 375 px, a sticky offset that pushed the phone can page's can down.
- Checked at 1440 px and 375–390 px; build, lint, and tests pass.

### 2026-10-24: Owner labels

- 13 labels from the owner's folder: 5 scans of flattened cans (rotated 90°, cropped, one full turn found by matching the image against itself, about 708 px) and 8 flat print files (front moved to the middle, the back filled in the edge's dominant color).
- Replaced: Rehab Tea + Lemonade, Rehab Green Tea, Assault, Zero Ultra, Khaotic, Ultra Rosá, Mango Loco, Ultra Blue, VR46 The Doctor. New: Java Irish Crème, Java Salted Caramel, Java Mean Bean, The Original Zero Sugar. 68 of 144 cans have skins.
- The neck now carries the label's top strip, so bands like "KHAOTIC" or "ROSSI VR|46" sit on the shoulder up to the lid. Fixed on the way: a material first built without a map ignored the texture (separate `key`s), and a cloned texture needs `needsUpdate`.
- Some sources are other regions' cans (Canadian 458/473 ml scans, a Ukrainian 355 ml Mango Loco); only the artwork is used, the catalog facts are unchanged.

### 2026-10-24: Taste descriptions

- 127 of 144 cans got a "What it tastes like" block on the can page, with links to its sources.
- Sources: 167 Energy Drink Mania reviews (the taste sections), 33 pages of the Monster Energy wiki, and the official texts collected on 2026-10-23. Three of the owner's links (official site, two Reddit threads) had expired.
- No description for 17 cans: 10 have no usable source (Export, BFC, M3, Java Big Black, Hydro Mean Green, both Hydrosport, three Muscle), and for 7 the official page only repeats the short flavor line (Zero Sugar, The Original Zero Sugar, Lando Norris, Full Throttle, Top Speed, VR46 Zero Sugar, Viking Berry).
- Where a review describes another country's can, the text says so (Reserve Watermelon: US can).
- `sourceName` in `src/lib/format.ts` turns a source URL into a readable name (tests first); 73 tests pass.

### 2026-10-24: Accounts and deploy (v1.2)

- Brainstormed with the owner, wrote the spec (`docs/superpowers/specs/2026-10-24-accounts-and-deploy-design.md`) and the plan (`docs/superpowers/plans/2026-10-24-accounts-and-deploy.md`); built it on branch `feat/accounts`.
- `supabase/migrations/20261024000000_tastings.sql`: `tasting_entries` with RLS, `can_rating_stats` with a trigger in a private schema. Checked on PGlite with stand-ins for Supabase's `auth` schema and roles (13 checks).
- New pure logic with tests first: `rows`, `merge`, `queue`, `ratings`, `skins`, `authUrl`, account cache keys in `storage`. 103 tests pass.
- `src/services/` (Supabase client, auth, entries, ratings); `authStore`; `userDataStore` now has a guest mode and a signed-in mode that writes in the background, one write at a time per can, and undoes a failed one.
- UI: `/sign-in`, account menu (an icon on phones), sign-in prompt for guests, "Move your tastings?" dialog, "★ 4.2 · 37 ratings" on cards and can pages; notes save 600 ms after the last key.
- `vercel.json`, `.env.example`, `docs/DEPLOY.md` (Supabase, skins bucket, Vercel, opening sign-up later).
- Not checked yet: anything that needs a live Supabase project (sign-in, saving, moving data, community ratings, skins from Storage). The owner runs those checks while following `docs/DEPLOY.md`.

### 2026-10-25: Community ratings page

- New `/ratings` page and a "Ratings" link in the header: every rated can, best first, with its rank, can, line, average (bar on wide screens), and number of ratings. Open to guests.
- `rankCans` in `src/lib/ratings.ts` (tests first); 126 tests pass.
- `ratingsStore` now has a status (`loading` / `ready` / `failed`), read by `useCommunityRatingsStatus`, so the page tells "loading", "did not load", and "no ratings yet" apart.
- The header got a second row on phones; `FilterBar`, `CanPage`, and `HomePage` now use `--header-height` instead of a fixed 64px.
- Checked in the built-in browser at 1024, 375, and 320 px with stand-in ratings (removed afterwards): no horizontal scroll, the catalog's sticky search sits right under the header. Build and lint pass.
- Not checked yet: the page with real ratings from Supabase (needs `.env.local`).

## Learning log

Concepts the owner has worked through, with where they appeared:

| Concept | Where | Notes |
|---|---|---|
| Node.js, npm, `package.json` scripts | Task 1 | `npm run dev` runs `vite`; `npm run build` runs `tsc -b && vite build` |
| Lock file | Task 1 | `package.json` holds version ranges; `package-lock.json` pins exact versions, so it is committed |
| The dev server does not type-check | Task 1 | Type errors show up only in the editor and in `npm run build` |
| `strict` mode | Task 1 | Includes `strictNullChecks` |
| Git basics | Task 1 | `add` → staging, `commit`, `remote` / `push -u`, `.gitignore` |
| CSS custom properties (tokens) | Task 2 | Defining a variable styles nothing; `var()` uses it |
| Cascade and order | Task 2 | For `var()` the import order barely matters; for the same property on the same selector, the later rule wins |
| Entry point vs root component | Task 2 | `main.tsx` mounts `<App />`; the UI lives in `App` and its children |
| Non-null assertion `!` | Task 2 | `getElementById` returns `HTMLElement \| null`; prefer real checks in our own code |
| Modules and `export` | Task 3 | A declaration is private to its file unless exported; an unused private one triggers `noUnusedLocals` |
| `type` vs `interface` | Task 3 | `interface` for object shapes, `type` for everything else |
| Optional fields `?` | Task 3 | `x?: number` means the field may be missing, so its type is `number \| undefined` |
| Literal union types | Task 3 | `type Rating = 1 \| 2 \| 3 \| 4 \| 5`; narrower than `number` |
| `import type` | Task 3 | Required by `verbatimModuleSyntax`; types are erased from the JavaScript output |
| `null` vs missing vs `0` | Task 3 | `rating: Rating \| null` is always present; `null` means "not rated"; `0` would corrupt averages |
| Components and typed props | Task 4 | A function that returns JSX; `({ a, b }: Props)` destructures its props |
| JSX nesting | Task 4 | Every tag closes, inner tags first; an empty element self-closes with `<div />`; format with `Shift+Alt+F` |
| CSS Modules | Task 4 | `styles.x` must match `.x` in the CSS; a wrong name silently becomes `undefined` |
| Path pitfalls | Task 4 | Match the file name's case exactly (Linux is case-sensitive); watch out for Cyrillic look-alike letters |
| CSS variables from TypeScript | Task 4 | `{ '--flavor': value } as CSSProperties` on `style`; CSS decides where the value is used |
| Imports between files | Task 4 | A named export needs a named import `{ X }`; paths are relative to the importing file |
| Lists in JSX | Task 5 | `Array.from({ length: 5 }, (_, i) => …)` with `.map`-style rendering; every item needs a `key` |
| `??` vs `\|\|` | Task 5 | `??` replaces only `null` or `undefined`; `\|\|` replaces any falsy value (`0`, `''`) |
| Narrowing with `!== null` | Task 5 | An explicit check says exactly "the rating exists" |
| Two classes at once | Task 5 | `` `${styles.a} ${cond ? styles.b : styles.c}` `` |
| Compute before `return` | Task 5 | Keep logic in variables above `return`; keep the JSX clean |
| SVG styling through classes | Task 5 | A `fill` attribute bypasses the CSS; classes keep colors in tokens |

## Open questions

- The catalog facts come from cited web sources (see each can's `source`); the owner should spot-check them. US sugar is unknown for most US-only cans.
- `CLAUDE.md` still describes teaching mode. Keep it for future work, or rewrite it now that v1 exists?
- Can images: format and size, to be agreed before M2.
- The service worker needs a secure origin. On the phone via `http://192.168.x.x` the app installs only as a shortcut and does not work offline. Options: `@vitejs/plugin-basic-ssl` (a new dependency, to discuss) or a deploy.
- `public/icons.svg` is a Vite template leftover nobody uses.
- GitHub repository: public `nrgasm`, created empty and pushed in Task 1, Step 7 of the M0–M1 plan.

# NRGASM — instructions for Claude

NRGASM is an interactive catalog of Monster Energy cans. Visitors browse the collection, mark the cans they have tried, rate them from 1 to 5 stars, and write tasting notes. The UI is in English and the app runs on localhost only for now.

It is both a **portfolio piece** and a **learning project**. The owner knows JavaScript, a little React, and is learning TypeScript by building this.

Read these before working:

- `docs/PRODUCT.md`: what we are building, v1 scope, data model, milestones.
- `docs/DESIGN.md`: the "Acid Lab" visual system (tokens, type, motion, components).
- `docs/PROGRESS.md`: where we are right now, decisions so far, open questions.

## Working mode (most important)

1. **Teaching mode.** Every step follows the same loop: explain → assign → review → verify.
   - Explain: what we are doing, why, and which TypeScript or React concept it introduces. Keep it short.
   - Assign: a concrete task for the owner, with hints rather than the answer.
   - Review: when the owner says "done", read their file and comment on it.
   - Verify: the owner runs the app, and Claude checks localhost in the built-in browser against the design.
2. **Never write owner files.** Files marked 🧑 in the plan or in `docs/PROGRESS.md` belong to the owner. Help with questions, hints, and small examples of a *different* thing. Give the full solution only when the owner explicitly asks for it.
3. **One step at a time.** Work only on the current milestone. Never generate the whole site, and never scaffold ahead. Do not create empty folders for future milestones.
4. **Language.**
   - Talk to the owner in **Russian**.
   - Write code, identifiers, comments, UI copy, and commit messages in **English**.
5. **The owner runs every command.** Claude has no shell on the owner's machine (Windows, PowerShell). For each command (`npm`, `git`, the dev server), give the exact text and explain what it does.
6. **Keep the log.** At the end of each step, update `docs/PROGRESS.md`: what was done, what was learned, and what comes next.
7. **Check library docs first.** Before relying on a library API, check the current documentation with Context7. Do not rely on memory.
8. **Discuss dependencies.** Add no new dependency without discussing it with the owner first.

## Stack

| Concern | Choice | From milestone |
|---|---|---|
| Build / dev server | Vite | M0 |
| UI | React + TypeScript (`strict: true`, no `any`) | M0 |
| Styling | Plain CSS + CSS Modules + CSS custom properties | M0 |
| Fonts | Google Fonts `<link>` in `index.html` (Archivo, JetBrains Mono) | M0 |
| Routing | React Router | M4 |
| Tests | Vitest, for `src/lib/` only | M3 |
| Animation | Motion | M2+ |
| 3D | React Three Fiber + drei | M6 |
| Accounts, database, skin hosting | Supabase (`@supabase/supabase-js`): email-link sign-in, Postgres with RLS, Storage | v1.2 |
| Hosting | Vercel (static build, `vercel.json` rewrites every path to `index.html`) | v1.2 |

## Project structure

```
src/
├─ main.tsx
├─ App.tsx
├─ styles/       tokens.css (design tokens), global.css (reset, base)
├─ types/        shared TypeScript types (Can, TastingEntry, …)
├─ data/         cans.ts: the catalog, typed as Can[]
├─ components/   one folder per component: CanCard/CanCard.tsx + CanCard.module.css
├─ lib/          (M3+) pure functions: storage, filters, stats; no React imports
├─ services/     thin Supabase calls (auth, entries, ratings); no React imports
├─ hooks/        stores outside React (auth, user data, ratings) and the hooks that read them
├─ pages/        (M4+) route screens
└─ three/        (M6+) 3D scene, loaded only on the home page
```

Rules:

- Utility folders use lowercase plural names.
- Each component lives in a PascalCase folder with its CSS module next to it.
- Create a folder only when the milestone that needs it starts.

## Code rules

- **Design tokens only.** Colors, fonts, radii, and spacing come from CSS variables in `src/styles/tokens.css`. Never put a raw hex value in a component.
- **Two data sources, never mixed.**
  - The catalog is static and lives in `src/data/cans.ts`.
  - User data lives in Supabase (`tasting_entries`, one row per user and can, private by Row Level Security), and is cached per account in localStorage under `nrgasm:v1:user:<userId>`. Data saved before accounts (`nrgasm:v1`) is offered for moving at the first sign-in.
  - Everyone's ratings are only ever read as totals from `can_rating_stats`.
  - Never copy catalog fields into user data.
- **Pure logic lives in `src/lib/`.** Write the Vitest test first, then the code.
- **Components** are function components with a typed props interface named `<Component>Props`.
- **Accessibility.**
  - Use real `<button>`, `<a>`, `<label>` elements.
  - Text contrast must be at least 4.5:1.
  - Interactive targets must be at least 44px.
  - Respect `prefers-reduced-motion`.
- **Brand rule.** Never draw or recreate the Monster logo, the claw mark, or any can artwork. A can's visual is either the owner's own image in `public/cans/` or the neutral placeholder described in `docs/DESIGN.md`.
- **Catalog facts.** Never invent caffeine, sugar, or other product facts. Unknown fields stay `undefined` until the owner verifies them.

Deploy and setup steps for the owner: `docs/DEPLOY.md`. The schema: `supabase/migrations/`.

## Commands (run by the owner)

```
npm run dev       # start the dev server on localhost
npm run build     # type-check + production build (fails on type errors)
npm run lint      # ESLint
npm run test      # Vitest (from M3)
```

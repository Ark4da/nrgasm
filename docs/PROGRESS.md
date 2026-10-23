# NRGASM — Progress

## Now

- **Milestone:** M1 — One card.
- **Next step:** Task 4 of `docs/superpowers/plans/2026-10-22-m0-m1-one-card.md`, the `CanPlaceholder` component.

Legend for who makes each file:

- 🧑 the owner writes it;
- 🤖 Claude writes it, with an explanation;
- ⚙️ a tool generates it.

## Milestones

- [x] M0 — Setup
- [ ] M1 — One card ← first result
- [ ] M2 — Catalog
- [ ] M3 — User data
- [ ] M4 — Can page
- [ ] M5 — Search and filters
- [ ] M6 — 3D hero
- [ ] M7 — Stats + export
- [ ] M8 — Polish

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

## Open questions

- Which flavors go into the catalog first? Who verifies the facts, and from which sources?
- Can images: format and size, to be agreed before M2.
- GitHub repository: public `nrgasm`, created empty and pushed in Task 1, Step 7 of the M0–M1 plan.

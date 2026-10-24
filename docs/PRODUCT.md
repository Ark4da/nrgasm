# NRGASM — Product

## Vision

NRGASM is a collector's catalog for Monster Energy cans. Its long-term goal is to cover every flavor and edition.

For each can, a visitor can:

- browse the collection;
- mark the can as tried;
- give it a 1–5 star rating;
- keep personal tasting notes.

The homepage opens with rotating 3D cans, and the catalog stays fast and easy to use.

The project has two purposes:

1. **Portfolio.** It shows outstanding UI/UX: distinctive typography, smooth motion, intuitive navigation, a responsive layout.
2. **Learning.** It is how the owner learns TypeScript. The owner builds it step by step and writes most of the code.

## Audience

- **The owner, as a user.** They keep their own tasting collection.
- **Portfolio reviewers.** They judge the design quality and the code quality.

## Success criteria for v1

- Runs locally with `npm run dev`. Deployment is not required.
- Every v1 feature below works and survives a page reload.
- The visual system matches `docs/DESIGN.md` on desktop and phone widths.
- `npm run build` passes with TypeScript `strict` and no `any`.
- `src/lib/` is covered by Vitest tests.
- The owner can explain every part of the code.

## v1 scope

### In scope

| Feature | Notes |
|---|---|
| Catalog grid | All cans as cards, responsive |
| Can card | Can visual, name, line, key facts, tried mark, rating |
| Can page `/can/:id` | Full details, rating, tasting notes |
| Tried / rating / notes | Stored in the browser (localStorage) |
| Search and filters | By name, line, tried / not tried, rating |
| 3D hero on `/` | Rotating cans (React Three Fiber) with a static fallback |
| Stats `/stats` | "Tried 12 of 48", top rated, per-line breakdown |
| Export / import | Download user data as JSON, restore from JSON |

### Out of scope for v1

- Accounts, a backend, and cloud sync.
- Social features: sharing, other people's reviews, comments.
- Deployment to a public host. This is a later milestone.
- An admin UI for the catalog. The catalog is edited in code.
- Half-star ratings, prices, and where-to-buy information.
- Other UI languages. The UI is English only.

## Data model

```ts
type CanId = string; // URL slug, e.g. "mango-loco"

type Region = 'EU' | 'US';

interface Can {
  id: CanId;
  name: string;
  line: string;          // e.g. "Juice", "Ultra"
  flavorColor: string;   // hex, used only for the can placeholder
  regions: Region[];     // where it is (or was) sold
  discontinued?: boolean;
  flavor?: string;       // flavor profile from the source
  caffeineMg?: number;   // only from a cited source, else undefined
  sugarG?: number;
  caloriesKcal?: number;
  volumeMl?: number;
  factsRegion?: Region;  // which region's can the numbers describe
  source?: string;       // URL the numbers come from
  image?: string;        // path under public/cans/; missing → placeholder
  label?: string;        // unrolled 3D skin under public/cans/
}

interface TastingEntry {
  tried: boolean;
  wantToTry: boolean;    // shopping list; cleared once tried (missing in old data → false)
  rating: 1 | 2 | 3 | 4 | 5 | null;
  note: string;
  updatedAt: string;     // ISO 8601
}

type UserData = Record<CanId, TastingEntry>;
```

- **Catalog.** Lives in `src/data/cans.ts`, is typed as `Can[]`, and is versioned in git.
- **User data.** Stored in localStorage under the key `nrgasm:v1`, keyed by `CanId`. It never duplicates catalog fields.
- **Catalog facts.** Caffeine, sugar, and volume are entered only after the owner has verified them. Unknown values stay empty, and the UI shows "—".

## Routes

| Route | Screen | Milestone |
|---|---|---|
| `/` | 3D hero + entry to the catalog | M6 (until then: the catalog) |
| `/catalog` | Grid + search and filters | M2, M5 |
| `/can/:id` | Can page | M4 |
| `/compare?a=&b=` | Two cans side by side | v1.1 |
| `/stats` | Stats + export / import | M7 |

## Milestones

| # | Milestone | Done when |
|---|---|---|
| M0 | Setup | Vite + React + TS project runs; tokens and fonts applied; git initialised |
| **M1** | **One card** | A static Mango Loco card on localhost matches design D, including the hover glow |
| M2 | Catalog | A responsive grid of several cards |
| M3 | User data | Tried / rating / note work and persist; storage logic tested |
| M4 | Can page | `/can/:id` works; navigation between catalog and page; "not found" state |
| M5 | Search and filters | Filters combine and are tested; empty-result state |
| M6 | 3D hero | Rotating placeholder can models with a texture slot; WebGL fallback; reduced motion |
| M7 | Stats + export | Stats screen; JSON export / import with validation |
| M8 | Polish | Motion pass, accessibility pass, responsive pass |

Only the current milestone gets a detailed implementation plan.

## Edge cases

| Situation | Behaviour |
|---|---|
| localStorage holds invalid data or an unknown version | Start with an empty collection, show a notice, never crash |
| `/can/<unknown-id>` | "Can not found" page with a link back to the catalog |
| A can has no image | Neutral placeholder in the can's `flavorColor` |
| WebGL unavailable | Static can visuals instead of the 3D scene |
| `prefers-reduced-motion: reduce` | No rotation; transitions shortened or removed |
| An imported JSON file is invalid | Reject it with a clear message; existing data untouched |

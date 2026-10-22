# NRGASM — Progress

## Now

- **Milestone:** M0 — Setup, not started.
- **Next step:** review the docs, then write the implementation plan for M0–M1.

Legend for who makes each file:

- 🧑 the owner writes it;
- 🤖 Claude writes it, with an explanation;
- ⚙️ a tool generates it.

## Milestones

- [ ] M0 — Setup
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

## Session log

### 2026-10-22: Kick-off

- Brainstormed v1 scope, the visual direction, and the stack.
- Compared four visual directions on a Claude Design canvas and chose D.
- Wrote `CLAUDE.md`, `docs/PRODUCT.md`, `docs/DESIGN.md`, and `docs/PROGRESS.md`.
- `README.md` is postponed until after the Vite scaffold, because Vite ships its own README.

## Learning log

Concepts the owner has worked through, with where they appeared:

| Concept | Where | Notes |
|---|---|---|
| — | — | — |

## Open questions

- Which flavors go into the catalog first? Who verifies the facts, and from which sources?
- Can images: format and size, to be agreed before M2.
- GitHub repository and remote: when?

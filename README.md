# NRGASM

An interactive catalog of Monster Energy cans. You can browse the collection, mark the cans you've tried, rate them from 1 to 5 stars, and keep your own tasting notes.

> Work in progress. This is a learning and portfolio project, built step by step while learning TypeScript.
>
> Unofficial fan project, not affiliated with or endorsed by Monster Energy.

## Features (v1 goal)

- A catalog of cans with search and filters
- A page for each can, with your rating and tasting notes
- A tried / not tried collection, saved in your browser
- A home page with rotating 3D cans
- Stats, plus JSON export and import of your data

See [`docs/PROGRESS.md`](docs/PROGRESS.md) for what is done so far.

## Tech stack

- [Vite](https://vite.dev) 8
- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org) 6, with strict mode
- Plain CSS with CSS Modules and design tokens in CSS custom properties
- Planned:
  - React Router
  - Vitest
  - Motion
  - React Three Fiber

## Getting started

You need [Node.js](https://nodejs.org) 20.19+ or 22.12+.

```bash
npm install
npm run dev       # dev server on http://localhost:5173
npm run build     # type-check and build into dist/
npm run lint      # ESLint
```

## Docs

- [`docs/PRODUCT.md`](docs/PRODUCT.md): vision, v1 scope, data model, milestones
- [`docs/DESIGN.md`](docs/DESIGN.md): the "Acid Lab" design system
- [`docs/PROGRESS.md`](docs/PROGRESS.md): progress, decisions, learning log

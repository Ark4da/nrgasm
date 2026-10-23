# NRGASM — Design: "Acid Lab"

Approved direction: **D — Acid Lab**, chosen on 2026-10-22 from four options.

Reference mockups are on the Claude Design canvas *NRGASM — Visual Directions*: https://claude.ai/artifact/WZs7iE5CXot1JYPKkJNwaZ (private to the owner).

## Concept

- **The base: matte charcoal and brushed aluminium, about 90% of the screen.** It is cold and calm.
- **The accent: acid green, used like a laser, about 5–10% of the screen.** It appears only where something is active or important.
- **The data:** the can and its tasting data are the exhibit, and the interface stays out of their way.

## Color tokens

All colors live in `src/styles/tokens.css`. Components use only these variables.

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#090A0C` | Page background |
| `--color-surface` | `#121316` | Cards; separates from the background without borders |
| `--color-elevated` | `#1A1C20` | Inputs, tags, hover states |
| `--color-border` | `#262930` | Thin dividers and outlines |
| `--color-border-glass` | `rgba(255, 255, 255, 0.08)` | Card outline, "glass" edges |
| `--color-text` | `#F4F4F6` | Headings, can names |
| `--color-text-secondary` | `#9CA3AF` | Descriptions, tasting notes, labels |
| `--color-text-hint` | `#80808A` | Hints, placeholders, small captions |
| `--color-text-disabled` | `#52525B` | Disabled controls and decorative lines only, **never readable text** |
| `--color-accent` | `#95D600` | Primary buttons, tried mark, rating stars, focus ring |
| `--color-accent-glow` | `rgba(149, 214, 0, 0.15)` | Glow behind the can or card, accent shadows |
| `--color-on-accent` | `#090A0C` | Text on accent-filled buttons |

### Contrast

The rule is at least 4.5:1 for text.

- `--color-text-hint` (`#80808A`) passes on both the background and the surface. It was added to the palette for exactly this reason.
- `--color-text-disabled` (`#52525B`) is only about 2.5:1, so it is never used for text a user needs to read.

### Accent rules

- **Where green appears:** active buttons, the "Tried" icon, filled rating stars, focus rings, and the glow.
- **Size:** never on large background areas.
- **Text:** never for body text.
- **Flavor colors:** a can's `flavorColor` appears **only on the can placeholder itself**, never in the UI chrome.

## Typography

Fonts are loaded from Google Fonts in `index.html`:

- `Archivo` with the axes `wdth 62..125` and `wght 100..900`;
- `JetBrains Mono` with weights `400` and `500`.

| Role | Font | Settings |
|---|---|---|
| Display (page titles, can names) | Archivo | weight 800, `font-stretch: 62%`, UPPERCASE, line-height 0.95 |
| Body | Archivo | weight 400–600, normal width, line-height 1.5 |
| Data and labels (numbers, "No. 014", tags) | JetBrains Mono | 400–500, letter-spacing 0.1em for small caps labels |

Type scale (px):

| Element | Size |
|---|---|
| Hero | 76 |
| Can name on page | 60 |
| Can name on card | 44 |
| Section heading | 28 |
| Body | 18 |
| UI | 15 |
| Labels | 12–13 |

Tokens: `--font-display`, `--font-body`, `--font-mono`.

## Shape and spacing

- **Radii:** `--radius-control: 10px` for buttons, inputs, and tags; `--radius-card: 24px` for cards.
- **Borders:** always 1px.
- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64. The tokens are `--space-1` to `--space-8`.
- **Touch targets:** at least 44px high.

## Motion

- **Durations:**
  - `--duration-fast: 150ms` for hover and press;
  - `--duration-base: 250ms` for UI transitions;
  - `--duration-slow: 400ms` for page and card entrances.
- **Easing:** `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`.
- **Card hover:** the surface lifts to `--color-elevated` and the accent glow fades in behind the can.
- **3D hero:** a slow, continuous rotation that pauses on hover or focus.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, there is no rotation, and transitions become instant or fade-only.

## Can visual

- **Brand rule.** The Monster logo, the claw mark, and real can artwork are never drawn or recreated in code. The owner supplies their own images.
- **Image slot.** `Can.image` points to a file in `public/cans/`. When it is present, it replaces the placeholder.
- **Placeholder.** It is a CSS can built from three parts:
  - a top rim in a dark metallic grey;
  - an aluminium body with a horizontal metallic gradient;
  - a band in the can's `flavorColor` holding the can name in JetBrains Mono, on a small dark label so the name stays readable on any flavor color.
- **Metal tokens.** The placeholder's greys and shadow are tokens too: `--can-rim`, `--can-metal-dark`, `--can-metal-mid`, `--can-metal-soft`, `--can-metal-light`, `--shadow-can`.
- **3D (M6).** A cylinder model whose label texture is either the owner's image or a generated placeholder.

## Component: CanCard (M1)

Anatomy, following mockup D:

1. **Container:** `--color-surface`, `--color-border-glass` outline, `--radius-card`, two columns on desktop that stack on phone.
2. **Visual column:** the can visual on a soft radial `--color-accent-glow`.
3. **Meta row:** a line tag (mono, on `--color-elevated`) and, when tried, a green "Tried" icon and label.
4. **Name:** display style.
5. **Rating:** five stars; filled stars in `--color-accent`, empty stars outlined in `--color-text-disabled`, plus a "4 / 5" label in mono.
6. **Facts:** caffeine and sugar rows in mono, with "—" when unknown, separated by `--color-border` lines.
7. **Note preview:** secondary text.

In M1 the card is static: it has no state and no buttons yet. Interactivity arrives in M3.

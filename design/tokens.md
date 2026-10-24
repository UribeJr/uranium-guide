# Pokémon Uranium Field Binder: design tokens (MVP design pass)
This is a sibling to the Unbound Trainer's Journal (https://unbound-guide.vercel.app). It keeps the journal's paper-on-binder page-turn spreads: lined paper, a red margin rule, a handwritten Caveat note layer, a folio and a page curl. The kraft and wood are swapped for containment vinyl, hazard tape and a reactor glow. The source of truth is `src/base.css` (`:root`). Mocks are in `src/*.html`; run `python3 src/render.py` to render them (Playwright chromium, with /usr/bin/google-chrome as the fallback).

## Palette
| Token | Hex | Role |
|---|---|---|
| --vinyl | #232a26 | binder cover, dark surfaces |
| --vinyl-2 | #2e3832 | vinyl highlight, panels |
| --hazard | #f2c230 | hazard stripes, warnings, tabs |
| --hazard-ink | #151815 | stripe black, banner/header bg |
| --glow | #8be24a | radioactive accent, readouts, glow |
| --glow-deep | #2f6b1a | green text on paper, Nuclear type chip |
| --screen | #0c140e | PokéPod / readout screens |
| --paper | #ece4cf | binder pages, light text on dark |
| --ink | #1f2421 | body text on paper |
| --muted | #525e56 | secondary text on paper |
| --alert | #a8291f | stamps, SAMPLE tags, margin rule |
| --readout | #b7c4b9 | secondary mono text on screens |

### WCAG-checked text pairs (computed contrast)
| Text / bg | Ratio | Use |
|---|---|---|
| ink #1f2421 / paper #ece4cf | 12.4 : 1 AAA | body |
| alert #a8291f / paper | 5.5 : 1 AA | stamps, warnings |
| glow-deep #2f6b1a / paper | 5.1 : 1 AA | headings and labels on paper |
| muted #525e56 / paper | ≥4.5 : 1 AA (#5e6b62 failed at 4.41 and was darkened) | captions |
| glow #8be24a / screen #0c140e | 11.7 : 1 AAA | readouts |
| readout #b7c4b9 / screen | 10.4 : 1 AAA | secondary readouts |
| glow / vinyl #232a26 | 9.1 : 1 AAA | accents on cover |
| paper / vinyl | 11.6 : 1 AAA | light text on cover |
| hazard #f2c230 / hazard-ink #151815 | 10.7 : 1 AAA | banner titles |
| hazard-ink / glow | 11.1 : 1 AAA | text on green buttons |
| #fff / alert | 7.3 : 1 AAA | SAMPLE tag |
Never set body text in --glow on --paper (it fails).

## Type (free Google Fonts)
- Display (stencil): **Saira Stencil One**, https://fonts.google.com/specimen/Saira+Stencil+One. Covers, page titles, stamps. 34–72px.
- Mono (readouts): **Share Tech Mono**, https://fonts.google.com/specimen/Share+Tech+Mono. PokéPod, banner, labels, folios. 11–15px, letter-spacing .1–.2em for caps.
- Body: **IBM Plex Sans** 400/600/700, https://fonts.google.com/specimen/IBM+Plex+Sans. 15–18px, 1.5 line-height (32px on ruled paper).
- Hand (shared with Unbound): **Caveat** 600, https://fonts.google.com/specimen/Caveat. Margin notes only.
- Import: `https://fonts.googleapis.com/css2?family=Saira+Stencil+One&family=Share+Tech+Mono&family=IBM+Plex+Sans:wght@400;600;700&family=Caveat:wght@600&display=swap` (the mocks use display=block so the renders are deterministic).

## Textures
- **Binder vinyl:** `--noise` (SVG feTurbulence, .35 alpha) + a soft radial highlight + a 160° linear gradient from vinyl-2 to vinyl. The spine is a darker 90° gradient, and the rings are metal gradients.
- **Paper:** --paper + noise (multiply) + ruled lines every 32px in glow-deep at 16% + a red margin rule at 60px + an inner shadow toward the gutter. This is the same structure as Unbound's pages.
- **Scuffs:** faint elliptical radial gradients (white 6–7% / black 25%) over the vinyl.
- **Stamps:** `.stamp` = stencil caps, 3px currentColor border, −6° to 8° rotation, opacity .82, noise mask for broken ink. Copy: "CONTAINMENT LEVEL 4", "ZETA", "ZETA · CLEARED". Colors: alert on paper, hazard on vinyl.
- **Symbol:** a generic radiation trefoil (`src/trefoil.svg`). There are no agency or Nintendo/Game Freak/Pokémon logos anywhere.

## Hazard stripes
```css
--hazard-stripes: repeating-linear-gradient(-45deg, #f2c230 0 18px, #151815 18px 36px);
.hazard { background: var(--hazard-stripes); }
/* as a border: */ border-bottom: 8px solid; border-image: var(--hazard-stripes) 8;
```
Use them for bands, tape and the end caps of the patch banner. Keep text off the stripes.

## Glow
```css
--glow-sm: 0 0 4px rgba(139,226,74,.9), 0 0 12px rgba(139,226,74,.45);
--glow-lg: 0 0 6px rgba(139,226,74,.9), 0 0 24px rgba(139,226,74,.5), 0 0 60px rgba(139,226,74,.25);
.glow-text { color: var(--glow); text-shadow: var(--glow-sm); }
@media (prefers-reduced-motion: no-preference) { .pulse { animation: pulse 2.4s ease-in-out infinite; } }
@keyframes pulse { 50% { filter: brightness(1.25); } }
```
Reduced motion: the pulse is opt-in through `no-preference`, so users who ask for reduced motion get a static glow. Disable the PokéPod locator `<animate>` and the page-turn rotation too (use a crossfade or an instant swap). Glow is decoration only: the contrast above holds without it.

## Pixel art (Professor Bamb'o, assets/bambo.png, 81×155)
`image-rendering: pixelated;` at integer scales only (1× = 81×155 in the button crop, 2× = 162×310 in the panel). Set the width and height explicitly; never use %, auto-fit or fractional scales.

## Spacing and radii
Spacing is on a 4px base: s1 4 · s2 8 · s3 12 · s4 16 · s5 24 · s6 32 · s7 48. Radii: sm 4 (chips, tags) · md 10 (cards, screens) · lg 18 (binder, chat panel). The PokéPod shell uses 44/60. Hard offset shadow for paper cards: `4px 4px 0 var(--ink)`.

## Components (mocks)
01 flat cover · 02 open spread + patch banner (1.4.0 10/10/26, 1.4.0b, 1.4.0c, 1.4.1) with side tabs · 03 PokéPod (WILD/ITEMS/TRAINERS/BADGES) · 04 chat button (idle/hover/open) + Ask the Professor panel. The footer "Unofficial fan project" appears on every screen.

---
type: design-note
folder: 06 Experience Layer
status: complete
order: 25
---

# Visual & Audio Style

> **Purpose:** Art direction and sound — the aesthetic that communicates the warm-satire tone, within a browser performance budget. **Proposed style guide (user delegated), direction = Vintage Campaign-Poster Americana.**
>
> **Depends on:** [[Tone & Theme]], [[UX & UI Layout]]
> **Feeds into:** [[Game Feel & Juice]], [[Technical Architecture Requirements]]

## Visual Direction — Vintage Campaign-Poster Americana
WPA/retro-poster, screen-print look: **bold, warm, nostalgic, optimistic with a knowing wink** — the visual embodiment of [[Tone & Theme|warm satire]].

## Palette
- **Patriotic frame (UI chrome, celebration):** campaign red `#C8102E`, navy `#0A3161`, cream paper `#F4ECD8`, aged-newsprint tan `#D9C9A3`.
- ✅ **Left-right axis uses a SEPARATE, non-partisan palette — gold ↔ teal** — **never the loaded red=right / blue=left mapping** — so the game never codes a side as good/bad (Pillar 5b even-handedness).
- **Bloc colors:** distinct, color-blind-safe hues + patterns/labels (never red/green alone).

## Typography
- **Headlines/offices:** bold **condensed slab/gothic** (campaign-poster feel — e.g., Anton/Knockout-style).
- **UI & numbers:** clean, legible humanist sans.
- **Flavor/news text:** typewriter or old-style serif for "press" voice.

## Iconography & Texture
- Pin-back buttons, rosettes, bunting, ballot boxes, megaphones, yard signs, stars, ballot stamps; light/satirical eagle & star-spangled motifs.
- **Halftone dots, screen-print texture, subtle paper grain, slight offset misregistration** — applied sparingly (performance).

## Escalation by Era ([[Eras & Phases]])
- **Local:** humble flyers, hand-lettered yard signs, church-basement vibe.
- **Federal:** grand convention stage, balloon drops, confetti, network-news lower-thirds.
- **Galactic (post-MVP tease):** atomic-age retro-futurist Americana-in-space.

## Audio Identity
- **Music:** folksy/brass **marching-band Americana**, jaunty and light; instrumentation **escalates by era** (solo banjo/acoustic locally → full band + crowd at Federal).
- **SFX:** satisfying ballot-stamp **"pop"** per tap; **crowd cheer/applause** swells on wins; **cha-ching**/register for cash; **gavel** & **brass sting** for abilities; **crit = airhorn/bigger cheer**; **news-sting + typewriter** (and a wry record-scratch) for scandals/events.
- **VO (minimal, budget-aware):** an announcer for promotions ("Ladies and gentlemen, your next Mayor…"); crowd chants.

## Performance Budget (browser, mid-range phone)
- **Vector/SVG + CSS** art, **sprite atlases**, limited bitmap textures; target **60fps**; avoid heavy shaders/particle storms (juice via cheap CSS/canvas effects — [[Game Feel & Juice]]). → [[Technical Architecture Requirements]]

## Accessibility
- Color-blind-safe bloc coding (hue **+ pattern + label**), high contrast, **reduced-motion** toggle, scalable text, large tap targets.

## Resolved Decisions & Tuning Targets
- ✅ **Even-handed axis palette: gold ↔ teal** confirmed for left-right (non-partisan; never red/blue).
- ✅ **Textures: procedural/CSS-first** (halftone, grain) to keep asset scope and bundle small; hand-made art reserved for key set-pieces.
- ✅ **Licensing:** use **open-licensed** fonts/audio only.
- 🎯 **Music variety:** enough loop length/layers to avoid fatigue over long sessions (Phase 6 audio task).

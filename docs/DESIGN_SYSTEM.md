# Design System

This document defines the visual language, design direction, typography, colors, and UI component standards for CoastPulse.

## 1. Design Direction

- **Style**: High-density scientific mission-control / Earth-observation workspace.
- **Mood**: Precise, analytical, authoritative, nocturnal, high-contrast, modern.
- **Design Principles**:
  - *Data Density over Blank Space*: Maximize analytical visibility while keeping typography crisp and legible.
  - *Nocturnal Dark Field*: Dark backgrounds reduce eye strain during long analytical sessions and allow satellite rasters to pop.
  - *Purposeful Chromatic Accents*: Color is never purely decorative; cyan denotes scientific data and selected vectors, saffron/orange indicates active user controls and alerts, emerald green represents verified status.
  - *Strict Visual Hierarchy*: Clear separation between global navigation, contextual drawer controls, the primary map viewport, and scientific status indicators.

## 2. Brand

- **Brand Name**: CoastPulse
- **Logo**: Dual-orbit circular telemetry mark with cyan (`#00e5ff`) and saffron (`#ff8c2b`) arcs surrounding a center pulse node.
- **Brand Voice**: Objective, scientific, defensible, grounded in genuine physics and physical remote sensing.

## 3. Color Palette

### Core Canvas & Surfaces
- **Background (Deep Space)**: `#02050b`
- **Surface Level 1 (Panels & Headers)**: `#040812`
- **Surface Level 2 (Drawers & Cards)**: `#070e1c`
- **Surface Level 3 (Active Overlays & Toolbars)**: `#0c1527`
- **Borders & Dividers**: `#121c2d` / `#162238`

### Functional & Signal Accents
- **Primary Action (Saffron / Orange)**: `#ff8c2b` (Hover: `#ffa64d`, Active Glow: `rgba(255, 140, 43, 0.4)`)
- **Scientific Highlights (Cyan)**: `#00e5ff` (Hover: `#33ebff`, Active Glow: `rgba(0, 229, 255, 0.5)`)
- **Radar Secondary Accent (Sky Blue)**: `#38bdf8`
- **Verification / Success (Emerald)**: `#10b981`
- **Warning (Amber)**: `#f59e0b`
- **Error / Critical Alert (Crimson)**: `#ef4444`

### Text Tokens
- **Text (Primary White)**: `#ffffff`
- **Text (Secondary Slate)**: `#cbd5e1`
- **Muted Text (Dimmed Scientific)**: `#94a3b8`
- **Footnotes / Disabled**: `#64748b`

## 4. Typography

- **Font Family (UI)**: Inter, system-ui, -apple-system, sans-serif
- **Font Family (Telemetry / Coordinates)**: JetBrains Mono, Fira Code, monospace
- **H1 (Header Banner)**: 18px / Bold (700) / Line Height 24px
- **H2 (Section Header)**: 14px / SemiBold (600) / Line Height 20px
- **H3 (Subheader / Card)**: 12px / SemiBold (600) / Line Height 16px
- **Body Text**: 12px / Normal (400) / Line Height 18px
- **Small / Metadata**: 10px / Medium (500) or Mono / Line Height 14px

## 5. Spacing

- **Base Unit**: 4px
- **Scale**: `2px` (gap-0.5), `4px` (gap-1), `6px` (gap-1.5), `8px` (gap-2), `12px` (gap-3), `16px` (gap-4), `24px` (gap-6)

## 6. Border Radius

- **Small (Badges, Chips)**: `4px` (`rounded`)
- **Medium (Buttons, Input Fields)**: `6px` (`rounded-md`)
- **Large (Drawers, Modals, Cards)**: `10px` (`rounded-xl`)
- **Pill (Navigation Badges, Filters)**: `9999px` (`rounded-full`)

## 7. Shadows & Glows

- **Subtle Surface**: `0 2px 8px rgba(0, 0, 0, 0.5)`
- **Panel Elevation**: `0 10px 25px -5px rgba(2, 5, 11, 0.8)`
- **Orange Action Glow**: `0 0 14px rgba(255, 140, 43, 0.35)`
- **Cyan Signal Glow**: `0 0 12px rgba(0, 229, 255, 0.4)`

## 8. Buttons

- **Primary Button**: Background gradient from `#e65c00` to `#f97316`, white text, border `#ff8c38`, subtle saffron drop-glow.
- **Secondary Button**: Background `#0c172a`, border `#1e2d4a`, text `#cbd5e1`, hover background `#13223f` with white text.
- **Ghost Button**: Transparent, text `#94a3b8`, hover text `#ffffff`, hover background `#0f1b2e`.
- **Danger Button**: Background `#7f1d1d`/40, border `#dc2626`/60, text `#fca5a5`, hover background `#991b1b`/60.
- **Disabled State**: Opacity 40%, cursor not-allowed, pointer-events none.

## 9. Inputs & Sliders

- **Search Inputs**: Dark slate `#0b1222`, border `#1e2e4f`, placeholder `#64748b`, focus border `#00e5ff` with 1px ring `rgba(0, 229, 255, 0.3)`.
- **Range Sliders (Opacity / Contrast)**: Track `#152238`, active fill `#00e5ff`, thumb `#ffffff` with cyan outline.
- **Checkboxes**: Checked background `#ff8c2b`, border `#ff8c2b`, checkmark white; unchecked background `#070e1c`, border `#2a3b5c`.

## 10. Cards & Accordions

- **Drawer Category Accordion**: Header `#081020`, border `#142036`, hover background `#0c182e`, chevron indicator transition.
- **Active Layer Card**: Background `#070e1c`, left active border accent (e.g. `#00e5ff` or `#ff8c2b`), compact slider controls.

## 11. Navigation

- **Global Top Header**: 60px height, `#040812`/95 with backdrop blur, bottom border `#121c2d`.
- **Slim Side Rail**: 64px width, `#03060e`, border-right `#101826`, vertical icon-pill layout.
- **Status Footer**: 28px height, `#02050b`, border-top `#101826`, font-mono 11px.

## 12. States

- **Loading**: Pulse animation on skeletons (`bg-[#0c1628] animate-pulse`), spinning cyan telemetry radar icon.
- **Empty State**: Centered icon, muted prompt (`text-slate-400`), actionable quick-preset or clear search button.
- **Error State**: Crimson indicator, technical explanation, dismiss or retry button.

## 13. Accessibility

- Maintain WCAG AA compliant contrast ratio (minimum 4.5:1) for all critical text and icons against nocturnal backgrounds.
- Provide accessible `aria-label` attributes on map canvases, sliders, and icon-only buttons.
- Ensure full keyboard accessibility with visible cyan focus rings on interactive elements.

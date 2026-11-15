---
name: ObraKadabra
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#434655'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2251da'
  primary: '#0037b1'
  on-primary: '#ffffff'
  primary-container: '#1f4fd8'
  on-primary-container: '#ccd4ff'
  inverse-primary: '#b7c4ff'
  secondary: '#9c4500'
  on-secondary: '#ffffff'
  secondary-container: '#ff7a1b'
  on-secondary-container: '#5e2700'
  tertiary: '#2d2cbd'
  on-tertiary: '#ffffff'
  tertiary-container: '#4749d5'
  on-tertiary-container: '#d3d2ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb68e'
  on-secondary-fixed: '#331200'
  on-secondary-fixed-variant: '#773300'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#faf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-numeric-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.02em
  label-numeric-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
  label-numeric-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a high-precision, utilitarian yet warmly approachable environment for construction planning, 4D timeline simulation, and 5D cost forecasting tailored for Latin America and Peru. It bridges technical BIM precision (Linear/Figma/Autodesk Forma) with practical on-site clarity required by maestros de obra, independent contractors, and autoconstruction families.

The aesthetic fuses **Modern Technical SaaS** with **Tactile Construction Utility**:
- **Clarity over decorative density:** Uncluttered viewports, high legibility in direct sunlight or glare-prone job sites, crisp structural scaffolding, and clear hierarchical boundaries.
- **Approachable Sorcery:** AI generation and procedural estimation are represented through controlled, subtle indigo/violet ambient accents rather than distracting skeuomorphic clutter.
- **Safety & Urgency Semantics:** Physical job-site visual cues—blueprint cyans, high-visibility warning oranges, concrete neutrals, and ISO-inspired safety indicators—structure the daily operational workflow.

## Colors

The palette grounds high-complexity building data within intuitive perceptual roles:

- **Primary Blueprint Blue (`#1F4FD8`):** Anchors operational actions, active project states, primary tools, and automated system commands.
- **Safety / Hito Orange (`#FF7A1A`):** Used strictly for current-day markers ("Hoy"), urgent critical path operations, schedule commits, and top-level site actions.
- **AI Glow / Magic Indigo (`#6366F1` & `#4F46E5`):** Reserved for generative parametric schedules, auto-takeoffs, bill-of-materials parsing, and predictive warnings.
- **Concrete Bone Ground (`#F6F5F2`):** Primary canvas surface delivering low eye fatigue compared to pure white, echoing mortar and light limestone aggregate.
- **Viewport Darkroom (`#16181D`):** Dedicated dark canvas reserved for the 3D WebGL/BIM viewport, providing maximum luminance contrast for model meshes, wireframes, and time-based bounding volumes.
- **Field Status Tokens:**
  - Complete / On Schedule: `#1E9E5A`
  - Review / Variance Warning: `#E8A317`
  - Critical Delay / Danger: `#D64545`
  - Unscheduled / Dormant: `#9AA0A6`

## Typography

The typographic hierarchy enforces strict task separation across three type engines:

- **Space Grotesk (Display & Structural Hierarchy):** Used for project headers, phased milestones, zone identifiers, and section titles. Its geometric, technical architecture lends engineering credibility while retaining visual character.
- **Inter (Interface & Prose):** Drives dense forms, checklist tasks, descriptions, and system feedback. High x-height and clear apertures maintain legibility on field tablets and lower-resolution screens.
- **JetBrains Mono (Metrics & Quantities):** Mandatory for all technical measurements, currency values (e.g., `S/. 45,820.00`), volumetric dimensions (`m³`, `m²`, `ml`), Gantt day/week coordinates, and budget deltas. Prevents character misalignment in dense tabular takeoffs.

## Layout & Spacing

The layout is built around an explicit **8px baseline rhythm** engineered for dense multi-pane interfaces:

- **Workspace Model:** Dual-surface application frame. The navigation and global metrics conform to an adaptable fluid 12-column grid. The CAD/BIM viewport acts as a dedicated infinite canvas bordered by docked toolbars and collapsible contextual trays.
- **Desktop Breakpoints (>= 1280px):**
  - Left dock: Fixed 64px collapsed icon rail, expandable to 320px for S-curve, Gantt, and Material Takeoff side-sheets.
  - Central 2D/3D viewport: Fluid container flexing to occupy remaining space.
  - Floating overlays: Pinned 16px from viewport edges.
- **Tablet (768px - 1279px):** Side panels convert to slide-over drawers with touch-optimized target sizes (minimum 44px hit states). 3D viewport retains primary focus.
- **Mobile (< 768px):** Single-column stacked mode. Toolbars migrate to a fixed bottom sheet; the 3D model viewport docks to the top 40% of the screen with touch-safe Orbit/Pan controls, while tasks and material checklists occupy the lower scrollable sheet.

## Elevation & Depth

Visual depth follows a **Tonal Concrete & Air Layering** strategy:

- **Base Level (Canvas):** Rendered in flat `#F6F5F2`. Contains background grids, layout boundaries, and baseline document wrappers.
- **Surface Level 1 (Work Cards & Panes):** Solid `#FFFFFF` surfaces bounded by a crisp 1px border (`#E5E3DE`). No drop shadows in rest state; clean delineation replaces heavy shadows.
- **Surface Level 2 (Floating Canvas Toolbars & Viewport Insets):** `#FFFFFF` with 92% opacity and 12px backdrop blur. Elevated with an ambient, diffused shadow: `0 4px 20px -2px rgba(22, 24, 29, 0.08)`.
- **Surface Level 3 (Modals, Overlays & Drag States):** Elevated via `0 12px 32px -4px rgba(22, 24, 29, 0.14)` and a defined `#D9D6D0` border.
- **Dark 3D Viewport Interior:** Recessed inset depth achieved via a subtle internal drop border (`inset 0 0 0 1px rgba(255, 255, 255, 0.08)`), distinguishing physical CAD space from interface chrome.

## Shapes

The design system enforces a calibrated **12px (`rounded-lg`) standard** across containers, reflecting modern industrial tooling:

- **Buttons, Inputs & Badges:** Use `rounded-md` (8px) to maintain a clean, compact footprint in dense data entries.
- **Cards, Trays, Floating Docks & Canvas Insets:** Standardized to `rounded-lg` (12px). Outer boundary corners match internal component curvature to maintain concentric geometry.
- **Status Indicators, Step Dots & Sliders:** Full circular geometry (`rounded-full`) for instant human recognition.

## Components

### 1. Action Controls & Buttons
- **Primary Action (Blueprint):** Solid `#1F4FD8` fill, white text, 8px border radius, subtle hover shift to `#1841B5`.
- **Milestone / Immediate Action (Hito):** Solid `#FF7A1A` fill with white text, utilized exclusively for current critical path items ("Avanzar Obra", "Declarar Vaciado").
- **AI Assist Action:** Gradient stroke or subtle indigo tint background (`#EEF2FF`), text in `#4F46E5`, paired with an activation sparkle or wand icon.

### 2. Status Badges & AI Confidence
- **Construction Phases:** Soft background tints (12% opacity) paired with high-contrast text (`#1E9E5A` for *Completado*, `#E8A317` for *Revisión*, `#D64545` for *Atrasado*).
- **AI Confidence 'Revisar':** Bordered badge using `#6366F1` with an ambient glow, indicating autogenerated calculations that need Maestro/Ingeniero sign-off. Uses `label-numeric-sm` font.

### 3. 4D Interactive Timeline Slider
- **Scrubber Track:** Multi-segmented horizontal rail. Completed spans fill with `#1E9E5A`, active spans with `#1F4FD8`, and future/projected spans with striped or muted `#E5E3DE`.
- **Today Marker ("Hoy"):** Distinct `#FF7A1A` vertical needle with an anchor pin showing the current date and week index in `JetBrains Mono`.
- **Time Scrub Handle:** 24px draggable thumb displaying instantaneous budget burn (S/.) and phase title via a sticky tooltip.

### 4. Floating 2D/3D Canvas Toolbar & Inset
- **Toolbar:** Floating glass dock pinned to the top-center or bottom-center of the viewport. Houses Selection, Measure, Section Cut, Add Column/Beam, and Material Picker.
- **Picture-in-Picture (PiP) Preview:** 3D viewport housed in bottom right corner (or vice-versa for 2D mode) with a rounded 12px frame, 1px `#FFFFFF` outline, and a quick-swap expand toggle.

### 5. Lateral Drawers: S-Curve & Material Takeoff
- **S-Curve Monitor:** Vector plot visualizer showing planned vs. actual progress curves, with real-time financial deviation counters rendered in `label-numeric-md`.
- **Material Takeoff List:** Dense tabular view grouping items by category (e.g., Cemento Andino Tipo I, Fierro Corrugado 1/2"). Displays quantities, unit of measurement, and total estimated cost in Soles (`S/.`).

### 6. Stepper & Project Cards
- **Phase Stepper:** Numbered or icon-based nodal sequence with connecting lines indicating structural progress (Cimentación → Casco → Acabados).
- **Project Cards:** 12px radius card with concrete bone hover states, status pills, completion percentages rendered in `JetBrains Mono`, and immediate shortcut buttons to jump into either the 3D model or the daily logbook.
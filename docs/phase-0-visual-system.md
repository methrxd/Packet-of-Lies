# Packet of Lies Phase 0 Visual System

## Intent

The `reference` folder is used only for visual direction, not for screen structure, copied layouts, or reused content. Packet of Lies should inherit the tone, density, and typography discipline of the references while building its own product screens.

## Visual Positioning

Packet of Lies should feel:

- operational
- dark and focused
- premium but restrained
- technical without becoming theatrical
- fast, readable, and calm

It should not feel like:

- a generic admin template
- a bright analytics dashboard
- a hacker-movie fantasy UI
- a crowded enterprise spreadsheet
- a marketing-first SaaS shell

## Visual Language

### Layout Character

- compact left navigation
- thin top command bar
- layered dark surfaces
- restrained use of cards
- high information density with clear grouping
- no oversized hero sections or decorative empty space

### Motion Character

- subtle fades
- quiet hover transitions
- light status pulse or sync indicators where meaningful
- no flashy screen-wide transitions

## Typography System

### Font Roles

- Headline and product emphasis: `Geist`
- Body copy and UI text: `Inter`
- Technical labels, hashes, codes, timestamps, filters, and badge text: `JetBrains Mono`

### Typography Rules

- Headings should be confident but not oversized.
- Technical screens should use mono sparingly for trust and readability, not everywhere.
- Buttons, inputs, table labels, and filter chips need explicit sizing and weight.
- Marketing-style giant headers are out of scope for this product.

### Starting Type Scale

- Display: 32px to 40px, semibold, `Geist`
- Section heading: 22px to 28px, medium or semibold, `Geist`
- Card title: 16px to 18px, medium or semibold, `Inter`
- Body: 14px, regular, `Inter`
- Supporting text: 12px to 13px, regular, `Inter`
- Technical label: 11px to 12px, medium, uppercase or tracked mono
- Hash/value text: 12px to 14px, `JetBrains Mono`

## Color System

### Core Palette

- App background: `#080808`
- Primary dark surface: `#0C160D`
- Secondary surface: `#0E0E0E`
- Card surface: `#131313`
- Elevated surface: `#1A1A1A`
- Strong border: `#2D372D`
- Subtle border: `rgba(255,255,255,0.05)`
- Primary text: `#FAFAFA`
- Secondary text: `#BDBDBD`
- Muted text: `#8E8E8E`
- Primary accent: `#02F96D`
- Accent hover: `#7FFFB7`
- Accent soft background: `rgba(2,249,109,0.07)`
- Accent border: `rgba(2,249,109,0.20)`
- Operational orange: `#FF9640`
- Warning: `#FFB800`
- Info: `#5F9CFF`
- Critical: `#FF3939`

### Color Rules

- Green is the default active and operational accent.
- Red is reserved for high-risk, malicious, or destructive states.
- Orange is used for warnings, suspicious evidence, and degraded conditions.
- Blue is used sparingly for informational or system states.
- Gradients should stay subtle and low-contrast.

## Surface Model

The interface should use a clear surface hierarchy:

- background layer
- primary app shell surface
- section surface
- elevated panel surface
- inline technical surface

### Surface Rules

- Surfaces should be separated mostly by value shift and borders, not heavy shadows.
- Panels should feel precise and thin-edged.
- Rounded corners should be controlled and modest.
- The app should avoid bloated card grids or oversized glass effects.

## Spacing and Rhythm

### Spacing Direction

- base spacing unit: 4px
- standard content gaps: 12px, 16px, 20px, 24px
- desktop page padding: 24px
- mobile page padding: 16px
- sidebar width target: compact first, roughly 64px collapsed and 220px to 240px expanded

### Rhythm Rules

- dense but breathable
- repeated alignment lines
- predictable vertical rhythm
- compact control spacing for analyst efficiency

## Component Guidance

### Navigation

- left rail or compact sidebar
- clear active-state treatment with green accent
- mono or tight utility labeling for system sections
- no decorative icon clutter

### Header

- command-style top bar
- search, session status, notifications, and account controls
- minimal chrome

### Cards and Panels

- use only where grouping is meaningful
- thin borders
- dark layered surfaces
- no oversized radii or huge shadows

### Tables and Lists

- compact rows
- readable labels
- inline actions
- sticky headers where useful
- no spreadsheet look

### Forms

- sharp and deliberate
- clear status messaging
- large enough targets for reliability
- minimal modal dependence

### Status Treatments

- active or healthy: green
- suspicious or warning: orange
- malicious or critical: red
- informational: blue or muted neutral

## Product-Specific UI Motifs

These are allowed when used with restraint:

- fine grid textures inside technical panels
- radial dark-to-darker surface gradients
- mono telemetry labels
- subtle scanline or data-pane texture
- low-intensity accent glow around active controls or markers

These are not allowed:

- giant neon glows
- bright matrix-style backgrounds
- decorative 3D widgets
- fake world maps unless functionally justified

## Responsive Direction

- Desktop is the primary working surface.
- Tablet must preserve usability for review workflows.
- Mobile supports monitoring and lightweight admin or analyst actions, not full dense investigation workflows.

## Initial Design Tokens for Implementation

These tokens should exist in code in the next phase:

- `--bg-app`
- `--bg-shell`
- `--bg-surface`
- `--bg-card`
- `--bg-elevated`
- `--border-subtle`
- `--border-strong`
- `--text-primary`
- `--text-secondary`
- `--text-muted`
- `--accent-primary`
- `--accent-primary-hover`
- `--accent-soft`
- `--state-warning`
- `--state-info`
- `--state-critical`
- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--shadow-panel`

## Acceptance Criteria for Phase 0

Phase 0 visual direction is complete when:

- the typography roles are locked
- the palette is locked
- the surface model is locked
- component rules are defined
- responsive intent is clear
- the team has a reusable token list for the next build phase

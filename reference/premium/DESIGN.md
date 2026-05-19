---
name: StoreOS Design System
colors:
  surface: '#0c160d'
  surface-dim: '#0c160d'
  surface-bright: '#323c31'
  surface-container-lowest: '#071008'
  surface-container-low: '#141e14'
  surface-container: '#182218'
  surface-container-high: '#222c22'
  surface-container-highest: '#2d372d'
  on-surface: '#dae6d6'
  on-surface-variant: '#b9cbb7'
  inverse-surface: '#dae6d6'
  inverse-on-surface: '#293329'
  outline: '#849582'
  outline-variant: '#3b4b3b'
  surface-tint: '#00e563'
  primary: '#d8ffd7'
  on-primary: '#003913'
  primary-container: '#02f96d'
  on-primary-container: '#006d2b'
  inverse-primary: '#006e2c'
  secondary: '#ffb783'
  on-secondary: '#4f2500'
  secondary-container: '#b55d00'
  on-secondary-container: '#fffbff'
  tertiary: '#fff3e5'
  on-tertiary: '#432c00'
  tertiary-container: '#ffd189'
  on-tertiary-container: '#79581c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#68ff89'
  primary-fixed-dim: '#00e563'
  on-primary-fixed: '#002108'
  on-primary-fixed-variant: '#00531f'
  secondary-fixed: '#ffdcc5'
  secondary-fixed-dim: '#ffb783'
  on-secondary-fixed: '#301400'
  on-secondary-fixed-variant: '#703700'
  tertiary-fixed: '#ffdead'
  tertiary-fixed-dim: '#ecbf79'
  on-tertiary-fixed: '#281900'
  on-tertiary-fixed-variant: '#5f4104'
  background: '#0c160d'
  on-background: '#dae6d6'
  surface-variant: '#2d372d'
  bg-primary: '#080808'
  surface-secondary: '#0E0E0E'
  surface-card: '#131313'
  surface-elevated: '#1A1A1A'
  text-primary: '#FAFAFA'
  text-secondary: '#BDBDBD'
  text-muted: '#8E8E8E'
  border-subtle: rgba(255,255,255,0.05)
  accent-hover: '#7FFFB7'
  accent-glow: rgba(2,249,109,0.28)
  accent-soft-bg: rgba(2,249,109,0.07)
  accent-border: rgba(2,249,109,0.20)
  warning: '#FFB800'
  info: '#5F9CFF'
  critical: '#FF3939'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  sidebar-width: 64px
  sidebar-expanded: 240px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 24px
---

# StoreOS by NodeWorks — design.md

# Design Philosophy

StoreOS should feel like:
- the iPhone of retail software,
- operational,
- premium,
- calm,
- modern,
- realtime,
- and production-ready.

The interface must combine:
- Apple simplicity,
- Linear polish,
- Stripe cleanliness,
- Vercel operational clarity,
- and infrastructure-tool precision.

The frontend should NEVER resemble:
- ERP software,
- spreadsheet-heavy enterprise dashboards,
- Windows-style POS systems,
- generic admin templates,
- analytics-heavy BI platforms,
- or cluttered SaaS dashboards.

The interface should feel:
- dense but breathable,
- operational but elegant,
- modern but restrained,
- and highly intentional.

---

# Core UX Principles

The frontend must prioritize:
- billing speed,
- low cognitive load,
- realtime responsiveness,
- minimal training,
- touch support,
- keyboard efficiency,
- operational visibility,
- and workflow continuity.

The interface should:
- minimize clicks,
- minimize confirmations,
- minimize friction,
- and avoid unnecessary navigation depth.

---

# Visual Personality

The product should visually feel:
- dark-first,
- layered,
- operational,
- refined,
- and subtle.

Avoid:
- excessive gradients,
- neon effects,
- oversized shadows,
- giant empty spaces,
- colorful enterprise clutter,
- or playful fintech aesthetics.

---

# Color System

Primary Background:
#080808

Secondary Surface:
#0E0E0E

Card Surface:
#131313

Elevated Surface:
#1A1A1A

Primary Text:
#FAFAFA

Secondary Text:
#BDBDBD

Muted Text:
#8E8E8E

Subtle Border:
rgba(255,255,255,0.05)

Primary Accent:
#02F96D

Accent Hover:
#7FFFB7

Accent Glow:
rgba(2,249,109,0.28)

Soft Accent Background:
rgba(2,249,109,0.07)

Accent Border:
rgba(2,249,109,0.20)

Warning:
#FFB800

Information:
#5F9CFF

Operational Orange:
#FF9640

Critical/Error:
#FF3939

---

# Typography

Typography should feel:
- crisp,
- readable,
- calm,
- premium,
- operational.

Use:
- Inter,
- SF Pro,
- Geist-style typography.

Typography hierarchy should prioritize:
- operational readability,
- large important values,
- clear labels,
- low visual noise,
- and consistent spacing.

Avoid:
- decorative typography,
- tiny unreadable labels,
- or oversized marketing-style headers.

---

# Layout System

The application should use:
- compact left sidebar,
- operational top header,
- contextual side drawers,
- floating operational panels,
- sticky actions,
- and layered surfaces.

Spacing should feel:
- intentional,
- premium,
- and operationally efficient.

The layout must support:
- long-duration retail usage,
- multitasking,
- realtime updates,
- and high-frequency cashier interactions.

---

# Sidebar Rules

Sidebar should:
- remain compact,
- support collapsed mode,
- support nested navigation,
- support role-aware visibility,
- and preserve operational clarity.

Navigation should NEVER feel:
- overwhelming,
- deep,
- or enterprise-heavy.

---

# Card System

Cards should:
- feel layered,
- subtle,
- operational,
- and information-dense.

Avoid:
- oversized cards,
- giant shadows,
- oversized spacing,
- or decorative widgets.

---

# Tables

Tables should:
- remain compact,
- readable,
- and operationally efficient.

Use:
- zebra separation sparingly,
- sticky headers,
- inline actions,
- expandable rows,
- and contextual actions.

Avoid:
- spreadsheet aesthetics,
- giant data grids,
- or overly dense enterprise tables.

---

# POS Design Rules

The POS experience is the most important part of StoreOS.

The POS should feel:
- near-native,
- instant,
- calm,
- and operationally invisible.

The POS should prioritize:
- billing speed,
- large touch targets,
- keyboard workflows,
- realtime responsiveness,
- and minimal confirmations.

Avoid:
- modal-heavy workflows,
- cluttered actions,
- tiny buttons,
- or excessive confirmations.

---

# Dashboard Design Rules

Dashboards should:
- prioritize scannability,
- operational awareness,
- and realtime visibility.

Avoid:
- giant BI charts,
- analytics overload,
- fake data visualizations,
- or overly colorful widgets.

The dashboard should feel:
- calm,
- modern,
- premium,
- and operationally useful.

---

# Inventory UX Rules

Inventory UX should:
- hide ERP complexity,
- simplify visibility,
- reduce form overload,
- and prioritize quick operational workflows.

Use:
- side drawers,
- inline editing,
- contextual panels,
- and expandable rows.

---

# Interaction Rules

Interactions should:
- feel instant,
- smooth,
- and operational.

Use:
- inline workflows,
- contextual actions,
- keyboard shortcuts,
- and optimistic updates.

Avoid:
- deep navigation chains,
- excessive confirmations,
- or disruptive modals.

---

# Motion System

Animation intensity:
5/10.

Animations should:
- communicate state,
- communicate realtime activity,
- communicate continuity,
- and feel smooth.

Use:
- hover transitions,
- subtle fades,
- skeleton loaders,
- realtime updates,
- and operational indicators.

Avoid:
- flashy motion,
- large animated transitions,
- or playful animation systems.

---

# Realtime UX

The system should visually communicate:
- live updates,
- sync state,
- reconnecting,
- operational activity,
- and websocket state.

The product should feel:
- alive,
- synchronized,
- and operationally active.

---

# Offline UX

Offline states should feel:
- controlled,
- understandable,
- and operationally resilient.

Users should always understand:
- sync state,
- reconnect state,
- pending actions,
- and retry status.

---

# Loading States

Every surface requires:
- loading skeletons,
- optimistic updates,
- progressive rendering,
- and operational continuity.

Avoid:
- blank screens,
- or spinner-only layouts.

---

# Error States

Errors should feel:
- calm,
- operational,
- and informative.

Avoid:
- technical jargon,
- panic states,
- or aggressive warning UX.

---

# Mobile UX

Mobile support focuses on:
- owners,
- admins,
- and operational monitoring.

The mobile experience should resemble:
- a premium operational fintech app.

Avoid:
- trying to replicate full POS workflows on mobile.

---

# Operational Density

The UI should feel:
- operationally dense,
- but never cluttered.

Information should:
- remain readable,
- quickly scannable,
- and visually grouped.

---

# Forbidden UI Patterns

Do NOT generate:
- ERP-style forms,
- giant spreadsheets,
- generic admin templates,
- giant analytics dashboards,
- oversized charts,
- fake widgets,
- playful fintech styling,
- giant gradients,
- glassmorphism-heavy layouts,
- Windows-style POS UI,
- colorful enterprise dashboards,
- or excessive whitespace.

---

# Final Design Goal

The final frontend should feel like:
- a deployable production retail operating system,
NOT:
- a design showcase,
- dashboard concept,
- or SaaS template.

The interface should feel:
- invisible,
- operational,
- calm,
- premium,
- fast,
- and extremely refined.

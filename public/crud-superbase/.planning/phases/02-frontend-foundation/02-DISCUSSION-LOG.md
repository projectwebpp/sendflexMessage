# Phase 02: Frontend Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-24
**Phase:** 02-frontend-foundation
**Areas discussed:** Mobile sidebar, Icon library, Frontend directory, Tailwind version

---

## Mobile Sidebar

| Option | Description | Selected |
|--------|-------------|----------|
| Hamburger + slide-in drawer | Topbar gets hamburger on mobile; sidebar slides in as overlay | ✓ |
| Desktop-only for now | Sidebar hidden below xl — Phase 04 handles responsive nav | |

**User's choice:** Hamburger + slide-in drawer

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — click backdrop to close | Standard UX, natural on mobile | ✓ |
| No — only X button closes | More explicit control | |

**User's choice:** Yes — backdrop click closes drawer
**Notes:** Drawer state to live in Zustand `uiStore`.

---

## Icon Library

| Option | Description | Selected |
|--------|-------------|----------|
| Font Awesome via CDN in index.html | Matches UX-UI reference exactly, no npm packages | ✓ |
| @fortawesome/react-fontawesome | Full React integration, tree-shakeable, 3 packages | |
| Lucide React | Lightweight, React-native, different icon set | |

**User's choice:** Font Awesome 6.5.1 via CDN in `index.html`

---

## Frontend Directory

| Option | Description | Selected |
|--------|-------------|----------|
| frontend/ | Mirrors backend/ at project root | ✓ |
| client/ | Common alternative in full-stack projects | |
| You decide | Claude picks | |

**User's choice:** `frontend/`

---

## Tailwind Version

| Option | Description | Selected |
|--------|-------------|----------|
| Tailwind v3 | Stable, mature, proven with Vite | ✓ |
| Tailwind v4 | New CSS-first config, faster build, bleeding edge | |

**User's choice:** Tailwind v3

---

## Claude's Discretion

- Theme default: dark mode (inferred from UX-UI reference which opens dark)
- Anti-flash strategy: `localStorage` read in inline `<script>` in `index.html` before React bundle
- Route structure for stubs: `/`, `/tasks`, `/analytics`, `/settings` real stubs; `/teams`, `/calendar` as "Coming Soon"

## Deferred Ideas

- Teams page — Phase 04
- Calendar page — Phase 04
- Notification bell dropdown — Phase 04
- Search bar wiring — Phase 03
- User profile / logout flow — Phase 04

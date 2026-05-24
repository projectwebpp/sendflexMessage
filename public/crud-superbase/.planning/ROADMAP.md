# ROADMAP.md

## Project: Full Stack CRUD Task Management System

---

## Phase 01 — Backend Setup & API
**Status:** not_started
**Slug:** 01-backend
**Goal:** Working Express.js REST API connected to Supabase with full CRUD for tasks.

### Plans
- [01-01] Backend Foundation — project setup, Supabase config, apiResponse utility, error middleware, Express app + server skeleton
- [01-02] CRUD API Layer — taskService, taskValidation, taskController, taskRoutes; mounts /tasks into app.js (depends on 01-01)

---

## Phase 02 — Frontend Foundation
**Status:** not_started
**Slug:** 02-frontend-foundation
**Goal:** Vite + React app with layout system, sidebar, topbar, routing, and theme toggle wired up.

### Plans
- [ ] 02-01-PLAN.md — Vite scaffold + Tailwind v3 + index.html shell (anti-flash IIFE, FA + Inter CDN, .glass + body gradient)
- [ ] 02-02-PLAN.md — Zustand stores (themeStore + uiStore) + React Router v6 Layout/Outlet wiring (depends on 02-01)
- [ ] 02-03-PLAN.md — Sidebar + Topbar + ThemeToggle + page stubs; production build + human UAT (depends on 02-02)

---

## Phase 03 — Features & Integration
**Status:** not_started
**Slug:** 03-features-integration
**Goal:** Full CRUD UI — Dashboard cards, Task table, Modals, Zustand stores, Axios API integration, search, pagination.

### Plans
- [03-01] Dashboard & Task Table — Dashboard cards, Task list page, Create/Edit/Delete modals, Search, Pagination, Status badges, Activity timeline
- [03-02] State Management & API Integration — taskStore, themeStore, uiStore, Axios service layer, realtime UI updates, hooks (useTasks, usePagination, useDebounce, useModal)

---

## Phase 04 — Polish & Delivery
**Status:** not_started
**Slug:** 04-polish-delivery
**Goal:** Production-ready: responsive optimization, analytics page, empty states, skeleton loaders, SweetAlert2 notifications, deployment, README.

### Plans
- [04-01] Responsive & Polish — mobile/tablet breakpoints, skeleton loading, empty states, animation system, analytics page, settings page, 404 page
- [04-02] Deployment & Docs — Vercel frontend deploy, Render backend deploy, README with install/setup/API docs/screenshots/deployment guide

---

## Summary
| Phase | Focus | Plans | Status |
|-------|-------|-------|--------|
| 01 | 2/2 | Complete   | 2026-05-24 |
| 02 | Frontend Foundation | 3 | not_started |
| 03 | Features & Integration | 2 | not_started |
| 04 | Polish & Delivery | 2 | not_started |

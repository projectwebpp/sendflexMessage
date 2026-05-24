# Phase 02: Frontend Foundation - Context

**Gathered:** 2026-05-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold the Vite + React frontend with the full layout shell: sidebar, topbar, theme toggle, and React Router stubs. No data fetching or CRUD logic — this phase delivers a navigable, themed skeleton that Phase 03 fills in.

</domain>

<decisions>
## Implementation Decisions

### Mobile Sidebar
- **D-01:** Sidebar is hidden below `xl` breakpoint (matching the UX-UI reference). On mobile/tablet, the topbar gains a hamburger icon that opens the sidebar as a slide-in drawer overlay.
- **D-02:** The drawer closes on backdrop click (clicking outside the open drawer). A close button (`×`) is also present inside the drawer.
- **D-03:** Drawer state lives in a Zustand `uiStore` (open/closed boolean). Same store used in Phase 03 for modals.

### Icon Library
- **D-04:** Font Awesome 6.5.1 via CDN in `frontend/index.html` — exactly as in the UX-UI reference. Use `<i className="fa-solid fa-...">` throughout React components. No npm FA packages needed.

### Directory Structure
- **D-05:** Frontend lives at `frontend/` (project root), mirroring `backend/`. Full path: `/frontend/src/`.

### Tailwind CSS
- **D-06:** Tailwind CSS v3 (stable). Config: `tailwind.config.js` with `darkMode: 'class'` and `content: ['./index.html', './src/**/*.{js,jsx}']`. Custom glassmorphism utilities added as `extend` — no plugin needed, use arbitrary values where needed.
- **D-07:** Dark mode class applied to `<html>` element (matches UX-UI reference `class="dark"`). ThemeToggle component toggles `document.documentElement.classList.toggle('dark')`.

### Theme Persistence
- **D-08:** Dark/light mode persisted to `localStorage` via Zustand `themeStore`. On app mount, read `localStorage.getItem('theme')` and apply. Default: dark mode (matching the UX-UI reference which opens dark).

### Routing
- **D-09:** React Router DOM v6. Routes stubbed for all sidebar items: `/` (Dashboard), `/tasks`, `/analytics`, `/settings`. `/teams` and `/calendar` are Phase 04 scope — render a simple "Coming Soon" stub. `<Outlet>` pattern with a shared `Layout` wrapper.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Reference
- `UX-UI/index.html` — Complete pixel-faithful UI reference. Glassmorphism styles, sidebar layout, topbar, stat cards, task table, activity panel, dark mode toggle. ALL component structure, class names, and visual patterns derive from this file.

### Project Constraints
- `.planning/PROJECT.md` — Tech stack, design constraints (Inter font only, glassmorphism, responsive breakpoints, dark/light themes).
- `.planning/ROADMAP.md` — Phase 02 goal and plan 02-01 scope.

### Backend Integration Context (for understanding API shape)
- `backend/src/routes/taskRoutes.js` — REST endpoints Phase 03 will call. Not needed in Phase 02 but researcher should note the API contract.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — this is the first frontend phase. All components are new.

### Established Patterns
- `backend/src/utils/apiResponse.js` — `{ success, data, message }` envelope. Frontend Axios layer in Phase 03 must unwrap `response.data.data`.
- Backend runs on `PORT=3001`. Frontend Vite dev server default is `5173`. CORS already configured to `http://localhost:5173`.

### Integration Points
- `frontend/src/` connects to `backend/` via Axios in Phase 03. Phase 02 builds the shell only — no API calls.
- Dark mode class on `<html>` must be set before React hydrates to avoid flash-of-wrong-theme. Read `localStorage` in a `<script>` tag in `index.html` before the React bundle loads.

</code_context>

<specifics>
## Specific Ideas

- App name in sidebar: **TaskFlow** (from UX-UI reference `<h1>`)
- Sidebar logo: indigo-to-purple gradient `rounded-2xl` square with `fa-layer-group` icon
- Sidebar width: `w-80` on desktop
- Primary gradient: `from-indigo-600 to-purple-600` (active nav item, buttons, logo background)
- Background body: dual radial gradients (indigo top-left, purple bottom-right at 15% opacity)
- Glass utility: `backdrop-filter: blur(12px)` + semi-transparent bg — implement as a CSS class in `index.css`
- Sidebar scrollbar: custom 6px wide, `#4f46e5` thumb, `border-radius: 999px`
- User card at sidebar bottom: avatar from `https://i.pravatar.cc/100`, hardcoded "Admin User" for now

</specifics>

<deferred>
## Deferred Ideas

- Teams page (`/teams`) — Phase 04
- Calendar page (`/calendar`) — Phase 04
- Notification bell functionality — Phase 04 (bell renders in topbar but no dropdown yet)
- Search input functionality — Phase 03 (search bar renders in topbar but wired in Phase 03)
- User profile / logout — Phase 04

</deferred>

---

*Phase: 02-frontend-foundation*
*Context gathered: 2026-05-24*

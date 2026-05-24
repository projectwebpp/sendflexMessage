# Phase 02: Frontend Foundation - Pattern Map

**Mapped:** 2026-05-24
**Files analyzed:** 16 new files
**Analogs found:** 0 / 16 exact frontend analogs (first frontend phase — backend analogs used for module/export style only)

---

## Important Context

This is the first frontend phase. There are NO existing frontend files. The only codebase analogs are in `backend/src/`. Those files are CommonJS (`require`/`module.exports`/`exports.*`) — the frontend uses ES Modules (`import`/`export default`). Backend patterns inform structural choices (single-responsibility files, named exports for utilities, default export for components/stores) but are not directly copied.

All component markup, CSS class names, and layout structure derive from the UX-UI reference at `UX-UI/index.html` per CONTEXT.md canonical refs.

---

## File Classification

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `frontend/index.html` | config/static | request-response | — | no analog |
| `frontend/vite.config.js` | config | — | — | no analog |
| `frontend/tailwind.config.js` | config | — | — | no analog |
| `frontend/postcss.config.js` | config | — | — | no analog |
| `frontend/src/index.css` | config/style | — | — | no analog |
| `frontend/src/main.jsx` | entry/provider | request-response | `backend/src/server.js` | structure-match |
| `frontend/src/App.jsx` | router/config | request-response | `backend/src/app.js` | structure-match |
| `frontend/src/stores/themeStore.js` | store/utility | event-driven | `backend/src/utils/apiResponse.js` | module-style-only |
| `frontend/src/stores/uiStore.js` | store/utility | event-driven | `backend/src/utils/apiResponse.js` | module-style-only |
| `frontend/src/components/layout/Layout.jsx` | component | request-response | — | no analog |
| `frontend/src/components/layout/Sidebar.jsx` | component | event-driven | — | no analog |
| `frontend/src/components/layout/Topbar.jsx` | component | event-driven | — | no analog |
| `frontend/src/components/ui/ThemeToggle.jsx` | component | event-driven | — | no analog |
| `frontend/src/pages/Dashboard.jsx` | page/stub | — | — | no analog |
| `frontend/src/pages/Tasks.jsx` | page/stub | — | — | no analog |
| `frontend/src/pages/Analytics.jsx` | page/stub | — | — | no analog |
| `frontend/src/pages/Settings.jsx` | page/stub | — | — | no analog |
| `frontend/src/pages/ComingSoon.jsx` | page/stub | — | — | no analog |

---

## Pattern Assignments

### `frontend/index.html` (config/static)

**Analog:** None — use RESEARCH.md Pattern 2 verbatim.

**Key requirements:**
- Anti-flash `<script>` block MUST appear before the React bundle `<script type="module">` — reads `localStorage.getItem('theme')`, adds/removes `dark` class on `<html>` synchronously
- Font Awesome 6.5.1 CDN `<link>` in `<head>` (D-04)
- Google Fonts Inter preconnect + stylesheet link in `<head>`
- Default: dark mode (if localStorage not 'light', add 'dark' class)
- `<div id="root">` in `<body>`, React bundle script at bottom

**Anti-flash script pattern** (from RESEARCH.md Pattern 2):
```html
<script>
  (function() {
    var theme = localStorage.getItem('theme');
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

---

### `frontend/vite.config.js` (config)

**Analog:** None — standard Vite scaffold output.

**Pattern:**
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

---

### `frontend/tailwind.config.js` (config)

**Analog:** None — use RESEARCH.md Pattern 1 verbatim.

**Pattern** (from RESEARCH.md Pattern 1):
```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**Critical:** Pin Tailwind to `^3` — `npm install -D tailwindcss@^3 postcss autoprefixer`. Do NOT use v4 (breaks `tailwind.config.js` model).

---

### `frontend/postcss.config.js` (config)

**Pattern** (from RESEARCH.md Pattern 1):
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

### `frontend/src/index.css` (config/style)

**Analog:** None — use RESEARCH.md Pattern 1 CSS block verbatim.

**Full file pattern** (from RESEARCH.md Pattern 1, values verified from UX-UI/index.html):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Glassmorphism utility — handles both light and dark */
.glass {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.75);
}

.dark .glass {
  background: rgba(15, 23, 42, 0.75);
}

/* Body dual radial gradient */
body {
  background:
    radial-gradient(circle at top left, rgba(99,102,241,.15), transparent 30%),
    radial-gradient(circle at bottom right, rgba(168,85,247,.15), transparent 30%);
}

/* Custom sidebar scrollbar */
.sidebar-scroll::-webkit-scrollbar {
  width: 6px;
}
.sidebar-scroll::-webkit-scrollbar-thumb {
  background: #4f46e5;
  border-radius: 999px;
}
```

---

### `frontend/src/main.jsx` (entry/provider)

**Backend structural analog:** `backend/src/server.js` — single responsibility: wire the app and mount it.

**Backend server.js module style** (`backend/src/server.js`):
```js
// CommonJS require style — DO NOT copy, use ES module import in frontend
require('dotenv/config')
const app = require('./app')
// ... listen
```

**Frontend pattern** (ES module equivalent, wraps app in BrowserRouter):
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

**Module style note:** Backend uses `require`/`module.exports`. Frontend uses `import`/`export default`. Never mix.

---

### `frontend/src/App.jsx` (router/config)

**Backend structural analog:** `backend/src/app.js` — single responsibility: wire routes to handlers.

**Backend app.js route wiring** (`backend/src/app.js`, lines 14-15):
```js
const taskRoutes = require('./routes/taskRoutes')
app.use('/tasks', taskRoutes)
```

**Frontend equivalent** — React Router v6 Routes tree (from RESEARCH.md Pattern 4):
```jsx
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import ComingSoon from './pages/ComingSoon'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="teams" element={<ComingSoon page="Teams" />} />
        <Route path="calendar" element={<ComingSoon page="Calendar" />} />
      </Route>
    </Routes>
  )
}
```

---

### `frontend/src/stores/themeStore.js` (store, event-driven)

**Backend module style analog:** `backend/src/utils/apiResponse.js` — named exports, single-responsibility utility module.

**Backend named export style** (`backend/src/utils/apiResponse.js`, lines 1-5):
```js
// CommonJS named exports — pattern is single-responsibility, named exports
exports.success = (res, data, message = 'Success', statusCode = 200) => ...
exports.error = (res, message = 'Error', statusCode = 500) => ...
```

**Frontend equivalent** — ES module named export, Zustand store (from RESEARCH.md Pattern 3):
```js
import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  isDark: (() => {
    return localStorage.getItem('theme') !== 'light'
  })(),
  toggle: () => set((state) => {
    const next = !state.isDark
    localStorage.setItem('theme', next ? 'dark' : 'light')
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    return { isDark: next }
  }),
}))
```

**Key constraints:**
- Default is dark (D-08): `localStorage.getItem('theme') !== 'light'` evaluates `true` when nothing stored
- `toggle` directly mutates `document.documentElement.classList` — do NOT use `useState` for this
- Named export (`export const useThemeStore`) not default export — consistent with Zustand conventions

---

### `frontend/src/stores/uiStore.js` (store, event-driven)

**Backend module style analog:** `backend/src/utils/apiResponse.js` — same single-responsibility pattern.

**Pattern** (from RESEARCH.md Pattern 3):
```js
import { create } from 'zustand'

export const useUiStore = create((set) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
}))
```

**Key constraint:** D-03 — this same store will gain modal state in Phase 03. Keep actions granular (`openDrawer`/`closeDrawer`) not a single `toggleDrawer` so Phase 03 can add `openModal`/`closeModal` without refactoring.

---

### `frontend/src/components/layout/Layout.jsx` (component, request-response)

**Analog:** None. Pattern from RESEARCH.md Pattern 4.

**Import pattern:**
```jsx
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useUiStore } from '../../stores/uiStore'
```

**Core pattern** — Outlet wrapper with mobile drawer overlay (from RESEARCH.md Pattern 4):
```jsx
export default function Layout() {
  const { drawerOpen, closeDrawer } = useUiStore()

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — hidden below xl breakpoint (D-01) */}
      <Sidebar />

      {/* Mobile backdrop overlay — click closes drawer (D-02) */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 xl:hidden"
          onClick={closeDrawer}
        />
      )}

      {/* Mobile slide-in drawer (D-01, D-02) */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-80 transition-transform duration-300 xl:hidden
        ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar mobile onClose={closeDrawer} />
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-hidden">
        <Topbar />
        <div className="p-8 overflow-y-auto h-[calc(100vh-96px)]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
```

---

### `frontend/src/components/layout/Sidebar.jsx` (component, event-driven)

**Analog:** None. Pattern from RESEARCH.md Pattern 5, values from UX-UI/index.html.

**Import pattern:**
```jsx
import { NavLink } from 'react-router-dom'
```

**Core pattern** — dual-mode (desktop hidden + mobile drawer), NavLink active state:
```jsx
const navItems = [
  { to: '/', icon: 'fa-chart-pie', label: 'Dashboard' },
  { to: '/tasks', icon: 'fa-list-check', label: 'Tasks', iconColor: 'text-indigo-500' },
  { to: '/teams', icon: 'fa-users', label: 'Teams', iconColor: 'text-pink-500' },
  { to: '/calendar', icon: 'fa-calendar-days', label: 'Calendar', iconColor: 'text-green-500' },
  { to: '/analytics', icon: 'fa-chart-line', label: 'Analytics', iconColor: 'text-orange-500' },
  { to: '/settings', icon: 'fa-gear', label: 'Settings', iconColor: 'text-slate-500' },
]

export default function Sidebar({ mobile = false, onClose }) { ... }
```

**Active NavLink pattern** (avoids always-active Dashboard bug — use `end` on root route):
```jsx
<NavLink
  key={to}
  to={to}
  end={to === '/'}
  onClick={mobile ? onClose : undefined}
  className={({ isActive }) =>
    isActive
      ? 'flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20'
      : 'flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/70 dark:hover:bg-slate-800 transition'
  }
>
  <i className={`fa-solid ${icon} ${isActive ? '' : (iconColor || '')}`}></i>
  {label}
</NavLink>
```

**Note on `onClick={mobile ? onClose : undefined}`:** Fixes RESEARCH.md Pitfall 6 — drawer must close on mobile nav click.

**Logo area pattern:**
```jsx
<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
  <i className="fa-solid fa-layer-group text-white text-xl"></i>
</div>
```

**Glass sidebar wrapper class:** `glass` (from index.css) + `border-r border-white/20 dark:border-slate-800`

**Sidebar width:** `w-80` (D-05 specifics)

**User card at bottom:**
```jsx
<img src="https://i.pravatar.cc/100" className="w-14 h-14 rounded-2xl object-cover" alt="Admin" />
```

---

### `frontend/src/components/layout/Topbar.jsx` (component, event-driven)

**Analog:** None. Pattern from RESEARCH.md Pattern 6.

**Import pattern:**
```jsx
import { useLocation } from 'react-router-dom'
import { useUiStore } from '../../stores/uiStore'
import ThemeToggle from '../ui/ThemeToggle'
```

**Page title map pattern** (avoids switch/if chains):
```jsx
const PAGE_TITLES = {
  '/': 'Dashboard Overview',
  '/tasks': 'Tasks',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/teams': 'Teams',
  '/calendar': 'Calendar',
}

const { pathname } = useLocation()
const title = PAGE_TITLES[pathname] ?? 'TaskFlow'
```

**Hamburger button** (mobile only, xl:hidden):
```jsx
<button
  className="xl:hidden w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-900 border border-white/20 dark:border-slate-700"
  onClick={openDrawer}
  aria-label="Open menu"
>
  <i className="fa-solid fa-bars"></i>
</button>
```

**Search input** (renders but is readOnly — wired in Phase 03):
```jsx
<input
  type="text"
  placeholder="Search tasks, projects..."
  className="w-96 pl-12 pr-5 py-4 rounded-2xl bg-white/80 dark:bg-slate-900 border border-white/20 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
  readOnly
/>
```

**Bell button** (renders, no dropdown — Phase 04):
```jsx
<button className="relative w-14 h-14 rounded-2xl bg-white/80 dark:bg-slate-900 border border-white/20 dark:border-slate-700">
  <i className="fa-solid fa-bell"></i>
  <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500"></span>
</button>
```

---

### `frontend/src/components/ui/ThemeToggle.jsx` (component, event-driven)

**Analog:** None. Pattern from RESEARCH.md Pattern 7.

**Full component pattern:**
```jsx
import { useThemeStore } from '../../stores/themeStore'

export default function ThemeToggle() {
  const { isDark, toggle } = useThemeStore()

  return (
    <button
      onClick={toggle}
      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
      aria-label="Toggle theme"
    >
      <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
    </button>
  )
}
```

**Icon logic:** `fa-sun` when currently dark (click will switch to light), `fa-moon` when currently light.

---

### Page stubs: `Dashboard.jsx`, `Tasks.jsx`, `Analytics.jsx`, `Settings.jsx` (page, stub)

**Analog:** None. All four follow the same minimal stub pattern.

**Stub pattern:**
```jsx
export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
    </div>
  )
}
```

Each page uses its own heading label. These are Phase 02 placeholders — Phase 03 fills in full content.

---

### `frontend/src/pages/ComingSoon.jsx` (page, stub)

**Pattern** — accepts `page` prop for label (used by /teams and /calendar):
```jsx
export default function ComingSoon({ page = 'Page' }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
      <i className="fa-solid fa-clock text-4xl mb-4"></i>
      <h2 className="text-2xl font-bold">{page}</h2>
      <p className="mt-2">Coming Soon</p>
    </div>
  )
}
```

---

## Shared Patterns

### Module Export Style
**Source:** `backend/src/utils/apiResponse.js` and `backend/src/app.js`
**Backend uses:** CommonJS (`require`, `module.exports`, `exports.*`)
**Frontend MUST use:** ES Modules (`import`, `export default`, `export const`)
**Apply to:** Every `.js` and `.jsx` file in `frontend/src/`

No `require()` calls. No `module.exports`. All config files (`vite.config.js`, `tailwind.config.js`, `postcss.config.js`) use `export default`.

### Single-Responsibility File Structure
**Source:** `backend/src/` — each file does one thing: `apiResponse.js` (formatting), `errorMiddleware.js` (error handling), `taskController.js` (route handlers)
**Apply to:** All frontend files — one store per file, one component per file, no mixing of store logic into components.

### Error Boundary / Guard Pattern
**Source:** `backend/src/middlewares/errorMiddleware.js` (lines 5-9):
```js
exports.errorHandler = (err, req, res, next) => {
  console.error(err.internal || err.stack)
  const statusCode = res.statusCode !== 200 ? res.statusCode : (err.statusCode || 500)
  res.status(statusCode).json({ success: false, data: null, message: err.message || 'Internal server error' })
}
```
**Frontend equivalent:** Phase 02 has no async data — no error handling needed in stubs. Phase 03 will add try/catch wrapping service calls (mirroring controller pattern in `backend/src/controllers/taskController.js` lines 7-11).

### API Response Envelope
**Source:** `backend/src/utils/apiResponse.js` (lines 1-5):
```js
{ success: true, data: ..., message: '...' }
{ success: false, data: null, message: '...' }
```
**Apply to:** Phase 03 Axios layer must unwrap `response.data.data` (the inner `data` field). Not needed in Phase 02 (no API calls), but planner should note this for Phase 03 store actions.

### Glassmorphism Token
**Source:** `frontend/src/index.css` `.glass` class
**Apply to:** Sidebar (`<aside>`), Topbar (`<header>`), any card components
**Pattern:** Add `glass` class — never use inline `style={{ backdropFilter: '...' }}`. The `.dark .glass` rule in index.css handles dark variant automatically.

### Dark Mode Class Convention
**Apply to:** All components with conditional dark styles
**Pattern:** Use `dark:` Tailwind prefix variants — e.g., `dark:bg-slate-900`, `dark:border-slate-800`, `dark:text-slate-400`. The `dark` class lives on `<html>` (set by anti-flash script + themeStore). Tailwind `darkMode: 'class'` config enables this.

### Font Awesome Icon Usage
**Apply to:** All components using icons
**Pattern:** `<i className="fa-solid fa-[icon-name]"></i>` — always JSX `className`, never `class`. No npm package — CDN loaded in `index.html`.

---

## No Analog Found

All frontend files are new with no codebase analog. The backend provides module style and structural discipline only.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `frontend/index.html` | config/static | — | No existing HTML entry point |
| `frontend/vite.config.js` | config | — | No existing Vite config |
| `frontend/tailwind.config.js` | config | — | No existing Tailwind config |
| `frontend/postcss.config.js` | config | — | No existing PostCSS config |
| `frontend/src/index.css` | style | — | No existing CSS file |
| All `.jsx` components | component | — | First frontend phase |
| Both Zustand stores | store | event-driven | No existing state management |

**Planner action for all no-analog files:** Use the exact code patterns from RESEARCH.md sections Pattern 1-7 as the implementation source. All patterns in RESEARCH.md are verified against `UX-UI/index.html`.

---

## Metadata

**Analog search scope:** `backend/src/` (only existing source directory)
**Files scanned:** 7 backend files (app.js, server.js, controllers/taskController.js, middlewares/errorMiddleware.js, utils/apiResponse.js, routes/taskRoutes.js, services/taskService.js)
**Pattern extraction date:** 2026-05-24
**Primary pattern source:** `02-RESEARCH.md` Patterns 1-7 (verified against UX-UI/index.html)
**Secondary pattern source:** `backend/src/` for module style and file structure discipline

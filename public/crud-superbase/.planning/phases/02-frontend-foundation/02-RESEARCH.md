# Phase 02: Frontend Foundation - Research

**Researched:** 2026-05-24
**Domain:** React + Vite + Tailwind CSS v3 + Zustand + React Router v6
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Sidebar hidden below `xl` breakpoint. On mobile/tablet, topbar gains a hamburger that opens sidebar as slide-in drawer overlay.
- **D-02:** Drawer closes on backdrop click. Close button (`×`) inside drawer.
- **D-03:** Drawer state in Zustand `uiStore` (open/closed boolean). Same store used in Phase 03 for modals.
- **D-04:** Font Awesome 6.5.1 via CDN in `frontend/index.html`. Use `<i className="fa-solid fa-...">`. No npm FA packages.
- **D-05:** Frontend lives at `frontend/` (project root). Full path: `/frontend/src/`.
- **D-06:** Tailwind CSS v3. Config: `tailwind.config.js` with `darkMode: 'class'` and `content: ['./index.html', './src/**/*.{js,jsx}']`. Custom glassmorphism as `extend` or arbitrary values.
- **D-07:** Dark mode class applied to `<html>`. ThemeToggle toggles `document.documentElement.classList.toggle('dark')`.
- **D-08:** Dark/light mode persisted to `localStorage` via Zustand `themeStore`. Default: dark mode.
- **D-09:** React Router DOM v6. Routes stubbed: `/` (Dashboard), `/tasks`, `/analytics`, `/settings`. `/teams` and `/calendar` render "Coming Soon" stub. `<Outlet>` pattern with shared `Layout` wrapper.

### Deferred Ideas (OUT OF SCOPE)

- Teams page (`/teams`) — Phase 04 (render "Coming Soon" stub only)
- Calendar page (`/calendar`) — Phase 04 (render "Coming Soon" stub only)
- Notification bell dropdown — Phase 04 (bell renders, no functionality)
- Search input functionality — Phase 03 (renders, not wired)
- User profile / logout — Phase 04
</user_constraints>

---

## Summary

Phase 02 scaffolds the entire frontend shell: Vite + React project at `frontend/`, Tailwind CSS v3 configured with `darkMode: 'class'`, Zustand stores for theme and drawer state, React Router v6 with an Outlet-based Layout, and all visual components (Sidebar, Topbar, ThemeToggle) faithful to the UX-UI reference.

The UX-UI reference (`UX-UI/index.html`) is the single source of truth for all CSS class names, color tokens, layout structure, and component composition. Every component must reproduce its exact markup translated from plain HTML to JSX. The glassmorphism visual language — `backdrop-filter: blur(12px)` + semi-transparent backgrounds, `rounded-2xl`/`rounded-3xl` radius tokens, indigo-to-purple gradient accents — is defined by that file and must be preserved exactly.

The anti-flash dark mode pattern (inline `<script>` in `index.html` that reads `localStorage` before the React bundle loads) is mandatory per D-08 and the code_context note in CONTEXT.md.

**Primary recommendation:** Scaffold with `npm create vite@latest frontend -- --template react`, install Tailwind v3 + postcss + autoprefixer, configure stores, then build components top-down: Layout → Sidebar → Topbar → ThemeToggle → page stubs.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Layout shell (sidebar, topbar) | Browser / Client | — | Pure rendering, no server involvement |
| Dark mode class toggle | Browser / Client | — | DOM mutation on `<html>`, localStorage read |
| Anti-flash script | Static HTML (index.html) | — | Must run before React bundle hydrates |
| Drawer open/close state | Browser / Client (Zustand) | — | Ephemeral UI state, not persisted |
| Theme persistence | Browser / Client (Zustand + localStorage) | — | Client-side preference |
| Routing (Outlet) | Browser / Client (React Router) | — | SPA client-side routing |
| Font Awesome icons | CDN / Static (index.html link tag) | — | Loaded via CDN, no npm package |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite | 8.0.14 | Dev server + bundler | Fastest HMR, standard for React projects |
| react | 19.2.6 | UI framework | Locked by project spec |
| react-dom | 19.2.6 | React DOM renderer | Paired with react |
| @vitejs/plugin-react | 6.0.2 | Babel/JSX transform for Vite | Official Vite React plugin |
| tailwindcss | 4.3.0 | Utility CSS | Locked by project spec (use v3 API — see note below) |
| postcss | 8.5.15 | CSS processing | Required by Tailwind v3 |
| autoprefixer | 10.5.0 | Vendor prefix handling | Required by Tailwind v3 |
| zustand | 5.0.13 | State management | Locked by project spec |
| react-router-dom | 7.15.1 | Client-side routing | Locked by project spec |

> **Version note:** `npm view tailwindcss version` returns `4.3.0` (the current latest on npm). However, CONTEXT.md D-06 locks **Tailwind CSS v3**. Install explicitly with `tailwindcss@^3` to get v3 (e.g., `3.4.x`). Tailwind v4 has a completely different configuration model (no `tailwind.config.js`, different PostCSS setup) and must NOT be used for this phase. [VERIFIED: npm registry + CONTEXT.md lock]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| autoprefixer | 10.x | PostCSS plugin | Always paired with Tailwind v3 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | Redux Toolkit | Zustand is lighter, locked by spec |
| React Router v6 Outlet | Nested file routing | Outlet pattern is explicit and simpler for this project size |
| CSS Modules for glass | Tailwind @layer | @layer in index.css is cleaner — single source |

### Installation

```bash
# 1. Scaffold Vite React project
npm create vite@latest frontend -- --template react
cd frontend

# 2. Install dependencies
npm install

# 3. Install Tailwind v3 explicitly (NOT v4)
npm install -D tailwindcss@^3 postcss autoprefixer

# 4. Generate Tailwind config
npx tailwindcss init -p

# 5. Install runtime dependencies
npm install zustand react-router-dom
```

[VERIFIED: npm registry for all versions]

---

## Architecture Patterns

### System Architecture Diagram

```
index.html
  ├── <script> anti-flash theme read (localStorage → html.class)
  ├── <link> Font Awesome 6.5.1 CDN
  ├── <link> Google Fonts Inter
  └── <div id="root"> ← React mounts here

main.jsx
  └── <BrowserRouter>
        └── <App />
              └── <Routes>
                    ├── <Route path="/" element={<Layout />}>
                    │     ├── <Route index element={<Dashboard />} />
                    │     ├── <Route path="tasks" element={<Tasks />} />
                    │     ├── <Route path="analytics" element={<Analytics />} />
                    │     ├── <Route path="settings" element={<Settings />} />
                    │     ├── <Route path="teams" element={<ComingSoon />} />
                    │     └── <Route path="calendar" element={<ComingSoon />} />
                    └── (Layout renders Sidebar + Topbar + <Outlet />)

Zustand stores (no provider needed):
  themeStore  ── isDark (bool) ── persisted to localStorage
  uiStore     ── drawerOpen (bool) ── ephemeral

Data flow (dark mode):
  localStorage.getItem('theme') → anti-flash script → html.classList
                                                         ↑
  ThemeToggle click → themeStore.toggle() → localStorage.setItem + html.classList.toggle
```

### Recommended Project Structure

```
frontend/
├── index.html              # Anti-flash script + CDN links + root div
├── vite.config.js          # @vitejs/plugin-react
├── tailwind.config.js      # darkMode:'class', content paths
├── postcss.config.js       # tailwindcss + autoprefixer
├── package.json
└── src/
    ├── main.jsx            # ReactDOM.createRoot + BrowserRouter
    ├── App.jsx             # Routes definition
    ├── index.css           # Tailwind directives + .glass + body bg + scrollbar
    ├── stores/
    │   ├── themeStore.js   # isDark, toggle, init — localStorage persist
    │   └── uiStore.js      # drawerOpen, openDrawer, closeDrawer
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.jsx      # Sidebar + Topbar + <Outlet />
    │   │   ├── Sidebar.jsx     # Desktop sidebar + mobile drawer
    │   │   └── Topbar.jsx      # Header with hamburger, search, bell, ThemeToggle
    │   └── ui/
    │       └── ThemeToggle.jsx # Button that calls themeStore.toggle()
    └── pages/
        ├── Dashboard.jsx   # Stub — "Dashboard Overview" heading
        ├── Tasks.jsx       # Stub — "Tasks" heading
        ├── Analytics.jsx   # Stub — "Analytics" heading
        ├── Settings.jsx    # Stub — "Settings" heading
        └── ComingSoon.jsx  # Generic stub for /teams and /calendar
```

### Pattern 1: Tailwind v3 Config

```js
// tailwind.config.js
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

```js
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Glassmorphism utility */
.glass {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.75);
}

.dark .glass {
  background: rgba(15, 23, 42, 0.75);
}

/* Body dual radial gradient — from UX-UI reference */
body {
  background:
    radial-gradient(circle at top left, rgba(99,102,241,.15), transparent 30%),
    radial-gradient(circle at bottom right, rgba(168,85,247,.15), transparent 30%);
}

/* Sidebar custom scrollbar */
.sidebar-scroll::-webkit-scrollbar {
  width: 6px;
}
.sidebar-scroll::-webkit-scrollbar-thumb {
  background: #4f46e5;
  border-radius: 999px;
}
```

[VERIFIED: exact values extracted from UX-UI/index.html]

### Pattern 2: Anti-Flash Dark Mode Script (index.html)

This script must appear BEFORE the React bundle `<script>` tag. It reads `localStorage` and applies the `dark` class to `<html>` synchronously during HTML parse — before React mounts — eliminating flash-of-wrong-theme.

```html
<!-- frontend/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TaskFlow</title>

  <!-- Anti-flash: apply theme before React loads -->
  <script>
    (function() {
      var theme = localStorage.getItem('theme');
      // Default: dark (per D-08)
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    })();
  </script>

  <!-- Font Awesome 6.5.1 via CDN (D-04) -->
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
  />

  <!-- Inter font via Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
    rel="stylesheet"
  />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

[VERIFIED: pattern from UX-UI/index.html + CONTEXT.md code_context note]

### Pattern 3: Zustand Stores

```js
// src/stores/themeStore.js
import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  isDark: (() => {
    // Read localStorage; default dark if not set (D-08)
    return localStorage.getItem('theme') !== 'light';
  })(),
  toggle: () => set((state) => {
    const next = !state.isDark;
    localStorage.setItem('theme', next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { isDark: next };
  }),
}));
```

```js
// src/stores/uiStore.js
import { create } from 'zustand';

export const useUiStore = create((set) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
}));
```

[ASSUMED: Zustand 5.x API — `create` import from 'zustand', same as v4. Store signature confirmed against known Zustand patterns. Verify with `npm view zustand` if API changed.]

### Pattern 4: React Router v6 Outlet Layout

```jsx
// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ComingSoon from './pages/ComingSoon';

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
  );
}
```

```jsx
// src/components/layout/Layout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useUiStore } from '../../stores/uiStore';

export default function Layout() {
  const { drawerOpen, closeDrawer } = useUiStore();

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — hidden below xl */}
      <Sidebar />

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 xl:hidden"
          onClick={closeDrawer}
        />
      )}

      {/* Mobile slide-in drawer */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-80 transition-transform duration-300 xl:hidden
        ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar mobile onClose={closeDrawer} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Topbar />
        <div className="p-8 overflow-y-auto h-[calc(100vh-96px)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
```

[VERIFIED: React Router v6 Outlet pattern from react-router.com docs. Drawer pattern is standard CSS transform transition — no external library.]

### Pattern 5: Sidebar Component (Desktop + Mobile Drawer)

```jsx
// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: 'fa-chart-pie', label: 'Dashboard' },
  { to: '/tasks', icon: 'fa-list-check', label: 'Tasks', iconColor: 'text-indigo-500' },
  { to: '/teams', icon: 'fa-users', label: 'Teams', iconColor: 'text-pink-500' },
  { to: '/calendar', icon: 'fa-calendar-days', label: 'Calendar', iconColor: 'text-green-500' },
  { to: '/analytics', icon: 'fa-chart-line', label: 'Analytics', iconColor: 'text-orange-500' },
  { to: '/settings', icon: 'fa-gear', label: 'Settings', iconColor: 'text-slate-500' },
];

export default function Sidebar({ mobile = false, onClose }) {
  return (
    <aside className={`
      ${mobile ? 'flex' : 'hidden xl:flex'}
      w-80 flex-col border-r border-white/20 dark:border-slate-800 glass h-full
    `}>
      {/* Logo */}
      <div className="px-8 py-8 border-b border-white/20 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <i className="fa-solid fa-layer-group text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black">TaskFlow</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Enterprise Workspace</p>
          </div>
        </div>
        {mobile && (
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">
            &times;
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-5 py-6">
        <p className="text-xs uppercase tracking-widest text-slate-400 mb-4 px-4">Main Menu</p>
        <nav className="space-y-2">
          {navItems.map(({ to, icon, label, iconColor }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20'
                  : `flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/70 dark:hover:bg-slate-800 transition`
              }
            >
              <i className={`fa-solid ${icon} ${iconColor || ''}`}></i>
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User card */}
      <div className="p-5 border-t border-white/20 dark:border-slate-800">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-slate-900">
          <img src="https://i.pravatar.cc/100" className="w-14 h-14 rounded-2xl object-cover" alt="Admin" />
          <div className="flex-1">
            <h3 className="font-bold">Admin User</h3>
            <p className="text-sm text-slate-500">Full Stack Developer</p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800">
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
```

[VERIFIED: All class names and structure directly transcribed from UX-UI/index.html]

### Pattern 6: Topbar with Hamburger

```jsx
// src/components/layout/Topbar.jsx
import { useLocation } from 'react-router-dom';
import { useUiStore } from '../../stores/uiStore';
import ThemeToggle from '../ui/ThemeToggle';

const PAGE_TITLES = {
  '/': 'Dashboard Overview',
  '/tasks': 'Tasks',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/teams': 'Teams',
  '/calendar': 'Calendar',
};

export default function Topbar() {
  const { openDrawer } = useUiStore();
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'TaskFlow';

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 dark:border-slate-800 glass">
      <div className="px-8 py-5 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* Hamburger — mobile only */}
          <button
            className="xl:hidden w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-900 border border-white/20 dark:border-slate-700"
            onClick={openDrawer}
            aria-label="Open menu"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          <div>
            <h2 className="text-3xl font-black">{title}</h2>
            <p className="text-slate-500 mt-1">Welcome back here&apos;s what&apos;s happening today.</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* Search — lg+ only */}
          <div className="relative hidden lg:block">
            <input
              type="text"
              placeholder="Search tasks, projects..."
              className="w-96 pl-12 pr-5 py-4 rounded-2xl bg-white/80 dark:bg-slate-900 border border-white/20 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              readOnly
            />
            <i className="fa-solid fa-magnifying-glass absolute left-5 top-5 text-slate-400"></i>
          </div>

          {/* Bell */}
          <button className="relative w-14 h-14 rounded-2xl bg-white/80 dark:bg-slate-900 border border-white/20 dark:border-slate-700">
            <i className="fa-solid fa-bell"></i>
            <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500"></span>
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

### Pattern 7: ThemeToggle Component

```jsx
// src/components/ui/ThemeToggle.jsx
import { useThemeStore } from '../../stores/themeStore';

export default function ThemeToggle() {
  const { isDark, toggle } = useThemeStore();

  return (
    <button
      onClick={toggle}
      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
      aria-label="Toggle theme"
    >
      <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
    </button>
  );
}
```

[VERIFIED: Toggle icon logic — moon shown in dark mode matches UX-UI reference. Sun shown in light mode is standard convention.]

### Anti-Patterns to Avoid

- **Installing Tailwind v4:** `npm install tailwindcss` currently installs v4.3.0 which uses a completely different config (CSS-based, not `tailwind.config.js`). Always pin to `tailwindcss@^3`.
- **Using FA npm package:** D-04 locks CDN. Do not install `@fortawesome/*` npm packages — they conflict with CDN approach and add bundle weight.
- **Reading localStorage inside React components for initial theme:** This causes flash-of-wrong-theme because React renders after HTML parse. Use the anti-flash inline script in `index.html`.
- **Using `useState` for dark mode:** Causes hydration flash and loses sync with `html.classList`. Use Zustand `themeStore` that directly manipulates `document.documentElement.classList`.
- **Using `<a>` tags for nav items:** Use React Router `<NavLink>` which provides the `isActive` prop for the active gradient style.
- **Inline `style={{}}` for glassmorphism:** Use the `.glass` CSS class defined in `index.css` — it handles both light and dark variants via `.dark .glass`.
- **Setting drawer on `body` overflow:hidden:** Instead use a fixed backdrop overlay — simpler and avoids scroll-jump.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Client-side routing | Custom history API wrapper | `react-router-dom` NavLink/Outlet | Active link detection, nested routes, history management |
| Global state | React context + useReducer | Zustand | Context causes unnecessary re-renders; Zustand is selector-based |
| CSS slide animation | JS-based animation | CSS `transition-transform duration-300` + `translate-x-0/-translate-x-full` | GPU-composited, no JS overhead |
| Theme persistence | Manual localStorage calls in components | Zustand `themeStore` with localStorage inside action | Single source of truth, testable |

**Key insight:** The glassmorphism CSS is genuinely simple — `backdrop-filter: blur(12px)` + rgba background. Do NOT reach for a library. Two CSS rules in `index.css` handle both themes.

---

## Common Pitfalls

### Pitfall 1: Tailwind v4 Installed Instead of v3

**What goes wrong:** `tailwind.config.js` is ignored. Utility classes that exist in v3 may have different names or not work. `@tailwind base/components/utilities` directives change.
**Why it happens:** `npm install tailwindcss` resolves to latest (v4.3.0 as of 2026-05-24).
**How to avoid:** Pin explicitly: `npm install -D tailwindcss@^3 postcss autoprefixer`.
**Warning signs:** PostCSS errors about unknown directives; `darkMode: 'class'` config being ignored.

### Pitfall 2: Font Awesome Icon Renders as Empty Box

**What goes wrong:** Icons don't render — shown as empty squares or Unicode characters.
**Why it happens:** Font Awesome CSS not loaded, or loaded after React renders.
**How to avoid:** Place FA `<link>` tag in `index.html` `<head>` (before the React bundle script). Confirm the CDN URL is exactly: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css`.
**Warning signs:** Empty boxes where icons should be.

### Pitfall 3: Dark Mode Flash on Page Load

**What goes wrong:** Page briefly renders in light mode then snaps to dark.
**Why it happens:** React reads `localStorage` inside `useEffect` (after paint) and applies the class.
**How to avoid:** Use the inline `<script>` in `index.html` that runs synchronously during HTML parse, before any React bundle loads.
**Warning signs:** Visible white flash on hard-refresh in dark mode.

### Pitfall 4: backdrop-filter Not Working

**What goes wrong:** Glass effect looks like a plain opaque background.
**Why it happens:** `backdrop-filter` requires that the element NOT have `overflow: hidden` set on a parent, and requires a semi-transparent background (not `bg-white`).
**How to avoid:** Use `background: rgba(...)` not Tailwind's `bg-white`. Ensure no ancestor has `overflow: hidden` cutting off the blur.
**Warning signs:** Glass panels look solid, no blur through them.

### Pitfall 5: NavLink Active State on All Routes

**What goes wrong:** Dashboard (`/`) NavLink is always active because every path starts with `/`.
**Why it happens:** Default NavLink matching is prefix-based.
**How to avoid:** Add `end` prop to the Dashboard NavLink: `<NavLink to="/" end ...>`. This forces exact match.
**Warning signs:** Dashboard nav item always shows gradient regardless of current page.

### Pitfall 6: Drawer Stays Open on Route Change

**What goes wrong:** Clicking a nav link inside the mobile drawer navigates but drawer stays open.
**Why it happens:** Drawer state is not cleared on navigation.
**How to avoid:** Call `closeDrawer()` inside the NavLink `onClick` handler in `Sidebar.jsx` when `mobile === true`.
**Warning signs:** Drawer overlaps content after mobile navigation.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `createRoot` from 'react-dom/client' | Same (React 19 still uses this) | React 18 | No change needed |
| Tailwind v3 `tailwind.config.js` | Tailwind v4 uses CSS config | 2024 | Must pin to v3 per D-06 |
| React Router v5 `<Switch>` + `component={}` | v6 `<Routes>` + `element={}` + Outlet | 2021 | Use v6 patterns only |
| Zustand `create` with devtools wrapping | Same API in v5 | v5 2024 | No breaking change for basic usage |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Zustand v5 `create` import signature is identical to v4 | Standard Stack, Store patterns | Store initialization fails; fix: check Zustand v5 migration guide |
| A2 | `react-router-dom` v7.15.1 has same Outlet/NavLink API as v6 | Router pattern | Routes don't work; fix: check v7 migration notes for breaking changes |

> **Note on A2:** `npm view react-router-dom version` returns `7.15.1`. The locked spec says "React Router DOM v6." v7 is a major version bump. The Outlet and NavLink APIs are largely compatible but v7 introduces optional framework mode. For this project, the standard SPA usage (`BrowserRouter` + `Routes` + `Route` + `Outlet` + `NavLink`) should work identically. **Recommend verifying v7 changelog before implementation.**

---

## Open Questions

1. **React Router DOM v6 vs v7**
   - What we know: npm registry returns v7.15.1 as latest. CONTEXT.md says "v6."
   - What's unclear: Whether the planner should pin `react-router-dom@^6` or use v7 with SPA mode.
   - Recommendation: Pin to `react-router-dom@^6` (`npm install react-router-dom@^6`) to match the locked decision exactly. This installs `6.x` which is well-documented and stable.

2. **Active nav icon colors for active state**
   - What we know: UX-UI reference shows active item as full white (gradient bg, all text white). Individual icon colors (`text-indigo-500`, `text-pink-500`, etc.) are only on inactive items.
   - What's unclear: Whether active state should override icon color to white or keep colored icon.
   - Recommendation: Active state uses white text throughout (matches UX-UI reference exactly — the active item has a white-text gradient background, no individual icon color class).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite dev server | Yes | v24.15.0 | — |
| npm | Package installation | Yes | 11.12.1 | — |
| Vite | Build tool | Install required | — | — |
| Tailwind CSS v3 | Styling | Install required (pin @^3) | — | — |
| Internet (CDN) | Font Awesome, Google Fonts | Assumed | — | Download and serve locally |

**Missing dependencies with no fallback:**
- None — all dependencies are npm-installable or CDN-loaded.

**Note:** `frontend/` directory does not exist yet. Full scaffold required.

---

## Validation Architecture

No automated test framework is configured for this phase. Phase 02 is a visual/structural scaffold — correctness is validated by:

1. **Visual check:** App loads in browser, dark mode active, sidebar visible on desktop, hidden on mobile.
2. **Route check:** Navigate to `/`, `/tasks`, `/analytics`, `/settings` — each renders its stub page with correct title.
3. **Mobile check:** Below `xl` breakpoint — sidebar hidden, hamburger visible, click opens drawer, click backdrop closes it.
4. **Theme check:** Hard-refresh in dark mode shows no flash. ThemeToggle switches theme, persists across refresh.
5. **Icon check:** All Font Awesome icons render correctly.

**Phase gate:** All 5 checks pass before marking phase complete.

---

## Sources

### Primary (HIGH confidence)
- `UX-UI/index.html` — Exact class names, CSS values, layout structure, color tokens, component composition [VERIFIED: read in full]
- `.planning/phases/02-frontend-foundation/02-CONTEXT.md` — Locked decisions D-01 through D-09 [VERIFIED: read in full]
- npm registry (`npm view <package> version`) — All package versions [VERIFIED: 2026-05-24]

### Secondary (MEDIUM confidence)
- React Router v6 Outlet pattern — standard SPA nested routing approach [ASSUMED: training knowledge, consistent with react-router.com docs pattern]
- Zustand v5 store creation API — `create` from 'zustand' [ASSUMED: training knowledge]

### Tertiary (LOW confidence)
- React Router DOM v7 backward compatibility with v6 SPA API [ASSUMED — recommend pinning to @^6]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm registry verified all versions
- Architecture: HIGH — UX-UI reference fully read, all class names extracted
- Pitfalls: HIGH — derived from verified technical constraints (Tailwind v3 vs v4, FA CDN, anti-flash pattern)
- Router version: MEDIUM — v7 vs v6 ambiguity; recommend pinning v6

**Research date:** 2026-05-24
**Valid until:** 2026-06-24 (30 days — stable libraries, locked decisions)

---
phase: 01-backend
fixed_at: 2026-05-24T00:00:00Z
review_path: .planning/phases/01-backend/01-REVIEW.md
iteration: 1
findings_in_scope: 8
fixed: 8
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-05-24T00:00:00Z
**Source review:** `.planning/phases/01-backend/01-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 8 (CR-01, CR-02, CR-03, CR-04, WR-01, WR-02, WR-03, WR-04)
- Fixed: 8
- Skipped: 0

## Fixed Issues

### CR-01: Mass Assignment — Raw `req.body` Written Directly to Supabase

**Files modified:** `backend/src/services/taskService.js`
**Commit:** `8406daf`
**Applied fix:** Replaced the raw `fields` pass-through in `updateTask` with an allowlist object. Only `title`, `description`, and `status` are extracted from `fields` and conditionally added to an `allowed` object, which is then passed to `.update()`.

---

### CR-02: 404 Never Reached — Supabase `.single()` Throws on No Row Instead of Returning `null`

**Files modified:** `backend/src/services/taskService.js`
**Commit:** `bbc7b5c`
**Applied fix:** Changed both `getTaskById` and `deleteTask` error guards from `if (error) throw` to `if (error && error.code !== 'PGRST116') throw`. PGRST116 (no rows returned) now passes through as `data: null`, allowing the controller's `!task` check to produce a proper 404. `createTask`, `getAllTasks`, and `updateTask` were not changed as the fix scope specifies.

---

### CR-03: Internal Supabase Error Messages Leaked to API Clients

**Files modified:** `backend/src/services/taskService.js`, `backend/src/middlewares/errorMiddleware.js`
**Commit:** `32cd9c9`
**Applied fix:**
- In `taskService.js`: All five `throw new Error(error.message)` patterns were replaced with a safe-message pattern: creates `new Error('Database operation failed')`, attaches the raw Supabase message to `dbError.internal` for internal logging, and sets `dbError.statusCode = 500`.
- In `errorMiddleware.js`: Changed `console.error(err.stack)` to `console.error(err.internal || err.stack)` so internal Supabase details are logged. Also updated the statusCode resolution to use `err.statusCode || 500` so service-thrown errors carry their own status code.

---

### CR-04: No Startup Validation of Required Environment Variables

**Files modified:** `backend/src/config/supabase.js`
**Commit:** `4f691b3`
**Applied fix:** Added a `requiredEnv.forEach` loop over `['SUPABASE_URL', 'SUPABASE_ANON_KEY']` before `createClient` is called. If either value is falsy, a descriptive error is thrown at startup. Also removed `require('dotenv/config')` from `supabase.js` (covers WR-04 — see below).

---

### WR-01: CORS Wildcard — All Origins Accepted

**Files modified:** `backend/src/app.js`
**Commit:** `c3706aa`
**Applied fix:** Replaced `app.use(cors())` with a configured cors call specifying `origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173'` and `methods: ['GET', 'POST', 'PUT', 'DELETE']`.

---

### WR-02: `validateUpdateTask` Accepts an Entirely Empty Body

**Files modified:** `backend/src/validations/taskValidation.js`
**Commit:** `a461846`
**Applied fix:** Added an "at least one field" check at the top of `validateUpdateTask`. Filters `['title', 'description', 'status']` for keys present in `body`; if none are found, pushes an error message before the existing title-format check runs.

---

### WR-03: `req.params.id` Is Not Validated Before Database Query

**Files modified:** `backend/src/controllers/taskController.js`
**Commit:** `33d6c77`
**Applied fix:** Declared `const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i` at the module top. Added `if (!UUID_RE.test(req.params.id)) return error(res, 'Invalid task id', 400)` as the first statement inside `getTaskById`, `updateTask`, and `deleteTask`.

---

### WR-04: `dotenv/config` Loaded Multiple Times Across Modules

**Files modified:** `backend/src/config/supabase.js`
**Commit:** `4f691b3` (bundled with CR-04 — same file, same change)
**Applied fix:** Removed `require('dotenv/config')` from `supabase.js`. Dotenv is now loaded exactly once in `app.js`. WR-04 was addressed atomically within the CR-04 commit because both changes target the same line/file and are inseparable — removing dotenv is a prerequisite to the env-guard check working correctly in test contexts.

---

## Skipped Issues

None — all in-scope findings were fixed successfully.

---

_Fixed: 2026-05-24T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_

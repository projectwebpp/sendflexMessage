---
phase: 01-backend
reviewed: 2026-05-24T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - backend/src/app.js
  - backend/src/config/supabase.js
  - backend/src/controllers/taskController.js
  - backend/src/middlewares/errorMiddleware.js
  - backend/src/routes/taskRoutes.js
  - backend/src/server.js
  - backend/src/services/taskService.js
  - backend/src/utils/apiResponse.js
  - backend/src/validations/taskValidation.js
findings:
  critical: 4
  warning: 4
  info: 2
  total: 10
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-05-24T00:00:00Z
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Nine backend source files reviewed across controller, service, validation, middleware, and config layers. Four critical issues exist: a mass-assignment vulnerability, incorrect 404 handling due to Supabase `.single()` error semantics, missing env-var presence checks, and raw internal error message exposure to clients. Four warnings cover CORS wildcard policy, unguarded empty-body PUT, duplicate dotenv loading, and unvalidated route params. Two info items note console logging and a redundant `dotenv` call ordering.

---

## Critical Issues

### CR-01: Mass Assignment — Raw `req.body` Written Directly to Supabase

**File:** `backend/src/services/taskService.js:22`
**Issue:** `updateTask` passes the full `fields` object (sourced from `req.body`) into `.update(fields)` with no field whitelist. An attacker can overwrite any column — including `id`, `created_at`, `user_id`, or database-managed fields — by including them in the request body.
**Fix:**
```js
exports.updateTask = async (id, fields) => {
  const { title, description, status } = fields
  const allowed = {}
  if (title !== undefined)       allowed.title = title
  if (description !== undefined) allowed.description = description
  if (status !== undefined)      allowed.status = status

  const { data, error } = await supabase
    .from('tasks').update(allowed).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}
```

---

### CR-02: 404 Never Reached — Supabase `.single()` Throws on No Row Instead of Returning `null`

**File:** `backend/src/services/taskService.js:10,28`
**Issue:** When no matching row exists, `supabase...eq('id', id).single()` sets `error` to a PGRST116 error object (not `null`) and `data` to `null`. The guard `if (error) throw new Error(error.message)` fires first, producing an unhandled 500 response. The controller's `if (!task) return error(res, 'Task not found', 404)` is therefore dead code for the not-found case in `getTaskById` and `deleteTask`.
**Fix:**
```js
exports.getTaskById = async (id) => {
  const { data, error } = await supabase
    .from('tasks').select('*').eq('id', id).single()
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data  // null when not found; controller checks this
}

// Apply the same pattern to deleteTask
exports.deleteTask = async (id) => {
  const { data, error } = await supabase
    .from('tasks').delete().eq('id', id).select().single()
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data
}
```

---

### CR-03: Internal Supabase Error Messages Leaked to API Clients

**File:** `backend/src/services/taskService.js:5,11,17,23,29` / `backend/src/middlewares/errorMiddleware.js:8`
**Issue:** `throw new Error(error.message)` re-throws raw Supabase / PostgreSQL error strings. `errorHandler` then sends `err.message` directly in the JSON response body. These messages can reveal table names, column names, constraint names, or query details to untrusted callers.
**Fix:**
```js
// In taskService.js — classify errors before throwing
if (error) {
  const safeMessage = 'Database operation failed'
  const dbError = new Error(safeMessage)
  dbError.statusCode = 500
  dbError.internal = error.message  // log internally, never send
  throw dbError
}

// In errorHandler — log internal detail, send only safe message
exports.errorHandler = (err, req, res, next) => {
  console.error(err.internal || err.stack)
  const statusCode = res.statusCode !== 200 ? res.statusCode : (err.statusCode || 500)
  res.status(statusCode).json({ success: false, data: null, message: err.message || 'Internal server error' })
}
```

---

### CR-04: No Startup Validation of Required Environment Variables

**File:** `backend/src/config/supabase.js:4`
**Issue:** `createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)` is called with no guard. If the `.env` file is absent or misconfigured, both values are `undefined`. The Supabase client is created silently and every subsequent DB call fails at runtime with an obscure error rather than a clear startup failure.
**Fix:**
```js
const requiredEnv = ['SUPABASE_URL', 'SUPABASE_ANON_KEY']
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
```

---

## Warnings

### WR-01: CORS Wildcard — All Origins Accepted

**File:** `backend/src/app.js:8`
**Issue:** `app.use(cors())` with no configuration allows requests from any origin. For a CRUD API with mutable state (POST/PUT/DELETE), this is a significant hardening gap that violates the project's stated security requirements.
**Fix:**
```js
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))
```

---

### WR-02: `validateUpdateTask` Accepts an Entirely Empty Body

**File:** `backend/src/validations/taskValidation.js:9-14`
**Issue:** A PUT request with `{}` passes validation (`errors.length === 0`) and proceeds to `updateTask`, which calls `.update({})` on Supabase. This is a no-op at the data level but may silently update `updated_at` and returns a misleading 200 success response. It also hides client-side bugs.
**Fix:**
```js
exports.validateUpdateTask = (body) => {
  const errors = []
  const allowedFields = ['title', 'description', 'status']
  const provided = allowedFields.filter((f) => f in body)
  if (provided.length === 0) errors.push('At least one field (title, description, status) must be provided')
  if ('title' in body && (typeof body.title !== 'string' || body.title.trim() === '')) {
    errors.push('title must be a non-empty string')
  }
  return { valid: errors.length === 0, errors }
}
```

---

### WR-03: `req.params.id` Is Not Validated Before Database Query

**File:** `backend/src/controllers/taskController.js:14,33,41`
**Issue:** Route parameter `id` is passed directly to the service and into Supabase `.eq('id', id)` without any format check. If the database column is UUID-typed, a non-UUID value will generate a Supabase/PostgreSQL cast error whose message is then thrown and (per CR-03) surfaced to the client.
**Fix:**
```js
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// At the top of each handler that uses req.params.id:
if (!UUID_RE.test(req.params.id)) return error(res, 'Invalid task id', 400)
```

---

### WR-04: `dotenv/config` Loaded Multiple Times Across Modules

**File:** `backend/src/app.js:1`, `backend/src/config/supabase.js:1`
**Issue:** `require('dotenv/config')` is called in both `app.js` and `supabase.js`. While `dotenv` is idempotent after the first load, this creates brittle ordering dependence: if `supabase.js` is ever imported before `app.js` (e.g., in tests), env vars may not be set at the time `createClient` is called.
**Fix:** Remove `require('dotenv/config')` from `supabase.js`. Load dotenv exactly once, at the top of the application entry point (`server.js` or `app.js`).

---

## Info

### IN-01: `console.error` Stack Trace in `errorHandler` Has No Environment Guard

**File:** `backend/src/middlewares/errorMiddleware.js:6`
**Issue:** `console.error(err.stack)` runs unconditionally in all environments. In production, structured logging (e.g., to a log aggregator) is preferable; raw stack traces written to stdout add noise and may contain sensitive path information.
**Fix:** Guard with `if (process.env.NODE_ENV !== 'production') console.error(err.stack)` or replace with a structured logger (e.g., `pino`, `winston`).

---

### IN-02: `createTask` Service Silently Ignores Extra Body Fields

**File:** `backend/src/services/taskService.js:15`
**Issue:** `createTask` destructures only `{ title, description, status }`, which is correct, but the controller passes the raw `req.body` object. Any extra fields are silently dropped. This is not currently harmful but should be consistent — either validate allowed fields in the validator or document this as the intended filtering point.
**Fix:** Add explicit field allowlist check in `validateCreateTask`, or add a comment documenting that destructuring in the service is the sanitization boundary.

---

_Reviewed: 2026-05-24T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

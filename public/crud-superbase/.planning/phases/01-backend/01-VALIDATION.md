# Validation Plan — Phase 01: Backend

## Strategy
Smoke tests via curl after both plans (01-01 and 01-02) are complete and the server is running with a configured `.env` file.

## Prerequisites
- `backend/.env` exists with valid `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `PORT=3001`
- Supabase `tasks` table created with schema: id (uuid), title (text NOT NULL), description (text), status (boolean default false), created_at (timestamptz default now())
- Server started: `cd backend && npm run dev`

---

## Structural Checks (no server required)

Run after plan 01-01:

```bash
# Verify all required source files exist
for f in \
  backend/src/app.js \
  backend/src/server.js \
  backend/src/config/supabase.js \
  backend/src/utils/apiResponse.js \
  backend/src/middlewares/errorMiddleware.js \
  backend/package.json \
  backend/.env.example; do
  [ -f "$f" ] && echo "OK: $f" || echo "MISSING: $f"
done
```

Run after plan 01-02:

```bash
# Verify CRUD layer files exist
for f in \
  backend/src/services/taskService.js \
  backend/src/validations/taskValidation.js \
  backend/src/controllers/taskController.js \
  backend/src/routes/taskRoutes.js; do
  [ -f "$f" ] && echo "OK: $f" || echo "MISSING: $f"
done

# Verify no Supabase credentials hardcoded in source
grep -rn "supabase.co\|eyJ" backend/src/ && echo "FAIL: credentials found" || echo "PASS: no hardcoded credentials"

# Verify /tasks is mounted in app.js
grep -q "taskRoutes" backend/src/app.js && echo "PASS: routes mounted" || echo "FAIL: routes not mounted"
```

---

## API Smoke Tests (server must be running)

### 1. Server health
```bash
curl -s http://localhost:3001/nonexistent | jq .
# Expected: { "success": false, "data": null, "message": "Route not found: /nonexistent" }
```

### 2. GET all tasks (empty list)
```bash
curl -s http://localhost:3001/tasks | jq .
# Expected: { "success": true, "data": [], "message": "Tasks retrieved" }
```

### 3. POST — create task
```bash
TASK=$(curl -s -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Integration Test","description":"Created by VALIDATION.md","status":false}')
echo $TASK | jq .
# Expected: { "success": true, "data": { "id": "<uuid>", "title": "Integration Test", ... }, "message": "Task created" }
# HTTP 201

TASK_ID=$(echo $TASK | jq -r '.data.id')
echo "Created task ID: $TASK_ID"
```

### 4. GET single task
```bash
curl -s http://localhost:3001/tasks/$TASK_ID | jq .
# Expected: { "success": true, "data": { "id": "$TASK_ID", ... }, "message": "Task retrieved" }
```

### 5. PUT — update task
```bash
curl -s -X PUT http://localhost:3001/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","status":true}' | jq .
# Expected: { "success": true, "data": { "title": "Updated Title", "status": true, ... }, "message": "Task updated" }
```

### 6. POST — validation error (missing title)
```bash
curl -s -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{"description":"no title here"}' | jq .
# Expected: { "success": false, "data": null, "message": "title is required..." }
# HTTP 400
```

### 7. GET — not found
```bash
curl -s http://localhost:3001/tasks/00000000-0000-0000-0000-000000000000 | jq .
# Expected: { "success": false, "data": null, "message": "Task not found" }
# HTTP 404
```

### 8. DELETE task
```bash
curl -s -X DELETE http://localhost:3001/tasks/$TASK_ID | jq .
# Expected: { "success": true, "data": { "id": "$TASK_ID", ... }, "message": "Task deleted" }
```

### 9. Confirm deletion
```bash
curl -s http://localhost:3001/tasks/$TASK_ID | jq .
# Expected: 404 not found
```

---

## Pass Criteria

| Check | Expected |
|-------|----------|
| All 9 source files exist | OK for all |
| No hardcoded credentials | grep returns nothing |
| /tasks mounted in app.js | grep match found |
| Server starts | No crash on npm run dev |
| GET /tasks returns envelope | success: true, data array |
| POST /tasks returns 201 | success: true, data has uuid |
| PUT /tasks/:id updates | title changed in response |
| POST missing title returns 400 | success: false, HTTP 400 |
| GET unknown id returns 404 | success: false, HTTP 404 |
| DELETE removes task | success: true, then 404 on re-fetch |

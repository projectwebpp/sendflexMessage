# Tasks/Todo REST API

Full Stack ready REST API สำหรับจัดการ Tasks/Todo List ด้วย Node.js, Express และ Supabase

## โครงสร้างโปรเจกต์

```text
.
├── .env
├── .gitignore
├── package.json
├── README.md
└── src
    ├── app.js
    ├── server.js
    ├── config
    │   ├── env.js
    │   └── supabase.js
    ├── controllers
    │   └── taskController.js
    ├── middleware
    │   ├── errorHandler.js
    │   └── notFound.js
    ├── routes
    │   └── taskRoutes.js
    └── utils
        └── AppError.js
```

## ฐานข้อมูล

Table: `tasks`

```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status boolean default false,
  created_at timestamptz default now()
);
```

ถ้ายังไม่ได้เปิด Row Level Security policy ให้ API key แบบ anon ทำงานกับ table นี้ ต้องเพิ่ม policy ใน Supabase ให้เหมาะกับงานของคุณก่อนใช้งานจริง

## Environment Variables

ไฟล์ `.env`

```env
PORT=3001
SUPABASE_URL=https://dozxxknekdhnvpbfetib.supabase.co/rest/v1/
SUPABASE_ANON_KEY=sb_publishable_56uJhm9sp4SbzzwWgO3P6Q_oboIl3Jo
ALLOWED_ORIGIN=http://localhost:5173
```

หมายเหตุ: `@supabase/supabase-js` ต้องใช้ project URL หลัก เช่น `https://xxxx.supabase.co` โค้ดใน `src/config/env.js` จึง normalize ค่า `SUPABASE_URL` โดยตัด `/rest/v1/` ออกให้อัตโนมัติ

## ติดตั้งและรัน

```bash
npm install
npm run dev
```

หรือรันแบบ production:

```bash
npm start
```

Server จะรันที่:

```text
http://localhost:3001
```

## เปิดหน้าเว็บ

โปรเจกต์นี้มีหน้าเว็บ Todo List อยู่ในโฟลเดอร์ `public`

เปิด browser ไปที่:

```text
http://localhost:3001
```

หน้าเว็บนี้เรียก API เดิมผ่าน `fetch('/tasks')` จึงใช้ backend ตัวเดียวกัน ไม่ต้องเปิด frontend server แยก

## REST API

### Health Check

```bash
curl http://localhost:3001/health
```

### GET /tasks

ดึง task ทั้งหมด เรียงจากใหม่ไปเก่า

```bash
curl http://localhost:3001/tasks
```

### POST /tasks

สร้าง task ใหม่

```bash
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Learn Express\",\"description\":\"Build a CRUD API\",\"status\":false}"
```

### PUT /tasks/:id

แก้ไข task ตาม `id`

```bash
curl -X PUT http://localhost:3001/tasks/YOUR_TASK_ID \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Learn Express and Supabase\",\"status\":true}"
```

### DELETE /tasks/:id

ลบ task ตาม `id`

```bash
curl -X DELETE http://localhost:3001/tasks/YOUR_TASK_ID
```

## คำอธิบายโค้ด

### `src/server.js`

ไฟล์เริ่มต้นของ server ทำหน้าที่ import `app` แล้วสั่ง `listen()` ตาม port จาก `.env`

### `src/app.js`

ตั้งค่า Express application:

- เปิด CORS โดยรับ origin จาก `ALLOWED_ORIGIN`
- เปิด `express.json()` เพื่อให้รับ JSON body ได้
- เพิ่ม route `/health`
- ผูก `/tasks` เข้ากับ task routes
- เพิ่ม middleware สำหรับ route ที่ไม่พบและ error handling

### `src/config/env.js`

โหลดค่า `.env` ด้วย `dotenv` และตรวจว่าค่าที่จำเป็นมีครบหรือไม่

### `src/config/supabase.js`

สร้าง Supabase client ด้วย `createClient()` จาก `@supabase/supabase-js`

### `src/routes/taskRoutes.js`

รวม route ของ tasks:

- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`

### `src/controllers/taskController.js`

เก็บ logic หลักของ CRUD:

- `getTasks()` อ่านข้อมูลจาก Supabase
- `createTask()` validate request body แล้ว insert task
- `updateTask()` validate request body แล้ว update task ตาม id
- `deleteTask()` delete task ตาม id

ทุก function ใช้ `async/await` และส่ง response กลับเป็น JSON

### `src/middleware/errorHandler.js`

รวม error response ไว้จุดเดียว ทำให้ response ของ error มีรูปแบบเดียวกัน

### `src/middleware/notFound.js`

จัดการ request ที่ไม่มี route รองรับ แล้วส่ง error 404

### `src/utils/AppError.js`

custom error class สำหรับกำหนด message และ HTTP status code แบบอ่านง่าย

## รูปแบบ Response

สำเร็จ:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Learn Express",
    "description": "Build a CRUD API",
    "status": false,
    "created_at": "2026-05-24T00:00:00.000Z"
  }
}
```

เกิด error:

```json
{
  "success": false,
  "status": "fail",
  "message": "Title is required and must be a non-empty string"
}
```

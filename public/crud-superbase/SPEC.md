# SPEC.md

# Full Stack CRUD Task Management System

---

# 1. Project Overview

สร้างระบบ Full Stack CRUD Task Management แบบ Enterprise SaaS Dashboard
ที่มี UX/UI ระดับ Production Ready โดยใช้:

## Frontend
- React.js (Vite)
- Tailwind CSS
- SweetAlert2
- Axios
- React Router DOM
- Zustand หรือ Context API

## Backend
- Node.js
- Express.js
- dotenv
- cors

## Database & Auth
- Supabase

---

# 2. Main Objective

พัฒนาระบบจัดการ Tasks ที่:
- Modern
- Minimal
- Enterprise-grade
- Responsive
- Scalable
- Reusable
- Production Ready

รองรับ:
- Create
- Read
- Update
- Delete

พร้อม UX/UI แบบ SaaS Dashboard ระดับมืออาชีพ

---

# 3. UX/UI MASTER DESIGN SYSTEM

AI ต้องสร้าง UI ตาม Design Language ด้านล่างนี้

---

# 4. UI DESIGN REFERENCES

## Main UI Style

ให้อ้างอิง UX/UI จาก:

- Linear.app
- Notion
- Vercel Dashboard
- Supabase Dashboard
- Stripe Dashboard
- ClickUp
- Jira Modern UI
- Framer
- TailAdmin
- Shadcn/ui

---

# 5. UI VISUAL STYLE

## Theme Style

ใช้:
- Glassmorphism
- Soft Shadows
- Rounded 2xl / 3xl
- Gradient Accent
- Minimal Clean Layout
- Enterprise Dashboard Feel

---

## Color Palette

### Primary
- Indigo
- Purple
- Slate

### Success
- Green

### Warning
- Yellow

### Danger
- Red

---

## Dark Mode

ต้องรองรับ:
- Dark Theme
- Light Theme

และ:
- Smooth Transition
- Persistent Theme State

---

# 6. TYPOGRAPHY SYSTEM

ใช้:
- Inter Font

น้ำหนัก:
- 400
- 500
- 600
- 700
- 800
- 900

---

# 7. UI LAYOUT STRUCTURE

AI ต้องสร้าง Layout ตามนี้:

```bash
--------------------------------------------------
| Sidebar | Topbar                               |
|         |--------------------------------------|
|         | Dashboard Cards                      |
|         |--------------------------------------|
|         | Table / Kanban / Analytics           |
|         |--------------------------------------|
|         | Activity / Stats / Timeline          |
--------------------------------------------------
```

---

# 8. SIDEBAR DESIGN

Sidebar ต้องมี:

- Logo
- Workspace Name
- Navigation Menu
- Active State
- Hover Animation
- User Profile Section
- Logout Button

---

## Sidebar Menu

- Dashboard
- Tasks
- Projects
- Teams
- Analytics
- Calendar
- Settings

---

# 9. TOPBAR DESIGN

Topbar ต้องมี:

- Search Input
- Notification Bell
- Theme Toggle
- User Avatar
- Quick Action Button

---

# 10. DASHBOARD CARDS

ต้องมี:

- Total Tasks
- Completed
- In Progress
- Revenue / Productivity
- Analytics

---

## Card Style

ใช้:
- Gradient Background
- Soft Border
- Glass Effect
- Icon Box
- Statistic Number
- Trend Indicator

---

# 11. TASK TABLE DESIGN

Table ต้อง:
- Modern Table
- Hover Effect
- Rounded Container
- Search
- Pagination
- Status Badge
- Priority Badge
- Action Buttons

---

## Task Status Badge

### Completed
- Green

### Pending
- Yellow

### High Priority
- Red

---

# 12. MODAL DESIGN

Modal ต้อง:
- Animated
- Backdrop Blur
- Rounded 3xl
- Responsive

ใช้สำหรับ:
- Create Task
- Edit Task
- View Task Detail

---

# 13. BUTTON SYSTEM

## Primary Button

ใช้:
- Gradient Background
- Hover Animation
- Shadow

---

## Danger Button

ใช้:
- Red Accent
- Confirmation Dialog

---

# 14. ANIMATION SYSTEM

ใช้:
- transition-all
- hover:scale-105
- fade-in
- smooth hover
- smooth modal animation

---

# 15. RESPONSIVE DESIGN

รองรับ:
- Mobile
- Tablet
- Laptop
- Desktop
- Ultra Wide

---

## Breakpoints

ใช้:
- sm
- md
- lg
- xl
- 2xl

---

# 16. EMPTY STATE DESIGN

ต้องมี:
- Illustration
- Empty Message
- CTA Button

---

# 17. SKELETON LOADING DESIGN

Skeleton ต้อง:
- animate-pulse
- realistic placeholders
- smooth loading state

---

# 18. NOTIFICATION SYSTEM

ใช้:
- SweetAlert2
- Toast Notification
- Success
- Error
- Warning
- Confirmation

---

# 19. UI COMPONENT REQUIREMENTS

## Reusable Components

AI ต้องสร้าง:

- Button
- Input
- TextArea
- Select
- Modal
- Card
- Table
- Badge
- Loader
- Skeleton
- EmptyState
- Pagination
- Navbar
- Sidebar
- SearchBar
- ThemeToggle
- NotificationDropdown

---

# 20. FRONTEND FEATURES

1. Dashboard Page
2. Task List
3. Create Task
4. Edit Task
5. Delete Task
6. Search Filter
7. Pagination
8. Dark Mode
9. Activity Timeline
10. Analytics Cards
11. Realtime UI Update
12. Responsive Layout

---

# 21. BACKEND REQUIREMENTS

## Framework
- Express.js

## Features

1. REST API
2. Validation
3. Error Middleware
4. Async/Await
5. Clean Architecture
6. Modular Structure
7. Secure ENV
8. API Response Standard

---

# 22. API ENDPOINTS

| Method | Endpoint | Description |
|---|---|---|
| GET | /tasks | Get all tasks |
| GET | /tasks/:id | Get task |
| POST | /tasks | Create task |
| PUT | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |

---

# 23. DATABASE SCHEMA

## Table: tasks

| Field | Type |
|---|---|
| id | uuid |
| title | text |
| description | text |
| status | boolean |
| created_at | timestamp |

---

# 24. FOLDER STRUCTURE

```bash
project-root/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── validations/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│
└── SPEC.md
```

---

# 25. REQUIRED PAGES

AI ต้องสร้าง:

- Login Page
- Dashboard
- Task List
- Create Task
- Edit Task
- Analytics Page
- Settings Page
- 404 Page

---

# 26. REQUIRED HOOKS

- useTasks()
- useDarkMode()
- usePagination()
- useDebounce()
- useModal()

---

# 27. REQUIRED STATE MANAGEMENT

ใช้:
- Zustand

Store:
- taskStore
- themeStore
- uiStore

---

# 28. SECURITY REQUIREMENTS

- Validate inputs
- Hide ENV
- Error handling
- Sanitize request
- Avoid exposing secrets

---

# 29. PERFORMANCE REQUIREMENTS

- Lazy loading
- Code splitting
- Memoization
- Debounce search
- Optimized rendering

---

# 30. README REQUIREMENTS

README ต้องมี:

1. Installation
2. Setup
3. Environment Variables
4. API Docs
5. Deployment
6. Screenshots
7. Folder Structure
8. Tech Stack

---

# 31. DEPLOYMENT TARGET

## Frontend
- Vercel

## Backend
- Render

---

# 32. FINAL OUTPUT REQUIREMENTS

AI ต้อง Generate:

1. Complete Backend
2. Complete Frontend
3. Professional UI
4. Reusable Components
5. Dashboard UI
6. Responsive UX/UI
7. Full Source Code
8. README.md
9. Deployment Guide

---

# 33. OUTPUT STYLE

Output ต้อง:
- Production Ready
- Enterprise Style
- No pseudo code
- Complete files
- Ready to deploy
- Clean Architecture
- Professional UX/UI

---

# 34. IMPORTANT UI INSTRUCTIONS

AI ต้อง:
- Generate UI เหมือน SaaS Dashboard จริง
- ใช้ spacing ระดับ professional
- ใช้ card hierarchy ถูกต้อง
- ใช้ visual hierarchy
- ใช้ modern dashboard patterns
- ใช้ hover interactions
- ใช้ smooth transitions
- ใช้ glass effect บางจุด
- ใช้ gradients อย่างพอดี
- หลีกเลี่ยง UI โล่งเกินไป
- หลีกเลี่ยง UI แน่นเกินไป

---

# 35. UI REFERENCE IMPLEMENTATION RULE

AI ต้อง:
- ดึงแนวคิด UX/UI จากตัวอย่าง Dashboard สมัยใหม่
- สร้าง Layout ใกล้เคียง SaaS ระดับ Enterprise
- ใช้ Interaction Patterns แบบมืออาชีพ
- ใช้ Modern Dashboard UX
- ห้ามสร้าง UI แบบ Bootstrap Admin เก่า

---

# 36. GENERATION ORDER

1. Project Setup
2. Backend Setup
3. Backend APIs
4. Frontend Setup
5. Layout System
6. Sidebar
7. Topbar
8. Dashboard Cards
9. Task Table
10. Modal System
11. State Management
12. API Integration
13. Responsive Optimization
14. Dark Mode
15. Deployment
16. README

---

# END OF SPEC
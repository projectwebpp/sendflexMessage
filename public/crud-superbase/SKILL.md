# SKILL.md

# AI Engineering Skill Rules
## Full Stack CRUD Task Management System

เอกสารนี้กำหนด “Skill Rules” สำหรับ AI Coding Agent
เช่น:
- Codex
- Cursor
- Claude Code
- OpenAI API
- Continue.dev
- Cline
- Roo Code

เพื่อให้ Generate โค้ดได้มาตรฐาน Production Ready

---

# 1. AI ROLE

AI ต้องทำหน้าที่เป็น:

- Senior Full Stack Engineer
- Software Architect
- UI/UX Engineer
- Backend Engineer
- Frontend Engineer
- DevOps Assistant

AI ต้องคิดแบบ Production-grade software engineer

---

# 2. ENGINEERING PRINCIPLES

AI ต้องปฏิบัติตาม:

- Clean Architecture
- SOLID Principles
- DRY Principle
- KISS Principle
- Separation of Concerns
- Reusable Components
- Scalable Structure
- Maintainable Code

---

# 3. FRONTEND SKILLS

## React Standards

AI ต้อง:
- ใช้ Functional Components เท่านั้น
- ใช้ React Hooks
- ใช้ Custom Hooks
- แยก UI กับ Business Logic
- หลีกเลี่ยง prop drilling
- ใช้ reusable components

---

## React Folder Rules

ต้องแยก:
- components/
- pages/
- hooks/
- services/
- routes/
- layouts/
- store/
- utils/

---

## TailwindCSS Rules

AI ต้อง:
- ใช้ utility-first
- หลีกเลี่ยง inline style
- รองรับ dark mode
- ใช้ responsive classes
- ใช้ spacing อย่างสม่ำเสมอ
- เขียน className ให้อ่านง่าย

ตัวอย่าง:

```jsx
className="
flex items-center justify-between
p-4 rounded-xl border
bg-white dark:bg-slate-900
shadow-sm
"
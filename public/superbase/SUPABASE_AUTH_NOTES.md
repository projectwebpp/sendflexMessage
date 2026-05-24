# Supabase Auth Setup

ถ้าลงทะเบียนแล้วเข้าสู่ระบบไม่ได้ ให้ตรวจ 2 จุดนี้ใน Supabase:

## 1. Email confirmation

ตอนนี้ Supabase project นี้ตั้งค่า `mailer_autoconfirm=false` หมายความว่า:

- สมัครสมาชิกแล้วต้องเปิดอีเมล
- กดลิงก์ยืนยันอีเมลก่อน
- จากนั้นจึงเข้าสู่ระบบได้

ถ้าต้องการให้สมัครแล้ว login ได้ทันที ให้ไปที่:

```text
Supabase Dashboard > Authentication > Providers > Email
```

แล้วปิดการบังคับยืนยันอีเมล หรือเปิด auto confirm ตามที่ Dashboard รองรับ

## 2. Site URL / Redirect URL

ตั้งค่า URL สำหรับ redirect หลังยืนยันอีเมล:

```text
https://sendflex-e6b9a.web.app/superbase
```

## 3. Database policy

ต้องรัน SQL ในไฟล์นี้ก่อนเพื่อให้แต่ละ user เห็นเฉพาะ task ของตัวเอง:

```text
supabase-auth-setup.sql
```

# Firebase CRUD App

เว็บแอป CRUD แบบ Static ที่สร้างด้วย TailwindCSS, Firebase Realtime Database และ SweetAlert2

## การรันในเครื่อง

```bash
npm start
```

เปิด `http://127.0.0.1:5173`

## การเชื่อมต่อ Firebase

1. สร้างหรือเปิด Firebase project
2. เพิ่ม Web App ในหน้า Firebase project settings
3. คัดลอก Firebase SDK config
4. แทนที่ค่า placeholder ใน `firebaseConfig` ที่ไฟล์ `app.js`
5. สร้าง Realtime Database และตั้งค่า Rules สำหรับการทดสอบ

แอปนี้เก็บข้อมูลไว้ที่ path `contacts` โดยมีฟิลด์เหล่านี้:

- `name`
- `email`
- `phone`
- `status`
- `notes`
- `createdAt`
- `updatedAt`

สำหรับการพัฒนาเท่านั้น สามารถตั้ง Realtime Database rules ให้เบราว์เซอร์อ่านและเขียนได้ระหว่างทดสอบ ก่อนใช้งานจริงควรบังคับให้เข้าสู่ระบบและจำกัดสิทธิ์ตามผู้ใช้

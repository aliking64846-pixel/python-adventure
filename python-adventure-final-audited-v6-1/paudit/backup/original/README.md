# Python Adventure — Render + PostgreSQL

هذه أول نسخة من تحويل اللعبة من HTML فقط إلى مشروع حقيقي:
- Frontend: `public/index.html`
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: sessions + bcrypt password hashing
- Render: Web Service + PostgreSQL

## تشغيل محلي

1. ثبّت Node.js 20 أو أحدث.
2. أنشئ PostgreSQL وأنشئ قاعدة بيانات.
3. انسخ `.env.example` إلى `.env` وعدّل `DATABASE_URL` و `SESSION_SECRET`.
4. نفّذ `schema.sql` على قاعدة البيانات.
5. شغّل:

```bash
npm install
npm start
```

ثم افتح:
`http://localhost:10000`

## Render

الطريقة الأسهل:
1. ارفع المشروع إلى GitHub.
2. في Render أنشئ PostgreSQL Database.
3. أنشئ Web Service من نفس GitHub repository.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. أضف `DATABASE_URL` من قاعدة بيانات Render.
7. أضف `SESSION_SECRET` بقيمة عشوائية طويلة.
8. بعد أول نشر، نفّذ محتوى `schema.sql` مرة واحدة على قاعدة البيانات.

## ملاحظة أمنية مهمة

الواجهة لا تحتوي على كلمة مرور أو مفتاح قاعدة البيانات. كلمات المرور تُخزّن كـ hash باستخدام bcrypt.

هذه النسخة تحفظ الحسابات، الجلسات، XP، العملات، تقدم الدروس، نقاط/مستويات المهارات والرسائل. لاحقاً نضيف جداول الحقيبة والمهام والإنجازات والمختبر بشكل كامل، مع جعل المكافآت تُحسب على السيرفر لمنع الغش.

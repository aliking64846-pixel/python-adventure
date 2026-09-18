# Python Adventure — Modular Architecture V4

هذه النسخة مقسمة فعليًا إلى طبقات حتى تكون الصيانة والتوسعة أسهل.

```text
python-adventure/
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
│       ├── data.js
│       ├── core/          # تشغيل التطبيق، API، الحفظ، rendering
│       ├── api/           # طلبات API الخاصة بالميزات
│       ├── state/         # حالة اللاعب واللعبة
│       ├── components/    # عناصر UI المشتركة
│       └── features/      # كل ميزة في مجلد مستقل
│
├── backend/
│   ├── server.js          # نقطة تشغيل فقط
│   ├── app.js             # تركيب Express والـ routes
│   ├── config/            # الإعدادات والـ defaults
│   ├── db/                # PostgreSQL
│   ├── middleware/        # auth + errors
│   ├── validators/        # فحص المدخلات
│   ├── routes/            # تعريف endpoints
│   ├── controllers/       # HTTP layer
│   ├── services/          # business logic
│   ├── models/            # database access
│   └── utils/             # helpers
│
├── database/
│   ├── schema.sql
│   ├── migrations/
│   └── seeds/
└── tests/
```

## تدفق الطلب

```text
Browser
  ↓
route
  ↓
controller
  ↓
service
  ↓
model
  ↓
PostgreSQL
```

مثال تسجيل الدخول:
`auth.routes.js → auth.controller.js → auth.service.js → player.model.js`

مثال إكمال درس:
`lessons.routes.js → lesson.controller.js → lesson.service.js → lesson.model.js + player.model.js`

## التشغيل

```bash
npm install
npm start
```

يحتاج المشروع إلى `DATABASE_URL` ويفضل ضبط `SESSION_SECRET` قوي في بيئة الإنتاج.

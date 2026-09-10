# Python Adventure — Full Stack

هذه النسخة مبنية مباشرة على ملف اللعبة الأصلي.

## المتطلبات
- Node.js 20+
- npm

## التشغيل

```bash
npm install
npm start
```

ثم افتح:

http://localhost:3000

## API

- `GET /api/health` — فحص السيرفر وقاعدة البيانات
- `GET /api/player` — بيانات اللاعب + Byte
- `PUT /api/player` — تحديث XP/Coins/Progress
- `PUT /api/byte` — حفظ حالة Byte وذاكرته
- `GET /api/lessons` — الدروس وحالة إكمالها
- `POST /api/lessons/:id/complete` — إكمال درس ومنح XP مرة واحدة

## قاعدة البيانات

تُنشأ تلقائيًا في:

`database/python_adventure.db`

قاعدة البيانات SQLite، وهي مناسبة كبداية محلية وسهلة. عند الانتقال إلى الاستضافة يمكن نقل طبقة قاعدة البيانات إلى PostgreSQL.

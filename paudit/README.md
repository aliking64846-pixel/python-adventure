# Python Adventure — Modular + PostgreSQL

نسخة منظمة وقابلة للتوسع من Python Adventure، مع الحفاظ على وظائف النسخة الأصلية.

## البنية
- `frontend/` واجهة اللعبة.
- `frontend/js/features/` أنظمة اللعبة المستقلة.
- `frontend/js/core/` تشغيل التطبيق، API، الحفظ، والرندر.
- `backend/routes/` مسارات API.
- `backend/controllers/` استقبال الطلبات.
- `backend/services/` منطق العمل.
- `backend/models/` الوصول إلى PostgreSQL.
- `backend/middleware/` المصادقة ومعالجة الأخطاء.
- `database/` مخطط قاعدة البيانات.
- `backup/original/` نسخة من الملفات التي تم رفعها للمقارنة والرجوع، ولا يتم تقديمها للمستخدم.

## التشغيل
1. Node.js 20+.
2. PostgreSQL.
3. انسخ `.env.example` إلى `.env`.
4. اضبط `DATABASE_URL` و`SESSION_SECRET`.
5. `npm install`
6. `npm start`

الخادم يخدم الواجهة من `frontend/` ويقدم API تحت `/api`.

## فحص النسخة
تم فحص:
- JavaScript syntax.
- وجود كل ملفات JavaScript المشار إليها من `index.html`.
- تطابق عناصر HTML الأساسية مع النسخة الأصلية.
- تغطية مسارات API الأصلية.
- بيانات الدروس والمهارات والعناصر والمهام والإنجازات.
- الحفاظ على game state وlab وbyte وchat وauth.

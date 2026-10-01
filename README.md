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

## التشغيل
1. Node.js 20+.
2. PostgreSQL.
3. انسخ `.env.example` إلى `.env`.
4. اضبط `DATABASE_URL` و`SESSION_SECRET`.
5. `npm install`
6. `npm start`

الخادم يخدم الواجهة من `frontend/` ويقدم API تحت `/api`.

## الفحص والتنظيف
تمت مراجعة بنية المشروع والواجهة ومسارات JavaScript الأساسية، مع إزالة ملفات التدقيق والنسخ المكررة القديمة من المستودع، وإزالة مسار الصفحة الرئيسية من التنقل. كما تم تشديد إعداد `SESSION_SECRET` بحيث لا يقبل قيمة افتراضية في بيئة الإنتاج.

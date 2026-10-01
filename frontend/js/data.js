const lessons=[
{id:1,title:'🐍 مقدمة في بايثون',desc:'تعرّف على لغة Python ومميزاتها الأساسية.',xp:100,skill:'أساسيات Python',code:'print("Hello, Python!")',explain:'Python لغة برمجة سهلة القراءة وتستخدم في الويب والبيانات والذكاء الاصطناعي.',question:'أي أمر يطبع Hello؟',answers:['input("Hello")','print("Hello")','type("Hello")'],correct:1},
{id:2,title:'📦 المتغيرات',desc:'تعلّم كيفية تخزين البيانات واستخدام المتغيرات.',xp:150,skill:'الذاكرة',code:'name = "Ali"\nage = 18\nprint(name)',explain:'المتغير اسم يشير إلى قيمة يمكنك استخدامها وتغييرها داخل البرنامج.',question:'أي سطر ينشئ متغيراً اسمه age؟',answers:['age = 18','18 = age','create age 18'],correct:0},
{id:3,title:'🔤 أنواع البيانات',desc:'النصوص والأرقام والقيم المنطقية.',xp:175,skill:'أساسيات Python',code:'name = "Ali"\nage = 18\nactive = True',explain:'من الأنواع الأساسية في Python النصوص str والأعداد int والقيم المنطقية bool.',question:'ما نوع القيمة True؟',answers:['str','bool','float'],correct:1},
{id:4,title:'🖨️ print و input',desc:'اجعل برنامجك يتكلم ويتفاعل مع المستخدم.',xp:200,skill:'حل المشاكل',code:'name = input("Name: ")\nprint("Hello", name)',explain:'input() يستقبل نصاً من المستخدم وprint() يعرض النتيجة.',question:'ما الذي تعيده input() عادةً؟',answers:['نصاً','دالة','قائمة'],correct:0},
{id:5,title:'⚔️ الشروط if / elif / else',desc:'اجعل البرنامج يتخذ قرارات.',xp:225,skill:'المحقق',code:'age = 20\nif age >= 18:\n    print("Welcome")',explain:'الشروط تسمح للبرنامج بتنفيذ مسارات مختلفة حسب صحة المقارنة.',question:'أي كلمة تبدأ الشرط؟',answers:['for','if','def'],correct:1},
{id:6,title:'🌲 الحلقات',desc:'for و while والتكرار الذكي.',xp:250,skill:'السرعة',code:'for i in range(3):\n    print(i)',explain:'الحلقات تعيد تنفيذ مجموعة أوامر عدة مرات.',question:'كم مرة ينفذ جسم الحلقة مع range(3)؟',answers:['2','3','4'],correct:1},
{id:7,title:'🧩 الدوال',desc:'قسّم برنامجك إلى أجزاء احترافية قابلة لإعادة الاستخدام.',xp:275,skill:'البناء',code:'def hello(name):\n    print("Hello", name)\n\nhello("Ali")',explain:'الدوال تجمع منطقاً قابلاً لإعادة الاستخدام ويمكن استدعاؤها أكثر من مرة.',question:'أي كلمة تنشئ دالة؟',answers:['func','def','function'],correct:1},
{id:8,title:'📦 القوائم والقواميس',desc:'نظّم كميات كبيرة من البيانات.',xp:300,skill:'الذاكرة',code:'names = ["Ali", "Sara"]\nuser = {"name":"Ali"}\nprint(names[0])',explain:'القوائم تخزن مجموعة مرتبة والقواميس تربط المفاتيح بالقيم.',question:'أي بنية تستخدم المفتاح والقيمة؟',answers:['list','dict','tuple'],correct:1},
{id:9,title:'🛡️ الملفات والأخطاء',desc:'احفظ البيانات وتعامل مع الأخطاء.',xp:325,skill:'Debugging',code:'try:\n    x = int("10")\nexcept ValueError:\n    print("Error")',explain:'try/except تساعدك على التعامل مع الأخطاء أثناء تشغيل البرنامج.',question:'أي كلمة تبدأ معالجة الاستثناء؟',answers:['catch','except','error'],correct:1},
{id:10,title:'🚀 مشروع Python حقيقي',desc:'اجمع مهاراتك وابنِ برنامجاً كاملاً.',xp:500,skill:'البناء',code:'def greet(name):\n    return "Hello " + name\n\nprint(greet("Ali"))',explain:'المشروع النهائي يجمع المتغيرات والشروط والدوال والبيانات لبناء برنامج متكامل.',question:'أي كلمة تعيد قيمة من الدالة؟',answers:['send','return','give'],correct:1}
];
const skills=[['🟢','أساسيات Python','memory'],['🔵','منطق البرمجة','detect'],['🟣','قوة التكرار','speed'],['🟡','هندسة الدوال','build'],['🛠️','Debugging','debug'],['🧠','حل المشاكل','solve']];
const skillLevels={memory:1,debug:0,detect:0,speed:0,build:0,solve:0};
const items=['print()','input()','int()','float()','type()','+','*','/'];
const tasks=[
['q1','🎯 مهمة المتغير الأول','أنشئ متغيراً باسم name وضع فيه اسمك.',20],
['q2','⌨️ تحدي input','اطلب من المستخدم اسمه ثم اطبع رسالة ترحيب.',25],
['q3','🔢 آلة الجمع','اطلب رقمين واحسب مجموعهما.',30],
['q4','⚔️ بوابة الشروط','استخدم if لمعرفة هل العمر أكبر من 18.',35]
];
const quests=tasks.map(x=>[x[0],x[1],x[3]*5]);
const achievements=[['🏅','أول خطوة','ابدأ رحلتك في Python',true],['📦','سيد المتغيرات','أكمل درس المتغيرات',false],['🛠️','محارب الأخطاء','استخدم المختبر بنجاح 10 مرات',false],['🐍','Python Master','أكمل جميع المراحل',false]];

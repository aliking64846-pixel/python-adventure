const lessons=[
 {id:1,title:'🐍 ما هي Python؟',desc:'تعرّف على Python ولماذا نستخدمها.',xp:100,skill:'المنطق',code:'print("مرحبا يا مبرمج!")',explain:'print() تعرض قيمة على الشاشة.',question:'أي أمر يطبع Hello؟',answers:['input("Hello")','print("Hello")','type("Hello")'],correct:1},
 {id:2,title:'📦 المتغيرات',desc:'تعلّم كيف تخزن المعلومات داخل المتغيرات.',xp:150,skill:'الذاكرة',code:'name = "Ali"\\nage = 18\\nprint(name)',explain:'المتغير اسم نستخدمه لحفظ قيمة وإعادة استعمالها.',question:'أي سطر ينشئ متغيرًا اسمه age؟',answers:['age = 18','18 = age','create age 18'],correct:0},
 {id:3,title:'⌨️ input و int',desc:'استقبل بيانات من المستخدم وحوّل النص إلى رقم.',xp:175,skill:'حل المشاكل',code:'age = int(input("Age: "))\\nprint(age + 1)',explain:'input يعيد نصًا، وint يحوله إلى عدد صحيح.',question:'ماذا تفعل int("10")؟',answers:['تحول 10 إلى عدد صحيح','تطبع 10','تحذف الرقم'],correct:0},
 {id:4,title:'⚔️ الشروط if',desc:'اجعل برنامجك يتخذ قرارات حسب الشرط.',xp:200,skill:'المحقق',code:'age = 20\\nif age >= 18:\\n    print("Welcome")',explain:'if تنفذ الكود عندما يكون الشرط صحيحًا.',question:'أي كلمة تبدأ الشرط؟',answers:['for','if','def'],correct:1},
 {id:5,title:'🔁 الحلقات',desc:'كرر الأوامر باستخدام for.',xp:250,skill:'السرعة',code:'for i in range(3):\\n    print(i)',explain:'الحلقة تكرر مجموعة أوامر عدة مرات.',question:'كم مرة يطبع range(3)؟',answers:['2','3','4'],correct:1},
 {id:6,title:'🧩 الدوال',desc:'اكتب أوامر قابلة لإعادة الاستخدام باستخدام def.',xp:300,skill:'البناء',code:'def hello(name):\\n    print("Hello", name)\\n\\nhello("Ali")',explain:'الدالة تجمع أوامر في وحدة يمكن استدعاؤها أكثر من مرة.',question:'أي كلمة تنشئ دالة؟',answers:['func','def','function'],correct:1}
];

const skills=[
 ['🧠','الذاكرة','memory'],['🛠️','Debugging','debug'],['👁️','المحقق','detect'],['⚡','السرعة','speed'],['🏗️','البناء','build'],['🧩','حل المشاكل','solve']
];
const skillLevels={memory:1,debug:0,detect:0,speed:0,build:0,solve:0};
const items=['print()','input()','int()','float()','type()','+','*','/'];
const quests=[
 ['q1','📚 إكمال الدرس الأول',100],['q2','🧮 بناء Calculator',250],['q3','⚔️ هزيمة Boss الحساب',500],['q4','🏆 إكمال 3 دروس',300]
];
const achievements=[
 ['🏅','أول خطوة','ابدأ رحلتك في Python',true],
 ['📦','سيد المتغيرات','أكمل درس المتغيرات',false],
 ['🛠️','محارب الأخطاء','استخدم المختبر بنجاح 10 مرات',false],
 ['🐍','Python Master','أكمل جميع المراحل',false]
];

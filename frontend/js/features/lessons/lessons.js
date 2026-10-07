/* Python Adventure — Zero-to-Hero Story Lessons V3 */
(function(){
  const st=document.createElement('style');
  st.textContent=`
    .pa-progress{height:7px;background:#12343b;border-radius:99px;overflow:hidden;margin:8px 0 14px}.pa-progress i{display:block;height:100%;background:linear-gradient(90deg,#35f0ad,#3ddcff);transition:.3s}
    .pa-scene{padding:18px;border:1px solid #1a5961;border-radius:20px;background:radial-gradient(circle at 80% 0,#0c3b3d,#071c22 65%);text-align:center}
    .pa-scene .big{font-size:48px;display:block}.pa-scene h3{margin:8px 0;color:#35f0ad}.pa-scene p{color:#d4e5e4;line-height:2;font-size:13px}
    .pa-card{padding:15px;border:1px solid #194d56;border-radius:17px;background:#06171c;margin-top:10px}.pa-card h4{color:#35f0ad;margin-bottom:7px}.pa-card p{color:#d4e5e4;line-height:1.95;font-size:13px;margin:6px 0}
    .pa-code,.pa-input{direction:ltr;text-align:left;background:#020c10;color:#dfffea;border:1px solid #164b54;border-radius:15px;padding:13px;font:14px/1.7 Consolas,monospace}
    .pa-code{white-space:pre-wrap}.pa-input{width:100%;min-height:125px;resize:vertical}.pa-token{display:inline-block;direction:ltr;background:#0b3038;border:1px solid #21616b;border-radius:8px;padding:2px 7px;margin:2px;font:12px Consolas,monospace;color:#bfffee}
    .pa-choice{width:100%;text-align:right;margin:7px 0;padding:12px;border-radius:14px;border:1px solid #1b5660;background:#08242b;color:#eefafa}.pa-choice.good{border-color:#35f0ad}.pa-choice.bad{border-color:#ff6e7d}
    .pa-feedback{min-height:25px;color:#c9dfdd;font-size:12px;line-height:1.7}.pa-hint{margin-top:8px;padding:10px 12px;border-radius:13px;background:#092a31;border:1px dashed #24727a;color:#b7cecf;font-size:11px;line-height:1.8}
    .pa-nav{display:flex;gap:8px;margin-top:12px}.pa-nav button{flex:1}.pa-reward{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.pa-reward div{padding:14px;border-radius:16px;background:#08362f;border:1px solid #1c765f;text-align:center}.pa-reward b{display:block;color:#35f0ad;font-size:18px;margin-top:4px}
  `;
  document.head.appendChild(st);
})();

function openSheet(title,html,extra){const o=$('overlay');if(!o)return;$('sheetTitle').textContent=title;$('sheetText').innerHTML=html;$('sheetExtra').innerHTML=extra||'';o.classList.add('open')}
function closeSheet(){const o=$('overlay');if(o)o.classList.remove('open')}
function paEsc(v){return String(v==null?'':v).replace(/[&<>\\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#039;'}[c]})}

function renderLessons(){
 const list=$('lessonList');if(!list)return;
 list.innerHTML=lessons.map(function(l,i){var done=completedLessons.includes(l.id),unlocked=i===0||completedLessons.includes(lessons[i-1].id);return '<article class="lesson" data-lesson="'+l.id+'" style="opacity:'+(unlocked?1:.5)+';cursor:'+(unlocked?'pointer':'not-allowed')+'"><div class="thumb">🐍</div><div><h3>'+(done?'✓ ':unlocked?'▶ ':'🔒 ')+paEsc(l.title.replace(/^\\S+\\s/,''))+'</h3><p>'+paEsc(l.desc)+'</p></div><div class="tag">'+(done?'✓ مكتمل':l.xp+' XP')+'</div></article>'}).join('');
 list.querySelectorAll('[data-lesson]').forEach(function(el){el.onclick=function(){openLesson(Number(el.dataset.lesson))}});
}

/* كل درس له قصة وشخصية ومفاهيم مشروحة من الصفر. */
function paConfig(l){
 const C={
  1:{icon:'🧑‍💻',hero:'علي',story:'استيقظ علي داخل غرفة غريبة. لا يعرف ما هي البرمجة، ولا يعرف لماذا توجد شاشة أمامه. ظهر على الشاشة: "حتى تخرج من هنا، عليك أن تتعلم كيف تتحدث مع الحاسوب." علي لا يعرف حتى معنى كلمة كود، لذلك تبدأ الرحلة من الصفر تماماً.',
   discover:'البرمجة ببساطة هي إعطاء الحاسوب تعليمات واضحة. والكود هو التعليمات التي نكتبها بلغة يفهمها الحاسوب. Python هي لغة برمجة؛ يعني طريقة نكتب بها هذه التعليمات. اليوم لن نحفظ شيئاً: سنفهم أول كلمة، وأول قوس، وأول علامة تنصيص.',
   deep:'<div class="pa-card"><h4>🧠 شنو يعني برمجة؟</h4><p>تخيل تريد من شخص يفتح باباً: تكله روح للباب، حرك المقبض، افتح. البرمجة نفس الفكرة، لكن بدل ما نعطي الأوامر لشخص، نعطيها للحاسوب.</p></div><div class="pa-card"><h4>💻 شنو يعني كود؟</h4><p>الكود هو أوامر مكتوبة. مو سحر ومو كلمات لازم تخاف منها. كل سطر نكتبه يخبر الحاسوب بشيء محدد.</p></div><div class="pa-card"><h4>🖨️ كلمة print</h4><p><span class="pa-token">print</span> معناها هنا: اعرض أو اطبع شيئاً على الشاشة. الحاسوب يحتاج أن نحدد له ماذا يعرض.</p></div><div class="pa-card"><h4>🟢 الأقواس ( )</h4><p>الأقواس تأتي بعد print. فكر بها كأنها مكان نضع بداخله الشيء الذي نريد عرضه.</p><pre class="pa-code">print()</pre><p>يعني: استخدم أمر العرض، وما زلنا نحتاج أن نخبره ماذا يعرض.</p></div><div class="pa-card"><h4>🔤 علامتا التنصيص " "</h4><p>علامتا التنصيص تقولان لـ Python: الكلام الموجود بينهما هو نص. مثلاً <span class="pa-token">"Python"</span> يعني نص اسمه Python.</p></div><div class="pa-card"><h4>🔬 نفكك السطر كله</h4><pre class="pa-code">print("Python")</pre><p><span class="pa-token">print</span> = اعرض · <span class="pa-token">( )</span> = المكان الذي نضع فيه الشيء · <span class="pa-token">" "</span> = هذا نص · <span class="pa-token">Python</span> = الكلام الذي سيظهر.</p></div>',
   tryCode:'print("Python")',expected:'Python',challenge:'علي أمام أول بوابة. اكتب أمراً يجعل الشاشة تعرض كلمة Python فقط.',check:function(c){return /(^|\\n)\\s*print\\s*\\(\\s*["\']Python["\']\\s*\\)\\s*$/m.test(c.trim())},hint:'فكر بالترتيب: print ثم ( ثم "Python" ثم ).',boss:'🏰 اختبار البوابة: اجعلها تعرض الجملة Hello Ali.',bossCheck:function(c){return /print\\s*\\(\\s*["\']Hello Ali["\']\\s*\\)/.test(c)}},
  2:{icon:'📦',hero:'علي',story:'بعد أن فتح علي الباب، وجد صندوقاً فارغاً. قال الحارس: "إذا أردت أن تتذكر اسمك ونقاطك، تحتاج إلى مكان نخزن فيه المعلومات." علي لأول مرة يسمع كلمة متغير.',
   discover:'المتغير هو اسم نعطيه لمعلومة حتى نقدر نستخدمها لاحقاً. تخيله صندوقاً: على الصندوق اسم، وداخله قيمة. الرمز = هنا يعني وضع قيمة في المتغير.',
   deep:'<div class="pa-card"><h4>📦 الصندوق</h4><p><span class="pa-token">name</span> هو اسم الصندوق، و<span class="pa-token">"Ali"</span> هي المعلومة داخله.</p><pre class="pa-code">name = "Ali"</pre></div><div class="pa-card"><h4>🔎 ليش نستخدم المتغير؟</h4><p>حتى ما نضطر نكتب المعلومة كل مرة. نكتب اسم المتغير ونستخدم القيمة الموجودة بداخله.</p><pre class="pa-code">name = "Ali"\nprint(name)</pre></div><div class="pa-card"><h4>⚠️ انتبه</h4><p>علامات التنصيص مهمة عندما نخزن نصاً. أما اسم المتغير نفسه فلا نضعه بين التنصيص عندما نريد استخدام قيمته.</p></div>',
   tryCode:'name = "Dragon"\nprint(name)',expected:'Dragon',challenge:'اكتب متغيراً اسمه coins وضع بداخله الرقم 100.',check:function(c){return /(^|\\n)\\s*coins\\s*=\\s*100\\s*$/m.test(c.trim())},hint:'اكتب اسم المتغير، ثم =، ثم الرقم: coins = 100',boss:'🗝️ الحارس يريد ثلاثة صناديق: health = 100 و coins = 50 و energy = 80.',bossCheck:function(c){return /health\\s*=\\s*100/.test(c)&&/coins\\s*=\\s*50/.test(c)&&/energy\\s*=\\s*80/.test(c)}},
  3:{icon:'🧪',hero:'علي',story:'دخل علي مختبراً. أمامه ثلاثة صناديق: واحد يحتوي كلمة، واحد رقم، وواحد يحمل جواب نعم أو لا. قال العالم: "الحاسوب يحتاج أن يعرف نوع كل معلومة."',
   discover:'ليست كل البيانات متشابهة. النصوص نكتبها بين التنصيص، الأعداد يمكن إجراء الحساب عليها، وTrue وFalse يمثلان نعم/لا في Python.',
   deep:'<div class="pa-card"><h4>🔤 النص str</h4><pre class="pa-code">name = "Ali"</pre><p>أي شيء بين " " أو \' \' يمكن أن يكون نصاً.</p></div><div class="pa-card"><h4>🔢 الرقم int</h4><pre class="pa-code">age = 18</pre><p>الرقم لا يحتاج علامات تنصيص إذا أردنا أن يتعامل معه Python كرقم.</p></div><div class="pa-card"><h4>✅❌ bool</h4><pre class="pa-code">active = True</pre><p>له قيمتان أساسيتان: True و False.</p></div>',
   tryCode:'name = "Ali"\nage = 18\nactive = True\nprint(name)',expected:'Ali',challenge:'أنشئ متغيراً باسم age وضع فيه الرقم 18.',check:function(c){return /age\\s*=\\s*18/.test(c)},hint:'العمر رقم، لذلك لا تكتب 18 داخل التنصيص.',boss:'🧪 اكتب name = "Ali" و age = 18 و active = True.',bossCheck:function(c){return /name\\s*=\\s*["\']Ali["\']/.test(c)&&/age\\s*=\\s*18/.test(c)&&/active\\s*=\\s*True/.test(c)}},
  4:{icon:'📡',hero:'علي',story:'وصل علي إلى جهاز اتصال. هذه المرة الحاسوب لا يريد أن يتكلم فقط؛ يريد أن يسأل علي عن اسمه وينتظر جوابه.',
   discover:'print يجعل البرنامج يعرض شيئاً، وinput يجعل البرنامج ينتظر إدخالاً من المستخدم. هكذا يبدأ البرنامج بالتفاعل مع الإنسان.',
   deep:'<div class="pa-card"><h4>🖨️ البرنامج يتكلم</h4><pre class="pa-code">print("ما اسمك؟")</pre></div><div class="pa-card"><h4>⌨️ البرنامج يسأل</h4><pre class="pa-code">name = input("اسمك: ")</pre><p>المستخدم يكتب شيئاً، وPython تحفظ النص في name.</p></div>',
   tryCode:'name = input("Name: ")\nprint("Hello", name)',expected:'',challenge:'استخدم input حتى تحصل على اسم المستخدم.',check:function(c){return /input\\s*\\(/.test(c)},hint:'ابدأ بـ name = input(...)',boss:'📡 اكتب برنامجاً يسأل عن الاسم ثم يستخدم print لعرضه.',bossCheck:function(c){return /input\\s*\\(/.test(c)&&/print\\s*\\(/.test(c)}},
  5:{icon:'🚪',hero:'علي',story:'وصل علي إلى بابين. الأول مكتوب عليه: "إذا كان معك المفتاح افتح". هنا اكتشف أن البرامج تستطيع اتخاذ قرارات.',
   discover:'الشرط يعني: إذا حدث شيء معين، نفذ أمراً. كلمة if تعني إذا. المقارنة تخبر البرنامج هل الشرط صحيح أم لا.',
   deep:'<div class="pa-card"><h4>🚪 من الحياة</h4><p>إذا كان معك المفتاح → افتح الباب. إذا لم يكن → ابقَ مغلقاً.</p></div><div class="pa-card"><h4>💻 في Python</h4><pre class="pa-code">if has_key:\n    print("Open")</pre><p>المسافة في السطر الثاني تعني أن الأمر تابع للشرط.</p></div>',
   tryCode:'age = 20\nif age >= 18:\n    print("Welcome")',expected:'Welcome',challenge:'اكتب شرط if بسيطاً يفحص هل age أكبر من أو يساوي 18.',check:function(c){return /if\\s+age\\s*>=\\s*18/.test(c)},hint:'ابدأ بـ if ثم المقارنة: if age >= 18:',boss:'🚪 افتح الباب إذا كانت has_key تساوي True.',bossCheck:function(c){return /if\\s+has_key/.test(c)}},
  6:{icon:'🌲',hero:'علي',story:'دخل علي غابة طويلة. أمامه عشرات الأحجار المتشابهة. قال الحارس: "بدل ما تكرر نفس الأمر بيدك، خلّ Python تكرره عنك."',
   discover:'الحلقة تكرر مجموعة أوامر. for مناسبة عندما تعرف أو تتعامل مع مجموعة من العناصر، وwhile تستمر ما دام الشرط صحيحاً.',
   deep:'<div class="pa-card"><h4>🔁 فكرة التكرار</h4><p>بدل أن تكتب print ثلاث مرات، تستطيع أن تجعل Python تكرر الأمر.</p><pre class="pa-code">for i in range(3):\n    print(i)</pre></div>',
   tryCode:'for i in range(3):\n    print(i)',expected:'0\\n1\\n2',challenge:'اكتب حلقة for تستخدم range(3).',check:function(c){return /for\\s+\\w+\\s+in\\s+range\\s*\\(\\s*3\\s*\\)/.test(c)},hint:'تذكر: for اسم in range(3):',boss:'🌲 اطبع كلمة Python ثلاث مرات باستخدام for.',bossCheck:function(c){return /for\\s+/.test(c)&&/range\\s*\\(\\s*3\\s*\\)/.test(c)&&/print\\s*\\(/.test(c)}},
  7:{icon:'🧩',hero:'علي',story:'كبرت مهام علي، وصار عنده أوامر كثيرة تتكرر. اكتشف ورشة تسمح له بتجميع مجموعة أوامر تحت اسم واحد.',
   discover:'الدالة هي مجموعة أوامر نضعها تحت اسم، ثم نستدعيها عندما نحتاجها. def تعني أننا نعرّف دالة جديدة.',
   deep:'<div class="pa-card"><h4>🧩 اصنع أداة</h4><pre class="pa-code">def hello():\n    print("Hello")\n\nhello()</pre><p>نعرّف الدالة أولاً، ثم نستدعيها بالاسم مع الأقواس.</p></div>',
   tryCode:'def hello(name):\n    print("Hello", name)\n\nhello("Ali")',expected:'',challenge:'أنشئ دالة باسم hello تستخدم print.',check:function(c){return /def\\s+hello\\s*\\(/.test(c)&&/print\\s*\\(/.test(c)},hint:'ابدأ بـ def hello(): ثم ضع print داخلها.',boss:'🧩 أنشئ دالة باسم greet تستقبل name وتطبع رسالة.',bossCheck:function(c){return /def\\s+greet\\s*\\(\\s*name\\s*\\)/.test(c)&&/print\\s*\\(/.test(c)}},
  8:{icon:'🎒',hero:'علي',story:'حقيبة علي امتلأت بالمعلومات. بدل أن يصنع صندوقاً لكل اسم، وجد حقيبة تستطيع حمل عدة قيم معاً.',
   discover:'القائمة list تخزن عدة قيم بترتيب. القاموس dict يخزن أزواجاً من مفتاح وقيمة، مثل name: Ali.',
   deep:'<div class="pa-card"><h4>📋 القائمة</h4><pre class="pa-code">names = ["Ali", "Sara"]</pre></div><div class="pa-card"><h4>📖 القاموس</h4><pre class="pa-code">user = {"name": "Ali"}</pre></div>',
   tryCode:'names = ["Ali", "Sara"]\nuser = {"name":"Ali"}\nprint(names[0])',expected:'Ali',challenge:'أنشئ قائمة باسم names تحتوي Ali و Sara.',check:function(c){return /names\\s*=\\s*\\[.*Ali.*Sara.*\\]/s.test(c)},hint:'القائمة تستخدم [ ] وتضع العناصر داخلها.',boss:'🎒 أنشئ قائمة names فيها ثلاثة أسماء.',bossCheck:function(c){return /names\\s*=\\s*\\[/.test(c)&&/\,/.test(c)}},
  9:{icon:'🛡️',hero:'علي',story:'في المختبر الأخير تعطّل جهاز بسبب إدخال غير متوقع. تعلم علي أن البرنامج الجيد لا ينهار بسهولة، بل يتعامل مع الأخطاء.',
   discover:'try يجرب تشغيل كود قد يسبب خطأ، وexcept يحدد ماذا نفعل إذا حدث الخطأ.',
   deep:'<div class="pa-card"><h4>🛡️ لا تخاف من الخطأ</h4><pre class="pa-code">try:\n    x = int("10")\nexcept ValueError:\n    print("Error")</pre><p>الفكرة ليست حفظ الكلمات، بل معرفة أن البرنامج يستطيع التعامل مع مشكلة متوقعة.</p></div>',
   tryCode:'try:\n    x = int("10")\nexcept ValueError:\n    print("Error")',expected:'',challenge:'اكتب try و except في مثال بسيط.',check:function(c){return /try\\s*:/.test(c)&&/except\\s+/.test(c)},hint:'اكتب try: ثم except ValueError:',boss:'🛡️ أنشئ مثالاً فيه try و except و print داخل except.',bossCheck:function(c){return /try\\s*:/.test(c)&&/except\\s+/.test(c)&&/print\\s*\\(/.test(c)}},
  10:{icon:'🏆',hero:'علي',story:'بعد رحلة طويلة وصل علي إلى القاعة الأخيرة. لم يعد ذلك الشخص الذي لا يعرف ما هو الكود. أمامه مشروع حقيقي صغير، وكل مهاراته السابقة أصبحت أدوات.',
   discover:'المشروع الحقيقي لا يعتمد على مفهوم واحد. نجمع المتغيرات، الإدخال، الشروط، الحلقات، الدوال والبيانات لحل مشكلة حقيقية.',
   deep:'<div class="pa-card"><h4>🚀 من فكرة إلى برنامج</h4><p>ابدأ بمشكلة صغيرة، قسمها إلى خطوات، ثم حوّل كل خطوة إلى كود. هذا هو التفكير البرمجي.</p></div>',
   tryCode:'def greet(name):\n    return "Hello " + name\n\nprint(greet("Ali"))',expected:'Hello Ali',challenge:'اكتب برنامجاً يستخدم دالة greet و print.',check:function(c){return /def\\s+greet/.test(c)&&/print\\s*\\(/.test(c)},hint:'خذ مثال الدرس وعدّل الاسم أو الرسالة.',boss:'🏆 المشروع النهائي: دالة greet تستقبل name وتعيد رسالة، ثم اطبع النتيجة.',bossCheck:function(c){return /def\\s+greet\\s*\\(/.test(c)&&/return\\s+/.test(c)&&/print\\s*\\(/.test(c)}}
 };
 return C[l.id]||C[1];
}

function paStage(l,idx,state){
 const cfg=paConfig(l), total=7, key=['story','discover','try','play','challenge','boss','reward'][idx];
 let body='';
 if(key==='story') body='<div class="pa-scene"><span class="big">'+cfg.icon+'</span><h3>🎬 بداية الفصل</h3><p>'+paEsc(cfg.story)+'</p></div><div class="pa-hint">🎯 ما مطلوب منك تحفظ. امشِ مع علي خطوة خطوة، وكل كلمة جديدة نشرحها قبل استخدامها.</div>';
 if(key==='discover') body='<div class="bigcard"><h3>🧠 نتعلمها من الصفر</h3><p>'+paEsc(cfg.discover)+'</p>'+cfg.deep+'</div>';
 if(key==='try') body='<div class="bigcard"><h3>💻 جرّب مع علي</h3><p>هذا مثال جاهز. اقرأه أولاً، ثم شغله. بعد ذلك غيّر شيئاً بسيطاً.</p><textarea id="paTryCode" class="pa-input">'+paEsc(cfg.tryCode)+'</textarea><button class="primary" id="paTryBtn" style="width:100%;margin-top:9px">▶ تجربة الكود</button><div id="paTryOut" class="pa-feedback"></div></div>';
 if(key==='play') body='<div class="bigcard"><h3>🎮 سؤال داخل القصة</h3><p>'+paEsc(l.question)+'</p><div id="paChoices">'+l.answers.map(function(a,i){return '<button class="pa-choice" data-i="'+i+'">'+paEsc(a)+'</button>'}).join('')+'</div><div id="paPlayOut" class="pa-feedback"></div></div>';
 if(key==='challenge') body='<div class="bigcard"><h3>⚔️ تحدي علي</h3><p>'+paEsc(cfg.challenge)+'</p><textarea id="paChallenge" class="pa-input" placeholder="اكتب كود Python هنا..."></textarea><button class="primary" id="paCheckChallenge" style="width:100%;margin-top:9px">🛠️ فحص الحل</button><div id="paChallengeOut" class="pa-feedback"></div><div id="paHint" class="pa-hint" style="display:none">💡 '+paEsc(cfg.hint)+'</div></div>';
 if(key==='boss') body='<div class="pa-scene"><span class="big">🏆</span><h3>اختبار الزعيم</h3><p>'+paEsc(cfg.boss)+'</p></div><textarea id="paBoss" class="pa-input" placeholder="اكتب حلك..."></textarea><button class="primary" id="paCheckBoss" style="width:100%;margin-top:9px">⚔️ افتح البوابة</button><div id="paBossOut" class="pa-feedback"></div><div id="paBossHint" class="pa-hint" style="display:none">💡 ارجع إلى خطوة "نتعلمها من الصفر" إذا احتجت.</div>';
 if(key==='reward') body='<div class="pa-scene"><span class="big">🎉</span><h3>الفصل اكتمل!</h3><p>علي تقدم خطوة جديدة، وأنت أيضاً. المهم أنك فهمت الفكرة قبل حفظ الكود.</p></div><div class="pa-reward"><div>⭐ XP<b>+'+l.xp+'</b></div><div>🔓 التقدم<b>+1 فصل</b></div></div>';
 $('sheetText').innerHTML='<div><div class="pa-progress"><i style="width:'+((idx+1)/total*100)+'%"></i></div>'+body+'<div class="pa-hint">الفصل '+l.id+' · المرحلة '+(idx+1)+' من '+total+'</div></div>';
 $('sheetExtra').innerHTML='<div class="pa-nav"><button class="secondary" id="paBack" '+(idx===0?'disabled':'')+'>← السابق</button><button class="primary" id="paNext">'+(idx===6?'🏆 استلام المكافأة':'التالي →')+'</button></div>';
 state.ready=(key==='story'||key==='discover');
 $('paNext').onclick=async function(){if(key==='reward'){await completeLesson(l.id);return}if(!state.ready){toast('🎯 خلّص الخطوة الحالية أولاً');return}state.idx++;paStage(l,state.idx,state)};
 $('paBack').onclick=function(){if(idx>0){state.idx--;paStage(l,state.idx,state)}};
 if(key==='try') $('paTryBtn').onclick=function(){const c=$('paTryCode').value,o=$('paTryOut');if(c.trim()){o.textContent='🖥️ تجربة ناجحة: '+(cfg.expected||'الكود جاهز للتجربة.');o.style.color='#35f0ad';state.ready=true}else{o.textContent='❌ اكتب شيئاً أولاً.';o.style.color='#ff6e7d'}};
 if(key==='play') document.querySelectorAll('.pa-choice').forEach(function(b){b.onclick=function(){const ok=Number(b.dataset.i)===l.correct;b.classList.toggle('good',ok);b.classList.toggle('bad',!ok);$('paPlayOut').textContent=ok?'🎉 صحيح! فهمت الفكرة.':'❌ مو هذا. اقرأ الشرح وحاول مرة ثانية.';$('paPlayOut').style.color=ok?'#35f0ad':'#ff6e7d';if(ok)state.ready=true}});
 if(key==='challenge') $('paCheckChallenge').onclick=function(){const ok=cfg.check($('paChallenge').value);$('paChallengeOut').textContent=ok?'🎉 ممتاز! البوابة تقترب من الفتح.':'❌ بعدك قريب. جرّب مرة ثانية.';$('paChallengeOut').style.color=ok?'#35f0ad':'#ff6e7d';$('paHint').style.display=ok?'none':'block';if(ok)state.ready=true};
 if(key==='boss') $('paCheckBoss').onclick=function(){const ok=cfg.bossCheck($('paBoss').value);$('paBossOut').textContent=ok?'🏆 نجحت! البوابة انفتحت.':'❌ الحل يحتاج تعديل بسيط.';$('paBossOut').style.color=ok?'#35f0ad':'#ff6e7d';$('paBossHint').style.display=ok?'none':'block';if(ok)state.ready=true};
}

function openLesson(id){
 const l=lessons.find(function(x){return x.id===id});if(!l)return;
 const index=lessons.findIndex(function(x){return x.id===id});
 if(index>0&&!completedLessons.includes(lessons[index-1].id)){toast('🔒 أكمل الفصل السابق أولاً');return}
 openSheet(l.title,'<p>'+paEsc(l.desc)+'</p>','');
 const state={idx:0,ready:false};
 if(completedLessons.includes(id)){$('sheetText').innerHTML='<div class="pa-scene"><span class="big">✓</span><h3>هذا الفصل مكتمل</h3><p>تقدر تعيد المغامرة للتدريب، لكن المكافأة ما تنحسب مرتين.</p></div>';$('sheetExtra').innerHTML='<button class="close" id="paReplay">🔁 إعادة التدريب</button>';$('paReplay').onclick=function(){paStage(l,0,state)};return}
 paStage(l,0,state);
}

async function completeLesson(id){
 if(completedLessons.includes(id)){toast('هذا الفصل مكتمل بالفعل');return}
 try{
  const r=await api('/lessons/'+id+'/complete',{method:'POST'});
  if(!r||!r.player)throw new Error('تعذر حفظ إكمال الدرس');
  const p=r.player;xp=Number(p.xp)||0;coins=Number(p.coins)||0;progress=Number(p.progress)||0;skillPoints=Number(p.skillPoints)||0;
  completedLessons=Array.isArray(p.completedLessons)?p.completedLessons.map(Number):completedLessons;
  if(p.skillLevels)Object.assign(skillLevels,p.skillLevels);if(p.gameState)mergeGameState(p.gameState);
  renderAll();renderPersistentUI();toast('🎉 تمت المهمة! +'+((lessons.find(function(x){return x.id===id})||{}).xp||0)+' XP');setTimeout(closeSheet,700)
 }catch(e){toast(e.message||'تعذر إكمال الدرس')}
}

/* Python Adventure — Adventure Lesson System V2 */
(function(){
const st=document.createElement('style');
st.textContent='.pa-progress{height:7px;background:#12343b;border-radius:99px;overflow:hidden;margin:8px 0 14px}.pa-progress i{display:block;height:100%;background:linear-gradient(90deg,#35f0ad,#3ddcff);transition:.3s}.pa-scene{padding:18px;border:1px solid #1a5961;border-radius:20px;background:radial-gradient(circle at 80% 0,#0c3b3d,#071c22 65%);text-align:center}.pa-scene .big{font-size:48px;display:block}.pa-scene h3{margin:8px 0;color:#35f0ad}.pa-scene p{color:#d4e5e4;line-height:1.8;font-size:13px}.pa-code,.pa-input{direction:ltr;text-align:left;background:#020c10;color:#dfffea;border:1px solid #164b54;border-radius:15px;padding:13px;font:14px/1.7 Consolas,monospace}.pa-code{white-space:pre-wrap}.pa-input{width:100%;min-height:125px;resize:vertical}.pa-choice{width:100%;text-align:right;margin:7px 0;padding:12px;border-radius:14px;border:1px solid #1b5660;background:#08242b;color:#eefafa}.pa-choice.good{border-color:#35f0ad}.pa-choice.bad{border-color:#ff6e7d}.pa-feedback{min-height:25px;color:#c9dfdd;font-size:12px;line-height:1.7}.pa-hint{margin-top:8px;padding:10px 12px;border-radius:13px;background:#092a31;border:1px dashed #24727a;color:#b7cecf;font-size:11px}.pa-nav{display:flex;gap:8px;margin-top:12px}.pa-nav button{flex:1}.pa-reward{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.pa-reward div{padding:14px;border-radius:16px;background:#08362f;border:1px solid #1c765f;text-align:center}.pa-reward b{display:block;color:#35f0ad;font-size:18px;margin-top:4px}'
document.head.appendChild(st);
})();

function openSheet(title,html,extra){
 const o=$('overlay'); if(!o)return; $('sheetTitle').textContent=title; $('sheetText').innerHTML=html; $('sheetExtra').innerHTML=extra||''; o.classList.add('open');
}
function closeSheet(){const o=$('overlay');if(o)o.classList.remove('open')}
function paEsc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]})}

function renderLessons(){
 const list=$('lessonList'); if(!list)return;
 list.innerHTML=lessons.map(function(l,i){var done=completedLessons.includes(l.id),unlocked=i===0||completedLessons.includes(lessons[i-1].id);return '<article class="lesson" data-lesson="'+l.id+'" style="opacity:'+(unlocked?1:.5)+';cursor:'+(unlocked?'pointer':'not-allowed')+'"><div class="thumb">🐍</div><div><h3>'+(done?'✓ ':unlocked?'▶ ':'🔒 ')+paEsc(l.title.replace(/^\S+\s/,''))+'</h3><p>'+paEsc(l.desc)+'</p></div><div class="tag">'+(done?'✓ مكتمل':l.xp+' XP')+'</div></article>'}).join('');
 list.querySelectorAll('[data-lesson]').forEach(function(el){el.onclick=function(){openLesson(Number(el.dataset.lesson))}});
}

function paConfig(l){
 if(l.id===2)return {icon:'📦',story:'وصلت إلى صندوق الأدوات. الحارس يقول: أحتاج مكاناً أخزن فيه اسم اللاعب.',discover:'المتغير مثل صندوق له اسم وقيمة. مثال: name = "Ali". الاسم هو المكان والقيمة هي البيانات.',tryCode:'name = "Dragon"\nprint(name)',expected:'Dragon',challenge:'اكتب متغيراً باسم coins واجعل قيمته 100.',check:function(c){return /\\bcoins\\s*=\\s*100\\b/.test(c)},hint:'اسم المتغير على اليسار والقيمة على اليمين: coins = 50',boss:'الصندوق يحتاج health = 100 و coins = 50 و energy = 80.',bossCheck:function(c){return /health\\s*=\\s*100/.test(c)&&/coins\\s*=\\s*50/.test(c)&&/energy\\s*=\\s*80/.test(c)}};
 if(l.id===1)return {icon:'🧰',story:'وجدت بوابة قديمة. حتى تفتح، تحتاج أن تفهم أول أمر من أوامر Python.',discover:'print() يعرض شيئاً على الشاشة. جرّب قراءة الكود قبل الضغط على الزر.',tryCode:'print("I am a Python adventurer!")',expected:'I am a Python adventurer!',challenge:'اكتب print() لتعرض كلمة Python.',check:function(c){return /print\\s*\\(\\s*[\"\']Python[\"\']\\s*\\)/.test(c)},hint:'ابدأ بـ print( ثم ضع كلمة Python بين علامات اقتباس.',boss:'البوابة تريد تحية Python: اكتب print("Welcome, Python!")',bossCheck:function(c){return /print\\s*\\(\\s*[\"\']Welcome, Python![\"\']\\s*\\)/.test(c)}};
 return {icon:'🐍',story:'مهمة جديدة ظهرت في الخريطة. تعلّم المهارة من المثال ثم استخدمها لفتح البوابة.',discover:l.explain,tryCode:l.code,expected:'',challenge:l.question,check:function(c){return c.trim().length>0},hint:'اقرأ المثال مرة ثانية وغيّر جزءاً واحداً فقط ثم جرّب.',boss:'اكتب حلاً بسيطاً يستخدم المهارة التي تعلمتها في هذا الدرس.',bossCheck:function(c){return c.trim().length>5}};
}

function paStage(l,idx,state){
 var cfg=paConfig(l), total=7, key=['story','discover','try','play','challenge','boss','reward'][idx], body='';
 if(key==='story')body='<div class="pa-scene"><span class="big">'+cfg.icon+'</span><h3>🎬 ادخل المغامرة</h3><p>'+paEsc(cfg.story)+'</p></div><div class="pa-hint">🎯 هدفك: افهم الفكرة، جرّبها، ثم افتح البوابة.</div>';
 if(key==='discover')body='<div class="bigcard"><h3>🧠 اكتشف الفكرة</h3><p>'+paEsc(cfg.discover)+'</p><pre class="pa-code">'+paEsc(l.code)+'</pre></div><div class="pa-hint">💡 لا تحفظ الكود الآن. حاول تفهم: شنو يدخل؟ شنو يطلع؟</div>';
 if(key==='try')body='<div class="bigcard"><h3>💻 جرّب بنفسك</h3><p>غيّر الكود ثم اضغط تجربة.</p><textarea id="paTryCode" class="pa-input">'+paEsc(cfg.tryCode)+'</textarea><button class="primary" id="paTryBtn" style="width:100%;margin-top:9px">▶ تجربة الكود</button><div id="paTryOut" class="pa-feedback"></div></div>';
 if(key==='play')body='<div class="bigcard"><h3>🎮 العب</h3><p>'+paEsc(l.question)+'</p><div id="paChoices">'+l.answers.map(function(a,i){return '<button class="pa-choice" data-i="'+i+'">'+paEsc(a)+'</button>'}).join('')+'</div><div id="paPlayOut" class="pa-feedback"></div></div>';
 if(key==='challenge')body='<div class="bigcard"><h3>⚔️ التحدي</h3><p>'+paEsc(cfg.challenge)+'</p><textarea id="paChallenge" class="pa-input" placeholder="اكتب كود Python هنا..."></textarea><button class="primary" id="paCheckChallenge" style="width:100%;margin-top:9px">🛠️ فحص الحل</button><div id="paChallengeOut" class="pa-feedback"></div><div id="paHint" class="pa-hint" style="display:none">💡 '+paEsc(cfg.hint)+'</div></div>';
 if(key==='boss')body='<div class="pa-scene"><span class="big">🏆</span><h3>اختبار الزعيم</h3><p>'+paEsc(cfg.boss)+'</p></div><textarea id="paBoss" class="pa-input" placeholder="اكتب حلك..."></textarea><button class="primary" id="paCheckBoss" style="width:100%;margin-top:9px">⚔️ افتح البوابة</button><div id="paBossOut" class="pa-feedback"></div><div id="paBossHint" class="pa-hint" style="display:none">💡 ارجع للمثال في خطوة الاكتشاف إذا احتجت.</div>';
 if(key==='reward')body='<div class="pa-scene"><span class="big">🎉</span><h3>مهمة مكتملة!</h3><p>أنت ما حفظت معلومة فقط؛ استخدمتها داخل موقف.</p></div><div class="pa-reward"><div>⭐ XP<b>+'+l.xp+'</b></div><div>🔓 التقدم<b>+1 درس</b></div></div>';
 $('sheetText').innerHTML='<div><div class="pa-progress"><i style="width:'+((idx+1)/total*100)+'%"></i></div><div>'+body+'</div><div class="pa-hint">المرحلة '+(idx+1)+' من '+total+' · '+key+'</div></div>';
 $('sheetExtra').innerHTML='<div class="pa-nav"><button class="secondary" id="paBack" '+(idx===0?'disabled':'')+'>← السابق</button><button class="primary" id="paNext">'+(idx===6?'🏆 استلام المكافأة':'التالي →')+'</button></div>';
 state.ready=(key==='story'||key==='discover');
 $('paNext').onclick=async function(){if(key==='reward'){await completeLesson(l.id);return}if(!state.ready){toast('🎯 كمّل التحدي الحالي أولاً');return}state.idx++;paStage(l,state.idx,state)};
 $('paBack').onclick=function(){if(idx>0){state.idx--;paStage(l,state.idx,state)}};
 if(key==='try')$('paTryBtn').onclick=function(){var c=$('paTryCode').value,o=$('paTryOut');if(c.indexOf('print')>=0){o.textContent='🖥️ الناتج التجريبي: '+(cfg.expected||'تم العثور على print()');o.style.color='#35f0ad';state.ready=true}else{o.textContent='❌ ما لقيت print(). عدّل الكود وحاول مرة ثانية.';o.style.color='#ff6e7d'}};
 if(key==='play')document.querySelectorAll('.pa-choice').forEach(function(b){b.onclick=function(){var ok=Number(b.dataset.i)===l.correct;b.classList.toggle('good',ok);b.classList.toggle('bad',!ok);$('paPlayOut').textContent=ok?'🎉 صحيح! البوابة تفتح.':'❌ مو هذا. حاول مرة ثانية.';$('paPlayOut').style.color=ok?'#35f0ad':'#ff6e7d';if(ok)state.ready=true}});
 if(key==='challenge')$('paCheckChallenge').onclick=function(){var ok=cfg.check($('paChallenge').value);$('paChallengeOut').textContent=ok?'🎉 ممتاز! فهمت الفكرة.':'❌ بعدك قريب. جرّب مرة ثانية.';$('paChallengeOut').style.color=ok?'#35f0ad':'#ff6e7d';$('paHint').style.display=ok?'none':'block';if(ok)state.ready=true};
 if(key==='boss')$('paCheckBoss').onclick=function(){var ok=cfg.bossCheck($('paBoss').value);$('paBossOut').textContent=ok?'🏆 نجحت! البوابة انفتحت.':'❌ الحل يحتاج تعديل بسيط.';$('paBossOut').style.color=ok?'#35f0ad':'#ff6e7d';$('paBossHint').style.display=ok?'none':'block';if(ok)state.ready=true};
}

function openLesson(id){
 var l=lessons.find(function(x){return x.id===id});if(!l)return;var index=lessons.findIndex(function(x){return x.id===id});if(index>0&&!completedLessons.includes(lessons[index-1].id)){toast('🔒 أكمل الدرس السابق أولاً');return}
 openSheet(l.title,'<p>'+paEsc(l.desc)+'</p>','');var state={idx:0,ready:false};
 if(completedLessons.includes(id)){$('sheetText').innerHTML='<div class="pa-scene"><span class="big">✓</span><h3>هذا الدرس مكتمل</h3><p>تقدر تعيد المغامرة للتدريب، لكن المكافأة ما تنحسب مرتين.</p></div>';$('sheetExtra').innerHTML='<button class="close" id="paReplay">🔁 إعادة التدريب</button>';$('paReplay').onclick=function(){paStage(l,0,state)};return}
 paStage(l,0,state);
}

async function completeLesson(id){
 if(completedLessons.includes(id)){toast('هذا الدرس مكتمل بالفعل');return}
 try{var r=await api('/lessons/'+id+'/complete',{method:'POST'});if(!r||!r.player)throw new Error('تعذر حفظ إكمال الدرس');var p=r.player;xp=Number(p.xp)||0;coins=Number(p.coins)||0;progress=Number(p.progress)||0;skillPoints=Number(p.skillPoints)||0;completedLessons=Array.isArray(p.completedLessons)?p.completedLessons.map(Number):completedLessons;if(p.skillLevels)Object.assign(skillLevels,p.skillLevels);if(p.gameState)mergeGameState(p.gameState);renderAll();renderPersistentUI();toast('🎉 تمت المهمة! +'+((lessons.find(function(x){return x.id===id})||{}).xp||0)+' XP');setTimeout(closeSheet,700)}catch(e){toast(e.message||'تعذر إكمال الدرس')}}

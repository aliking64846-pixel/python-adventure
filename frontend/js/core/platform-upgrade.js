/* Python Adventure — Platform Upgrade v1
   Adds a real learning-platform layer without replacing the existing game/backend.
*/
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const today=()=>new Date().toISOString().slice(0,10);

  const tracks=[
    {id:'start',icon:'🐣',title:'Python من الصفر',desc:'الأساسيات التي تحتاجها قبل كتابة برامج حقيقية.',units:['ما هي Python؟','المتغيرات','أنواع البيانات','print و input']},
    {id:'logic',icon:'🧠',title:'منطق البرمجة',desc:'اجعل البرنامج يفكر ويقرر ويكرر.',units:['if / elif / else','for و while','المقارنات والمنطق','حل المشاكل']},
    {id:'build',icon:'🧩',title:'بناء البرامج',desc:'الدوال والبيانات وتنظيم المشاريع.',units:['الدوال','القوائم والقواميس','التعامل مع الملفات','الأخطاء والاستثناءات']},
    {id:'oop',icon:'🏗️',title:'Python الاحترافية',desc:'انتقل من أمثلة صغيرة إلى كود منظم.',units:['OOP','Modules و Packages','Decorators','Type Hints']},
    {id:'web',icon:'🌐',title:'Web & APIs',desc:'ابنِ خدمات ومواقع حقيقية باستخدام Python.',units:['HTTP و JSON','REST APIs','Flask / FastAPI','قواعد البيانات']},
    {id:'ai',icon:'🤖',title:'Python للذكاء الاصطناعي',desc:'أساسيات البيانات والأتمتة والـAI.',units:['NumPy','Pandas','Machine Learning','AI Projects']}
  ];

  const daily=[
    {q:'ما ناتج الكود؟\nprint(2 + 3)',a:['23','5','6','خطأ'],c:1,why:'عامل + يجمع رقمين عندما تكون القيم أعداداً.'},
    {q:'أي كلمة تنشئ دالة في Python؟',a:['func','def','make','lambda'],c:1,why:'def تبدأ تعريف الدالة.'},
    {q:'ما نوع القيمة True؟',a:['str','int','bool','list'],c:2,why:'True و False قيم منطقية من نوع bool.'},
    {q:'أي حلقة مناسبة للتكرار على قائمة؟',a:['for','if','try','def'],c:0,why:'for مناسبة للمرور على عناصر iterable مثل list.'},
    {q:'ماذا تفعل input()؟',a:['تحذف ملفاً','تستقبل إدخالاً','تنشئ دالة','توقف البرنامج'],c:1,why:'input تستقبل إدخال المستخدم كنص.'},
    {q:'أي بنية تربط key بقيمة؟',a:['list','set','dict','str'],c:2,why:'القاموس dict يخزن أزواج المفتاح والقيمة.'},
    {q:'أي كلمة تعيد قيمة من الدالة؟',a:['send','return','back','give'],c:1,why:'return تعيد قيمة من الدالة إلى مكان الاستدعاء.'}
  ];

  const projects=[
    {id:'calc',icon:'🧮',title:'آلة حاسبة ذكية',level:'مبتدئ',xp:250,desc:'برنامج يستقبل رقمين وعمليّة ويطبع النتيجة.',skills:['input','if','functions'],steps:['استقبل الرقم الأول','استقبل العملية','نفّذ الشرط','اطبع النتيجة']},
    {id:'quiz',icon:'🎯',title:'لعبة أسئلة Python',level:'متوسط',xp:450,desc:'ابنِ لعبة أسئلة تحسب النقاط وتعرض النتيجة.',skills:['lists','loops','functions'],steps:['جهز الأسئلة','اعرض الخيارات','تحقق من الإجابة','احسب النقاط']},
    {id:'todo',icon:'📝',title:'مدير مهام',level:'متوسط',xp:650,desc:'قائمة مهام قابلة للإضافة والحذف والحفظ.',skills:['dict','files','errors'],steps:['أضف مهمة','اعرض المهام','احذف مهمة','احفظ البيانات']},
    {id:'api',icon:'🌐',title:'Python API',level:'متقدم',xp:900,desc:'خدمة API صغيرة تستقبل JSON وتعيد بيانات منظمة.',skills:['http','json','fastapi'],steps:['أنشئ endpoint','اقرأ JSON','تحقق من البيانات','أعد response']},
    {id:'ai',icon:'🤖',title:'مشروع AI',level:'متقدم',xp:1200,desc:'مشروع Python يجهز البيانات ويستدعي نموذجاً أو خدمة AI.',skills:['data','api','ai'],steps:['جهز البيانات','ابنِ طبقة الخدمة','أضف الواجهة','اختبر النتائج']}
  ];

  const quiz=[
    {q:'ما ناتج: x = 4 ثم print(x * 2)؟',a:['6','8','42'],c:1},
    {q:'أي نوع يمثل [1, 2, 3]؟',a:['dict','list','bool'],c:1},
    {q:'ما فائدة try/except؟',a:['تكرار الكود','معالجة الأخطاء','إنشاء متغير'],c:1},
    {q:'أي صيغة صحيحة لتعريف دالة؟',a:['function hi():','def hi():','new hi():'],c:1},
    {q:'ما الذي تعيده input() افتراضياً؟',a:['str','int','bool'],c:0}
  ];

  function platformState(){
    gameState.platform=gameState.platform||{};
    const p=gameState.platform;
    p.streak=Number(p.streak)||0;
    p.lastDaily=p.lastDaily||'';
    p.dailyDone=p.dailyDone||false;
    p.dailyKey=p.dailyKey||'';
    p.review=Array.isArray(p.review)?p.review:[];
    p.projects=p.projects||{};
    p.placement=p.placement||{done:false,score:0};
    p.totalSessions=Number(p.totalSessions)||0;
    return p;
  }

  function injectStyle(){
    if($('platformUpgradeStyle'))return;
    const s=document.createElement('style');s.id='platformUpgradeStyle';
    s.textContent=`
      #academy.view{padding-bottom:110px}
      .academyHero{padding:20px;border:1px solid #1d655d;border-radius:24px;background:radial-gradient(circle at 10% 0,rgba(53,240,173,.18),transparent 38%),linear-gradient(145deg,#08252d,#041217);margin-bottom:14px;box-shadow:0 15px 45px rgba(0,0,0,.18)}
      .academyHero h1{font-size:26px;margin:0 0 8px}.academyHero p{color:#a9c5c7;line-height:1.8;font-size:13px}
      .academyStats{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:15px}.astat{padding:10px 5px;border:1px solid #174b54;border-radius:14px;background:#061920;text-align:center}.astat b{display:block;color:#5ff2bd;font-size:18px}.astat small{color:#8eaeb1;font-size:9px}
      .academyTabs{display:flex;gap:7px;overflow:auto;padding:2px 0 10px;scrollbar-width:none}.academyTabs::-webkit-scrollbar{display:none}.academyTab{flex:0 0 auto;padding:10px 13px;border:1px solid #194b54;border-radius:13px;background:#071b21;color:#a9c5c7}.academyTab.active{border-color:#35f0ad;background:#0a3a32;color:#d9fff1}
      .academySection{display:none}.academySection.active{display:block}
      .track{padding:15px;margin:9px 0;border:1px solid #164b54;border-radius:18px;background:linear-gradient(145deg,#071c23,#041116);cursor:pointer}.trackTop{display:flex;gap:11px;align-items:center}.trackIcon{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:#0a2b31;font-size:22px}.track h3{margin:0 0 4px;font-size:14px}.track p{margin:0;color:#8eabad;font-size:11px;line-height:1.6}.trackMeta{display:flex;justify-content:space-between;margin-top:11px;color:#72d8b5;font-size:10px}.trackBar{height:6px;background:#102f35;border-radius:99px;overflow:hidden;margin-top:7px}.trackBar i{display:block;height:100%;background:linear-gradient(90deg,#35f0ad,#3ddcff)}
      .challenge{padding:17px;border:1px solid #2b7c6c;border-radius:20px;background:radial-gradient(circle at 100% 0,rgba(255,216,74,.10),transparent 40%),#071c22}.challenge pre{white-space:pre-wrap;direction:rtl;font:15px/1.8 Tahoma;color:#eafffa;margin:8px 0 14px}.challengeOpt{width:100%;padding:12px;margin:5px 0;border:1px solid #204e58;border-radius:13px;background:#06171d;color:#dffaf2;text-align:right}.challengeOpt.correct{border-color:#35f0ad;background:#093b30}.challengeOpt.wrong{border-color:#ff6e7d;background:#3a171c}.challengeResult{margin-top:10px;color:#9deed1;line-height:1.7;font-size:12px}
      .project{padding:15px;margin:9px 0;border:1px solid #174d57;border-radius:18px;background:#061920}.projectTop{display:flex;gap:10px}.projectIcon{font-size:27px}.project h3{margin:0;font-size:15px}.project p{color:#98b5b7;font-size:11px;line-height:1.7;margin:4px 0}.project .pill{display:inline-block;padding:4px 7px;border-radius:9px;background:#0b3030;color:#75e9c1;font-size:9px;margin:3px}
      .projectSteps{display:grid;gap:6px;margin-top:10px}.projectStep{padding:8px 10px;border-radius:10px;background:#07151b;color:#9ebabc;font-size:11px}.projectStep.done{color:#6ff2bd;border:1px solid #1f745d}
      .rank{display:flex;align-items:center;gap:10px;padding:12px;margin:7px 0;border:1px solid #174b54;border-radius:14px;background:#061820}.rankNo{width:28px;text-align:center;color:#ffd84a;font-weight:900}.rankAvatar{width:38px;height:38px;border-radius:12px;background:#0a3032;display:grid;place-items:center}.rankInfo{flex:1}.rankInfo b{display:block;font-size:12px}.rankInfo small{color:#86a9ad}.rankXP{color:#5ff2bd;font-weight:900;font-size:12px}
      .statGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.statCard{padding:15px;border:1px solid #174b54;border-radius:17px;background:#061820}.statCard b{font-size:22px;color:#67efbe}.statCard p{margin:5px 0 0;color:#91aaad;font-size:10px}
      .skillTree{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.skillNode{padding:13px;border:1px solid #174d57;border-radius:16px;background:#061820}.skillNode b{display:block;margin-bottom:5px}.skillNode small{color:#8ca8aa}.skillNode i{display:block;height:5px;background:#103039;border-radius:99px;margin-top:9px;overflow:hidden}.skillNode i span{display:block;height:100%;background:#35f0ad}
      .reviewItem{padding:12px;border:1px solid #4e373d;border-radius:14px;background:#1c1115;margin:7px 0}.reviewItem b{display:block;color:#ffb0ba;font-size:12px}.reviewItem p{color:#caaeb3;font-size:11px;margin:5px 0}.emptyState{padding:25px;text-align:center;color:#829b9e;border:1px dashed #24505a;border-radius:17px}
      .placementQ{padding:15px;border:1px solid #174b54;border-radius:17px;background:#061820;margin:8px 0}.placementQ b{display:block;margin-bottom:10px;font-size:13px}.placementOpt{padding:10px;border:1px solid #24515a;border-radius:11px;background:#07171d;color:#cfe6e4;text-align:right;width:100%;margin:4px 0}.placementOpt.sel{border-color:#35f0ad;background:#0a302b}
      @media(max-width:420px){.academyStats{grid-template-columns:repeat(2,1fr)}.academyHero h1{font-size:22px}}
    `;
    document.head.appendChild(s);
  }

  function ensurePage(){
    if($('academy'))return;
    const main=document.querySelector('#app main');
    if(!main)return;
    const sec=document.createElement('section');
    sec.id='academy';sec.className='view page';
    sec.innerHTML=`
      <div class="academyHero">
        <h1>🚀 أكاديمية Python</h1>
        <p>من أول سطر Python إلى بناء مشاريع حقيقية. تعلم، طبّق، راجع أخطاءك، واصعد خطوة بخطوة.</p>
        <div class="academyStats">
          <div class="astat"><b id="aXP">0</b><small>XP</small></div>
          <div class="astat"><b id="aLevel">1</b><small>المستوى</small></div>
          <div class="astat"><b id="aStreak">0🔥</b><small>السلسلة</small></div>
          <div class="astat"><b id="aDone">0%</b><small>التقدم</small></div>
        </div>
      </div>
      <div class="academyTabs">
        <button class="academyTab active" data-atab="path">🗺️ المسار</button>
        <button class="academyTab" data-atab="daily">⚡ اليومي</button>
        <button class="academyTab" data-atab="projects">🛠️ المشاريع</button>
        <button class="academyTab" data-atab="skills">🌳 المهارات</button>
        <button class="academyTab" data-atab="review">🔁 المراجعة</button>
        <button class="academyTab" data-atab="rank">🏆 الترتيب</button>
        <button class="academyTab" data-atab="stats">📊 إحصائيات</button>
      </div>
      <div class="academySection active" data-section="path" id="academyPath"></div>
      <div class="academySection" data-section="daily" id="academyDaily"></div>
      <div class="academySection" data-section="projects" id="academyProjects"></div>
      <div class="academySection" data-section="skills" id="academySkills"></div>
      <div class="academySection" data-section="review" id="academyReview"></div>
      <div class="academySection" data-section="rank" id="academyRank"></div>
      <div class="academySection" data-section="stats" id="academyStats"></div>
    `;
    main.appendChild(sec);
    document.querySelector('.bottom')?.insertAdjacentHTML('beforeend','<button class="nav" data-nav="academy"><span>🚀</span>الأكاديمية</button>');
  }

  function openAcademy(tab){
    ensurePage();injectStyle();
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    $('academy')?.classList.add('active');
    document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.nav==='academy'));
    document.querySelectorAll('.academyTab').forEach(b=>b.classList.toggle('active',b.dataset.atab===tab));
    document.querySelectorAll('.academySection').forEach(s=>s.classList.toggle('active',s.dataset.section===tab));
    renderAcademy();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function bindTabs(){
    document.querySelectorAll('.academyTab').forEach(b=>b.onclick=()=>openAcademy(b.dataset.atab));
  }

  function renderHeader(){
    const p=platformState();
    if($('aXP'))$('aXP').textContent=Number(xp)||0;
    if($('aLevel'))$('aLevel').textContent=Math.max(1,Math.floor((Number(xp)||0)/500)+1);
    if($('aStreak'))$('aStreak').textContent=(p.streak||0)+'🔥';
    if($('aDone'))$('aDone').textContent=Math.round(Number(progress)||0)+'%';
  }

  function trackProgress(t){
    const ids=t.id==='start'?[1,2,3,4]:t.id==='logic'?[5,6]:t.id==='build'?[7,8,9,10]:[];
    const done=ids.filter(id=>completedLessons.includes(id)).length;
    if(ids.length)return Math.round(done/ids.length*100);
    const base={oop:0,web:0,ai:0}[t.id]||0;
    return base;
  }

  function renderPath(){
    const box=$('academyPath');if(!box)return;
    box.innerHTML='<h2 style="margin:6px 0 8px">طريقك إلى Python الاحترافية</h2>'+tracks.map(t=>{
      const pct=trackProgress(t);
      return `<article class="track" data-track="${t.id}">
        <div class="trackTop"><div class="trackIcon">${t.icon}</div><div><h3>${esc(t.title)}</h3><p>${esc(t.desc)}</p></div></div>
        <div class="trackMeta"><span>${pct}% مكتمل</span><span>${t.units.length} وحدات</span></div>
        <div class="trackBar"><i style="width:${pct}%"></i></div>
      </article>`;
    }).join('')+`<button class="smallbtn" id="placementBtn" style="width:100%;margin-top:8px">🎯 اختبر مستواي قبل المتابعة</button>`;
    box.querySelectorAll('[data-track]').forEach(el=>el.onclick=()=>{
      const t=tracks.find(x=>x.id===el.dataset.track);if(!t)return;
      if(t.id==='start'||t.id==='logic'||t.id==='build'){openAcademyLessonPicker(t)}
      else showPlatformSheet('🔒 '+t.title,`<p>هذا المسار جاهز كخطة متقدمة. أكمل المراحل الأساسية أولاً، ثم سنفتح الوحدات المتقدمة واحدةً تلو الأخرى.</p><p>الوحدات: ${t.units.map(esc).join(' • ')}</p>`);
    });
    $('placementBtn')?.addEventListener('click',openPlacement);
  }

  function openAcademyLessonPicker(t){
    const ids=t.id==='start'?[1,2,3,4]:t.id==='logic'?[5,6]:[7,8,9,10];
    const html=ids.map(id=>{const l=lessons.find(x=>x.id===id);if(!l)return '';const done=completedLessons.includes(id);return `<button class="track" data-openlesson="${id}" style="width:100%;text-align:right"><b>${done?'✅':'▶️'} ${esc(l.title)}</b><p>${esc(l.desc)} • +${l.xp} XP</p></button>`}).join('');
    showPlatformSheet('📚 '+t.title,html);
    document.querySelectorAll('[data-openlesson]').forEach(b=>b.onclick=()=>{closeSheet?.();openLesson(Number(b.dataset.openlesson));});
  }

  function getDaily(){
    const p=platformState(), d=new Date(), idx=(d.getDate()+d.getMonth()*3+d.getFullYear())%daily.length;
    const key=today();
    if(p.dailyKey!==key){p.dailyKey=key;p.dailyDone=false;}
    return daily[idx];
  }

  async function reward(amount,coinAmount){
    const oldXp=Number(xp)||0,oldCoins=Number(coins)||0;
    xp=oldXp+amount;coins=oldCoins+(coinAmount||0);
    progress=Math.min(100,Math.max(Number(progress)||0,Math.round((completedLessons.length/lessons.length)*100)));
    await putPlayer({xp,coins,progress});
    renderAll();renderPersistentUI();renderHeader();
  }

  async function completeDaily(){
    const p=platformState();if(p.dailyDone){toast('اليوميات مكتملة بالفعل');return}
    const q=getDaily();p.dailyDone=true;
    const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
    const y=yesterday.toISOString().slice(0,10);
    p.streak=(p.lastDaily===y)?(p.streak||0)+1:1;
    p.lastDaily=today();
    await reward(75,20);
    await putGameState(collectGameState());
    renderDaily();
    toast('⚡ +75 XP و +20 عملة — سلسلة '+p.streak+'🔥');
  }

  function renderDaily(){
    const box=$('academyDaily');if(!box)return;
    const p=platformState(),q=getDaily(),done=p.dailyDone;
    box.innerHTML=`<div class="challenge"><div style="display:flex;justify-content:space-between"><b>⚡ تحدي اليوم</b><span>+75 XP</span></div><pre>${esc(q.q)}</pre>${q.a.map((a,i)=>`<button class="challengeOpt" data-daily="${i}" ${done?'disabled':''}>${esc(a)}</button>`).join('')}<div id="dailyResult" class="challengeResult">${done?'✅ أنجزت تحدي اليوم. ارجع غداً لتحافظ على السلسلة.':'اختر إجابة واحدة. لديك محاولة تدريبية ثم يمكنك استلام المكافأة.'}</div></div>`;
    box.querySelectorAll('[data-daily]').forEach(b=>b.onclick=async()=>{
      const i=Number(b.dataset.daily),correct=i===q.c;
      box.querySelectorAll('.challengeOpt').forEach(x=>x.disabled=true);
      b.classList.add(correct?'correct':'wrong');
      $('dailyResult').innerHTML=correct?'🎉 إجابة صحيحة! '+esc(q.why)+'<br><button class="smallbtn" id="claimDaily" style="margin-top:8px">استلام المكافأة</button>':'❌ ليست الإجابة الصحيحة. '+esc(q.why)+'<br>أضف السؤال إلى المراجعة لتجربته لاحقاً.';
      if(!correct){p.review=p.review||[];if(!p.review.includes(q.q))p.review.push(q.q);await putGameState(collectGameState());}
      $('claimDaily')?.addEventListener('click',completeDaily);
    });
  }

  function renderProjects(){
    const box=$('academyProjects');if(!box)return;
    const p=platformState();
    box.innerHTML='<h2 style="margin:6px 0 8px">🛠️ مشاريع حقيقية</h2>'+projects.map(pr=>{
      const state=p.projects[pr.id]||{step:0};
      return `<article class="project"><div class="projectTop"><div class="projectIcon">${pr.icon}</div><div><h3>${esc(pr.title)}</h3><p>${esc(pr.desc)}</p><span class="pill">${pr.level}</span><span class="pill">+${pr.xp} XP</span></div></div><div class="projectSteps">${pr.steps.map((s,i)=>`<div class="projectStep ${i<state.step?'done':''}">${i<state.step?'✓':'○'} ${esc(s)}</div>`).join('')}</div><button class="smallbtn projectBtn" data-project="${pr.id}" style="width:100%;margin-top:10px">${state.step>=pr.steps.length?'🏆 مكتمل':'تنفيذ الخطوة '+(state.step+1)}</button></article>`;
    }).join('');
    box.querySelectorAll('.projectBtn').forEach(b=>b.onclick=async()=>{
      const pr=projects.find(x=>x.id===b.dataset.project);const state=p.projects[pr.id]||{step:0};
      if(state.step>=pr.steps.length)return;
      state.step++;p.projects[pr.id]=state;
      const finished=state.step>=pr.steps.length;
      await reward(finished?pr.xp:25,finished?Math.ceil(pr.xp/10):5);
      await putGameState(collectGameState());renderProjects();
      toast(finished?'🏆 اكتمل المشروع!':'🛠️ أنجزت خطوة المشروع +25 XP');
    });
  }

  function renderSkills(){
    const box=$('academySkills');if(!box)return;
    const map=[['memory','🟢 أساسيات'],['detect','🔵 المنطق'],['speed','🟣 التكرار'],['build','🟡 الدوال'],['debug','🛠️ Debugging'],['solve','🧠 حل المشاكل']];
    box.innerHTML='<h2 style="margin:6px 0 8px">🌳 شجرة المهارات</h2><p style="color:#8ca8aa;font-size:11px">كل مهارة تتطور مع الدروس والتطبيق.</p><div class="skillTree">'+map.map(([k,n])=>{const lvl=Number(skillLevels[k])||0;return `<div class="skillNode"><b>${n}</b><small>المستوى ${lvl}/5</small><i><span style="width:${Math.min(100,lvl*20)}%"></span></i></div>`}).join('')+'</div>';
  }

  function renderReview(){
    const box=$('academyReview');if(!box)return;
    const p=platformState(),items=p.review||[];
    box.innerHTML='<h2 style="margin:6px 0 8px">🔁 مراجعة ذكية</h2><p style="color:#8ca8aa;font-size:11px">الأسئلة التي أخطأت بها تبقى هنا حتى تعيدها.</p>'+(items.length?items.map((x,i)=>`<div class="reviewItem"><b>سؤال يحتاج مراجعة #${i+1}</b><p>${esc(x)}</p><button class="smallbtn reviewRemove" data-i="${i}">✓ أتقنته</button></div>`).join(''):'<div class="emptyState">🎉 لا توجد أخطاء معلقة. استمر بالتعلم!</div>');
    box.querySelectorAll('.reviewRemove').forEach(b=>b.onclick=async()=>{p.review.splice(Number(b.dataset.i),1);await putGameState(collectGameState());renderReview();toast('✓ تمت إزالة السؤال من المراجعة');});
  }

  async function renderRank(){
    const box=$('academyRank');if(!box)return;
    box.innerHTML='<h2 style="margin:6px 0 8px">🏆 ترتيب المتعلمين</h2><p style="color:#8ca8aa;font-size:11px">الترتيب مبني على XP المحفوظ في الحسابات المتاحة.</p><div id="rankList" class="emptyState">جارِ تحميل الترتيب...</div>';
    try{
      const r=await api('/users?search=');
      const users=Array.isArray(r?.users)?r.users:[];
      const me=currentUser?.username;
      users.push({username:me||'أنت',xp:Number(xp)||0,level:Math.max(1,Math.floor((Number(xp)||0)/500)+1)});
      const unique=[...new Map(users.map(u=>[u.username,u])).values()].sort((a,b)=>(Number(b.xp)||0)-(Number(a.xp)||0)).slice(0,20);
      $('rankList').className='';
      $('rankList').innerHTML=unique.map((u,i)=>`<div class="rank"><div class="rankNo">#${i+1}</div><div class="rankAvatar">${i===0?'👑':'🐍'}</div><div class="rankInfo"><b>${esc(u.username||'لاعب')}</b><small>المستوى ${Number(u.level)||1}</small></div><div class="rankXP">${Number(u.xp)||0} XP</div></div>`).join('')||'<div class="emptyState">لا يوجد لاعبين بعد.</div>';
    }catch(e){$('rankList').textContent='تعذر تحميل الترتيب الآن.';}
  }

  function renderStats(){
    const box=$('academyStats');if(!box)return;
    const p=platformState(),runs=Number(gameState.lab?.runs)||0,success=Number(gameState.lab?.successes)||0;
    const lessonPct=Math.round(completedLessons.length/Math.max(1,lessons.length)*100);
    const projectCount=Object.values(p.projects||{}).filter(x=>x.step>=projects.find(pr=>pr.id===x.id)?.steps.length).length;
    box.innerHTML=`<h2 style="margin:6px 0 8px">📊 إحصائيات رحلتك</h2><div class="statGrid">
      <div class="statCard"><b>${completedLessons.length}</b><p>دروس مكتملة</p></div>
      <div class="statCard"><b>${lessonPct}%</b><p>نسبة المسار الأساسي</p></div>
      <div class="statCard"><b>${runs}</b><p>تشغيل في المختبر</p></div>
      <div class="statCard"><b>${success}</b><p>تشغيل ناجح</p></div>
      <div class="statCard"><b>${Object.values(p.projects||{}).filter(x=>x.step>=1).length}</b><p>مشاريع بدأت</p></div>
      <div class="statCard"><b>${p.streak||0}🔥</b><p>أطول سلسلة حالية</p></div>
    </div>`;
  }

  function openPlacement(){
    let selected={};
    const box=document.createElement('div');box.id='placementModalBody';
    box.innerHTML='<h3>🎯 اختبار تحديد المستوى</h3><p>اختبر 5 أسئلة سريعة حتى تعرف من أين تبدأ.</p>'+quiz.map((q,i)=>`<div class="placementQ"><b>${i+1}. ${esc(q.q)}</b>${q.a.map((a,j)=>`<button class="placementOpt" data-pq="${i}" data-pa="${j}">${esc(a)}</button>`).join('')}</div>`).join('')+'<button class="close" id="finishPlacement">حساب النتيجة</button>';
    showPlatformSheet('🎯 اختبار المستوى',box.innerHTML);
    document.querySelectorAll('.placementOpt').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.pq);selected[i]=Number(b.dataset.pa);document.querySelectorAll('[data-pq="'+i+'"]').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');});
    $('finishPlacement')?.addEventListener('click',async()=>{
      const score=quiz.reduce((n,q,i)=>n+(selected[i]===q.c?1:0),0);
      const p=platformState();p.placement={done:true,score};await reward(score*30,score*5);await putGameState(collectGameState());closeSheet?.();
      toast('🎯 نتيجتك '+score+'/5 — تم حفظ الاختبار');
      if(score>=4)toast('🚀 يمكنك البدء من مسار متقدم بعد مراجعة الأساسيات.');
      renderAcademy();
    });
  }

  function showPlatformSheet(title,html){
    if(typeof openSheet==='function')openSheet(title,html);
    else {const o=$('overlay');if(!o)return;$('sheetTitle').textContent=title;$('sheetText').innerHTML=html;$('sheetExtra').innerHTML='';o.classList.add('open');}
  }

  function renderAcademy(){
    ensurePage();injectStyle();bindTabs();renderHeader();renderPath();renderDaily();renderProjects();renderSkills();renderReview();renderStats();
    if($('academyRank')?.classList.contains('active'))renderRank();
  }

  // Hook into existing navigation without replacing the existing app.
  const oldRenderAll=window.renderAll;
  if(typeof oldRenderAll==='function' && !oldRenderAll.__platformWrapped){
    const wrapped=function(){const r=oldRenderAll.apply(this,arguments);try{renderAcademy()}catch(e){}return r};
    wrapped.__platformWrapped=true;window.renderAll=wrapped;
  }

  window.openAcademy=openAcademy;
  window.renderPlatformAcademy=renderAcademy;

  window.addEventListener('load',()=>{
    injectStyle();ensurePage();bindTabs();
    document.querySelectorAll('[data-nav="academy"]').forEach(b=>b.onclick=()=>openAcademy('path'));
    platformState().totalSessions++;
    putGameState(collectGameState()).catch(()=>{});
  });
})();

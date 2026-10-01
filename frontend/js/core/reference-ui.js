(function(){
  const $id=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function go(view){
    document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
    const target=$id(view); if(target)target.classList.add('active');
    document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.nav===view));
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function refreshReferenceHome(){
    const progressValue=Math.max(0,Math.min(100,Number(progress)||0));
    const level=Math.max(1,Math.floor((Number(xp)||0)/500)+1);
    const levelNum=$id('levelNum'); if(levelNum)levelNum.textContent=Math.min(10,Math.ceil(progressValue/10)||1)+' / 10';
    const bar=document.querySelector('.progressline i'); if(bar)bar.style.width=progressValue+'%';
    const nextIndex=Math.min(lessons.length-1,completedLessons.length);
    const next=$id('continue'); if(next)next.dataset.lesson=String(lessons[nextIndex]?.id||1);
  }

  function renderReferenceTasks(){
    const list=$id('taskList'); if(!list)return;
    list.innerHTML=tasks.map(t=>{
      const done=!!gameState.quests?.[t[0]];
      return `<article class="bigcard"><div class="row"><div><h3>${t[1]}</h3><p>${t[2]}</p></div><button class="smallbtn task-action" data-task="${t[0]}" data-reward="${t[3]}" ${done?'disabled':''}>${done?'✓ مكتملة':'ابدأ +'+t[3]+' XP'}</button></div></article>`;
    }).join('');
    list.querySelectorAll('.task-action').forEach(btn=>btn.onclick=()=>completeTask(btn.dataset.task,Number(btn.dataset.reward)));
  }

  async function completeTask(id,reward){
    if(gameState.quests?.[id])return;
    try{
      gameState.quests[id]=true;
      const newXp=(Number(xp)||0)+reward;
      const newCoins=(Number(coins)||0)+Math.ceil(reward/5);
      const newProgress=Math.min(100,(Number(progress)||0)+2);
      const r=await api('/player',{method:'PUT',body:JSON.stringify({xp:newXp,coins:newCoins,progress:newProgress})});
      if(r?.player){xp=Number(r.player.xp)||newXp;coins=Number(r.player.coins)||newCoins;progress=Number(r.player.progress)||newProgress;skillPoints=Number(r.player.skillPoints)||skillPoints}
      await putGameState(collectGameState());
      renderAll();renderPersistentUI();renderReferenceTasks();refreshReferenceHome();
      toast('🎉 تمت المهمة +'+reward+' XP');
    }catch(e){gameState.quests[id]=false;toast(e.message||'تعذر حفظ المهمة')}
  }

  function renderReferenceSkills(){
    const list=$id('skillList'); if(!list)return;
    list.innerHTML=skills.map(s=>{
      const lvl=Number(skillLevels[s[2]])||0;
      const width=Math.min(100,lvl*20);
      return `<article class="bigcard"><div class="row"><div><h3>${s[0]} ${s[1]}</h3><p>المستوى الحالي: ${lvl}/5</p></div><button class="smallbtn skill-action" data-skill="${s[2]}" ${lvl>=5?'disabled':''}>+ نقطة</button></div><div class="meter"><i style="--w:${width}%"></i></div></article>`;
    }).join('');
    list.querySelectorAll('.skill-action').forEach(b=>b.onclick=()=>upgradeReferenceSkill(b.dataset.skill));
  }

  async function upgradeReferenceSkill(key){
    try{
      const r=await api('/player',{method:'PUT',body:JSON.stringify({upgradeSkill:key})});
      if(!r?.player)throw new Error('تعذر ترقية المهارة');
      skillPoints=Number(r.player.skillPoints)||0;Object.assign(skillLevels,r.player.skillLevels||{});
      renderAll();renderPersistentUI();renderReferenceSkills();toast('🧠 تمت ترقية المهارة');
    }catch(e){toast(e.message||'تعذر ترقية المهارة')}
  }

  function bindNavigation(){
    document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>go(b.dataset.view));
    document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
    $id('start')?.addEventListener('click',()=>{go('lessons');openLesson(lessons[Math.min(completedLessons.length,lessons.length-1)]?.id||1)});
    $id('labTop')?.addEventListener('click',()=>go('lab'));
    $id('continue')?.addEventListener('click',()=>openLesson(Number($id('continue').dataset.lesson)||1));
    $id('run')?.addEventListener('click',runReferenceCode);
    $id('close')?.addEventListener('click',closeSheet);
    $id('overlay')?.addEventListener('click',e=>{if(e.target.id==='overlay')closeSheet()});
  }

  function closeSheet(){const o=$id('overlay');if(o)o.classList.remove('open')}

  function openMenu(){
    openSheet('☰ قائمة الرحلة','اختر القسم الذي تريد دخوله.',`<div class="menu"><button data-menu="home">⌂ الرئيسية</button><button data-menu="lessons">📖 الدروس</button><button data-menu="tasks">☑️ المهام</button><button data-menu="skills">⭐ المهارات</button><button data-menu="messages">💬 الرسائل</button><button data-menu="lab">🧪 المختبر</button><button id="communityBtn">👥 مجتمع اللاعبين</button></div>`);
    document.querySelectorAll('[data-menu]').forEach(b=>b.onclick=()=>{closeSheet();go(b.dataset.menu)});
    $id('communityBtn')?.addEventListener('click',()=>{closeSheet();openChat()});
  }

  function openProfile(){
    const level=Math.max(1,Math.floor((Number(xp)||0)/500)+1);
    openSheet('🐲 ملف المبرمج',`<p>المستخدم: <b>${esc(currentUser?.username||'مستخدم')}</b></p><p>المستوى: <b>${level}</b><br>XP: <b>${Number(xp)||0}</b><br>الدروس المكتملة: <b>${completedLessons.length} / ${lessons.length}</b><br>المهام المكتملة: <b>${Object.values(gameState.quests||{}).filter(Boolean).length} / ${tasks.length}</b><br>نقاط المهارة: <b>${Number(skillPoints)||0}</b></p><button class="close" id="profileLogout">تسجيل الخروج</button>`);
    $id('profileLogout')?.addEventListener('click',()=>$id('logoutBtn')?.click());
  }

  function openSheet(title,html,extra=''){
    const o=$id('overlay');if(!o)return;
    $id('sheetTitle').textContent=title;$id('sheetText').innerHTML=html;$id('sheetExtra').innerHTML=extra;o.classList.add('open');
  }

  function runReferenceCode(){
    const code=$id('editor')?.value||'';const out=$id('output');if(!out)return;
    let lines=[];
    const vars={};
    for(const m of code.matchAll(/^\s*([A-Za-z_]\w*)\s*=\s*["']([^"']*)["']\s*$/gm))vars[m[1]]=m[2];
    for(const m of code.matchAll(/print\s*\(([^\n]*)\)/g)){
      let value=m[1].trim();
      value=value.replace(/\b([A-Za-z_]\w*)\b/g,(all,k)=>Object.prototype.hasOwnProperty.call(vars,k)?vars[k]:all);
      value=value.replace(/["']/g,'');
      lines.push(value);
    }
    out.textContent=lines.join('\n')||'لا يوجد ناتج. جرّب print("Hello")';
    gameState.lab.runs=(gameState.lab.runs||0)+1;
    if(lines.length)gameState.lab.successes=(gameState.lab.successes||0)+1;else gameState.lab.errors=(gameState.lab.errors||0)+1;
    saveLabData(gameState.lab).catch(()=>{});
    toast(lines.length?'▶ تم تشغيل الكود':'⚠️ أضف print(...) لرؤية الناتج');
  }

  function renderReferenceAll(){
    renderReferenceTasks();renderReferenceSkills();refreshReferenceHome();
    const chat=$id('chat');
    if(chat && !chat.dataset.bound){
      chat.dataset.bound='1';
      $id('chatForm')?.addEventListener('submit',e=>{
        e.preventDefault();
        const input=$id('chatInput'),q=input.value.trim();if(!q)return;
        chat.insertAdjacentHTML('beforeend',`<div class="bubble me">${esc(q)}</div>`);
        let a='ابدأ بالدرس الحالي واكتب المثال بيدك ثم جرّبه في المختبر.';
        if(/متغير|variable/i.test(q))a="المتغير مثل صندوق باسم: name = 'Ali' ثم تستخدم name لاحقاً.";
        else if(/print/i.test(q))a='print() تطبع قيمة على الشاشة، مثال: print("Hello Ali").';
        else if(/input/i.test(q))a='input() تأخذ نصاً من المستخدم، ويمكن تحويل الرقم باستخدام int().';
        else if(/if|شرط/i.test(q))a='if تستخدم لاتخاذ قرار عندما يكون الشرط صحيحاً.';
        chat.insertAdjacentHTML('beforeend',`<div class="bubble">🐲 ${a}</div>`);input.value='';chat.scrollTop=chat.scrollHeight;
      });
    }
  }

  window.addEventListener('pythonAdventureRendered',renderReferenceAll);
  window.addEventListener('load',()=>{
    bindNavigation();
    $id('menu')?.addEventListener('click',openMenu);
    $id('profile')?.addEventListener('click',openProfile);
    renderReferenceAll();
  });
  window.renderReferenceAll=renderReferenceAll;
})();
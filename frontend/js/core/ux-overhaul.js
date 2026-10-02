/* Python Adventure UX Overhaul — navigation + dashboard */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
 const routes=[
  ['academy','🚀','الأكاديمية','مسار التعلم'],
  ['lessons','📚','الدروس','تعلم خطوة بخطوة'],
  ['lab','🧪','المختبر','اكتب وشغّل Python'],
  ['tasks','⚡','التحديات','تدريب سريع'],
  ['projects','🛠️','المشاريع','ابنِ تطبيقات'],
  ['skills','🌳','المهارات','طور قدراتك'],
  ['mapPage','🗺️','الخريطة','تقدم الرحلة'],
  ['achievementsPage','🏆','الإنجازات','جوائزك'],
  ['messages','💬','الرسائل','رسائلك ومحادثاتك']
 ];
 function go(view){
   if(view==='projects'){window.openAcademy?.('projects');return}
   if(view==='academy'){window.openAcademy?.('path');return}
   document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
   const target=$(view);if(target)target.classList.add('active');
   document.querySelectorAll('[data-nav]').forEach(n=>n.classList.toggle('active',n.dataset.nav===view));
   document.querySelectorAll('#uxSidebar button[data-route]').forEach(n=>n.classList.toggle('active',n.dataset.route===view));
   window.scrollTo({top:0,behavior:'smooth'});
   updateContinue();
 }
 function buildSidebar(){
   if($('uxSidebar'))return;
   const side=document.createElement('aside');side.id='uxSidebar';
   side.innerHTML='<div class="uxBrand">🐍 <span>Python</span> Adventure</div><div class="uxLabel">التعلم</div>'+
    routes.slice(0,7).map(r=>`<button data-route="${r[0]}"><span style="font-size:18px">${r[1]}</span><span><b style="display:block;font-size:12px">${r[2]}</b><small style="color:#617d82">${r[3]}</small></span></button>`).join('')+
    '<div class="uxLabel">رحلتك</div>'+routes.slice(7).map(r=>`<button data-route="${r[0]}"><span style="font-size:18px">${r[1]}</span><span><b style="display:block;font-size:12px">${r[2]}</b><small style="color:#617d82">${r[3]}</small></span></button>`).join('')+
    '<div class="uxBottom"><button id="uxSideProfile">👤 ملفي وحسابي</button></div>';
   document.body.appendChild(side);
   side.querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>go(b.dataset.route));
   $('uxSideProfile').onclick=()=>window.openProfile?.();
 }
 function buildTopbar(){
   if($('uxTopbar'))return;
   const top=document.createElement('div');top.id='uxTopbar';
   top.innerHTML='<input class="uxSearch" id="uxSearch" placeholder="🔎 ابحث عن درس، مشروع، مهارة..."><div class="uxStat">⭐ <b id="uxTopXP">0</b> XP</div><div class="uxStat">🪙 <b id="uxTopCoins">0</b></div><button id="uxTopProfile" class="iconbtn">🐲</button>';
   document.body.appendChild(top);
   $('uxTopProfile').onclick=()=>window.openProfile?.();
   $('uxSearch').onfocus=()=>openCommand();
   $('uxSearch').onkeydown=e=>{if(e.key==='Enter')openCommand(e.target.value)};
 }
 function buildMobile(){
   if($('uxMobileNav'))return;
   const b=document.createElement('button');b.id='uxMobileNav';b.textContent='☰';b.onclick=()=>toggleDrawer();document.body.appendChild(b);
   const d=document.createElement('div');d.id='uxDrawer';d.innerHTML='<div class="drawer"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px"><b>🐍 التنقل</b><button id="uxDrawerClose" class="smallbtn">✕</button></div><div id="uxDrawerLinks"></div></div>';
   document.body.appendChild(d);$('uxDrawerClose').onclick=toggleDrawer;d.onclick=e=>{if(e.target===d)toggleDrawer()};
   $('uxDrawerLinks').innerHTML=routes.map(r=>`<button data-route="${r[0]}" style="width:100%;display:flex;gap:10px;padding:13px;margin:4px 0;border:1px solid transparent;border-radius:12px;background:#08171d;color:#cfe8e5;text-align:right"><span>${r[1]}</span><span>${r[2]}</span></button>`).join('');
   $('uxDrawerLinks').querySelectorAll('[data-route]').forEach(b=>b.onclick=()=>{toggleDrawer();go(b.dataset.route)});
 }
 function toggleDrawer(){$('uxDrawer')?.classList.toggle('open')}
 function openCommand(seed=''){
   if(!$('uxCommandModal')){
    const m=document.createElement('div');m.id='uxCommandModal';m.className='uxModal';
    m.innerHTML='<div class="uxCommand"><input id="uxCommandInput" placeholder="اكتب للبحث عن أي مكان..."><div class="uxResults" id="uxResults"></div></div>';
    document.body.appendChild(m);m.onclick=e=>{if(e.target===m)m.classList.remove('open')};
    $('uxCommandInput').oninput=e=>renderResults(e.target.value);
    $('uxCommandInput').onkeydown=e=>{if(e.key==='Escape')m.classList.remove('open')};
   }
   $('uxCommandModal').classList.add('open');$('uxCommandInput').value=seed;$('uxCommandInput').focus();renderResults(seed);
 }
 function renderResults(q=''){
   const term=q.trim().toLowerCase();
   const results=routes.filter(r=>(r[2]+' '+r[3]).toLowerCase().includes(term)||!term).slice(0,9);
   $('uxResults').innerHTML=results.map(r=>`<button data-cmd="${r[0]}">${r[1]} <b>${esc(r[2])}</b><small style="color:#718b90"> — ${esc(r[3])}</small></button>`).join('');
   $('uxResults').querySelectorAll('[data-cmd]').forEach(b=>b.onclick=()=>{$('uxCommandModal').classList.remove('open');go(b.dataset.cmd)});
 }

 function syncActiveNavigation(){
   const active=document.querySelector('.view.active');
   const view=active?.id;
   if(!view)return;
   document.querySelectorAll('[data-nav]').forEach(n=>n.classList.toggle('active',n.dataset.nav===view));
   document.querySelectorAll('#uxSidebar button[data-route]').forEach(n=>n.classList.toggle('active',n.dataset.route===view));
 }
 function updateContinue(){
   const id=lessons[Math.min(completedLessons.length,lessons.length-1)]?.id||1;
   const continueButton=$('uxContinue');
   if(continueButton)continueButton.style.display='none';

   if($('uxTopXP'))$('uxTopXP').textContent=Number(xp)||0;
   if($('uxTopCoins'))$('uxTopCoins').textContent=Number(coins)||0;
 }
 function addContinue(){
   if($('uxContinue'))return;
   const b=document.createElement('button');
   b.id='uxContinue';
   b.innerHTML='▶️ تابع من حيث توقفت';
   b.onclick=()=>{const id=lessons[Math.min(completedLessons.length,lessons.length-1)]?.id||1;openLesson(id)};
   b.style.display='none';
   document.body.appendChild(b);
 }
 function refresh(){buildSidebar();buildTopbar();buildMobile();addContinue();updateContinue()}
 function hookRender(){
   if(window.__uxRenderWrapped)return;
   const old=window.renderAll;
   if(typeof old==='function'){
     window.renderAll=function(){const r=old.apply(this,arguments);setTimeout(updateContinue,0);return r};
     window.__uxRenderWrapped=true;
   }
 }
 window.addEventListener('load',()=>{
   document.body.classList.add('uxHasSidebar');
   refresh();
   syncActiveNavigation();
   hookRender();

   // بعض التنقلات تتم من ملفات أخرى؛ راقب تبدّل الصفحة النشطة حتى يبقى
   // زر "تابع من حيث توقفت" ظاهرًا داخل الرسائل فقط.
   const observer=new MutationObserver(()=>{updateContinue();syncActiveNavigation()});
   observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
 });
 window.addEventListener('pythonAdventureRendered',updateContinue);
 window.openUXCommand=openCommand;
})();

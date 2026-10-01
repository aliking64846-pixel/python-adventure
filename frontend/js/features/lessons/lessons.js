function openSheet(title,html,extra=''){
  const overlay=$('overlay');
  if(!overlay)return;
  $('sheetTitle').textContent=title;
  $('sheetText').innerHTML=html;
  $('sheetExtra').innerHTML=extra;
  overlay.classList.add('open');
}
function closeSheet(){const o=$('overlay');if(o)o.classList.remove('open')}

function renderLessons(){
  const list=$('lessonList');
  if(!list)return;
  list.innerHTML=lessons.map((l,i)=>{
    const done=completedLessons.includes(l.id);
    const unlocked=i===0||completedLessons.includes(lessons[i-1].id);
    return `<article class="lesson" data-lesson="${l.id}" style="opacity:${unlocked?1:.5};cursor:${unlocked?'pointer':'not-allowed'}">
      <div class="thumb">${l.title.match(/\p{Extended_Pictographic}/u)?.[0]||'🐍'}</div>
      <div><h3>${done?'✓ ':unlocked?'▶ ':'🔒 '}${l.title.replace(/^\S+\s/,'')}</h3><p>${l.desc}</p></div>
      <div class="tag">${done?'✓ مكتمل':l.xp+' XP'}</div>
    </article>`;
  }).join('');
  list.querySelectorAll('[data-lesson]').forEach(el=>el.onclick=()=>openLesson(Number(el.dataset.lesson)));
  const recent=$('recent');
  if(recent)recent.innerHTML=lessons.slice(0,3).map(l=>{
    const done=completedLessons.includes(l.id);
    return `<article class="lesson" data-lesson="${l.id}"><div class="thumb">🐍</div><div><h3>${l.title}</h3><p>${l.desc}</p></div><div class="tag">${done?'✓':'+'+l.xp+' XP'}</div></article>`;
  }).join('');
  recent?.querySelectorAll('[data-lesson]').forEach(el=>el.onclick=()=>openLesson(Number(el.dataset.lesson)));
}

function openLesson(id=1){
  const l=lessons.find(x=>x.id===id);
  if(!l)return;
  const index=lessons.findIndex(x=>x.id===id);
  if(index>0&&!completedLessons.includes(lessons[index-1].id)){toast('🔒 أكمل الدرس السابق أولاً');return}
  const done=completedLessons.includes(id);
  const answers=l.answers.map((a,i)=>`<button class="smallbtn lesson-answer" data-answer="${i}" style="display:block;width:100%;margin:7px 0;text-align:right">${a}</button>`).join('');
  const extra=`<div class="bigcard" style="margin-top:12px"><b>💻 المثال</b><pre style="direction:ltr;text-align:left;white-space:pre-wrap;color:#bfffe8;margin:10px 0">${escapeHtml(l.code)}</pre><p>${escapeHtml(l.explain)}</p><hr><b>🎯 ${escapeHtml(l.question)}</b><div id="lessonAnswers">${answers}</div><div id="lessonAnswerResult"></div></div><button class="close" id="completeLessonBtn" ${done?'disabled':''}>${done?'✓ الدرس مكتمل':'إكمال الدرس +'+l.xp+' XP'}</button>`;
  openSheet(l.title,`<p>${escapeHtml(l.desc)}</p>`,extra);
  document.querySelectorAll('.lesson-answer').forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll('.lesson-answer').forEach(x=>x.style.outline='');
    const correct=Number(btn.dataset.answer)===l.correct;
    btn.style.outline=correct?'2px solid #35f0ad':'2px solid #ff6e7d';
    const result=$('lessonAnswerResult');result.dataset.correct=correct?'1':'';result.textContent=correct?'🎉 إجابة صحيحة!':'❌ حاول مرة أخرى';
  });
  $('completeLessonBtn')?.addEventListener('click',()=>{if(!$('lessonAnswerResult')?.dataset.correct){toast('🎯 جاوب السؤال بشكل صحيح أولاً');return}completeLesson(id)});
}

async function completeLesson(id){
  if(completedLessons.includes(id)){toast('هذا الدرس مكتمل بالفعل');return}
  try{
    const r=await api('/lessons/'+id+'/complete',{method:'POST'});
    if(!r?.player)throw new Error('تعذر حفظ إكمال الدرس');
    const p=r.player;
    xp=Number(p.xp)||0; coins=Number(p.coins)||0; progress=Number(p.progress)||0; skillPoints=Number(p.skillPoints)||0;
    completedLessons=Array.isArray(p.completedLessons)?p.completedLessons.map(Number):completedLessons;
    if(p.skillLevels)Object.assign(skillLevels,p.skillLevels);
    if(p.gameState)mergeGameState(p.gameState);
    renderAll();renderPersistentUI();
    toast(r.alreadyCompleted?'هذا الدرس مكتمل بالفعل':'🎉 تم إكمال الدرس!');
    setTimeout(closeSheet,700);
  }catch(e){toast(e.message||'تعذر إكمال الدرس')}
}

function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

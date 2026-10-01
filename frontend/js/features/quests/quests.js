function renderQuests(){
  const quick=$('quickQuests');if(quick)quick.innerHTML=quests.slice(0,3).map(q=>`<div class="quest ${q[0]==='q1'&&completedLessons.length?'done':''}">${q[0]==='q1'&&completedLessons.length?'✓ ':'📜 '}${q[1]}</div>`).join('');
  const list=$('questList');if(list)list.innerHTML=quests.map(q=>`<div class="quest"><strong>${q[1]}</strong> — +${q[2]} XP</div>`).join('');
}
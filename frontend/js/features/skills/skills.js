function renderSkills(){
  const quick=$('quickSkills');
  if(quick)quick.innerHTML=skills.slice(0,6).map(s=>`<div class="skill"><b>${s[0]}</b>${s[1]}<br>${skillLevels[s[2]]||0}/5</div>`).join('');
  const tree=$('skillTree');
  if(tree)tree.innerHTML=skills.map(s=>`<div class="node"><strong>${s[0]}</strong>${s[1]}<div class="lvl">${skillLevels[s[2]]||0}/5</div><button class="btn" style="margin-top:9px" onclick="upgradeSkill('${s[2]}')">+ نقطة</button></div>`).join('');
}
async function upgradeSkill(k){if(skillPoints<=0){toast('لا توجد نقاط مهارة');return}if((skillLevels[k]||0)>=5){toast('المهارة وصلت للمستوى 5');return}try{const r=await api('/player',{method:'PUT',body:JSON.stringify({upgradeSkill:k})});if(!r?.player)throw new Error('تعذر ترقية المهارة');skillPoints=Number(r.player.skillPoints)||0;Object.assign(skillLevels,r.player.skillLevels||{});renderAll();renderPersistentUI();if(typeof renderReferenceAll==='function')renderReferenceAll();toast('🧠 تمت ترقية المهارة')}catch(e){toast(e.message)}}
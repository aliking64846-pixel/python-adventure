function renderAll(){$('progressBar').style.width=progress+'%';$('progressText').textContent=progress+'% — Python Adventure';$('xp').textContent=xp;$('coins').textContent=coins;$('skillPoints').textContent=skillPoints;$('xpBar').style.width=Math.min(100,xp/4800*100)+'%';$('level').textContent=Math.max(1,Math.floor(xp/500)+1);renderLessons();renderSkills();renderBag();renderQuests();renderMap();renderAchievements()}

function renderPersistentUI(){
  const inventory=[...new Set(gameState.inventory||[])];
  document.querySelectorAll('.inventory .items').forEach(box=>{
    box.innerHTML=inventory.map(item=>`<button class="item">${String(item).replace(/</g,'&lt;')}</button>`).join('');
  });
  document.querySelectorAll('.inventory .panel-title span').forEach(el=>{
    el.textContent=inventory.length+'/30';
  });
}

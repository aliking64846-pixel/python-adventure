function renderBag(){
  const visible=items.slice(0,Math.min(items.length,3+completedLessons.length));
  const quick=$('quickBag');if(quick)quick.innerHTML=visible.map(x=>`<button class="item" onclick="toast('${String(x).replace(/'/g,"\\'")}')">${x}</button>`).join('');
  const list=$('bagList');if(list)list.innerHTML=items.map((x,i)=>`<button class="item ${i>2+completedLessons.length?'locked':''}">${i>2+completedLessons.length?'🔒 ':''}${x}</button>`).join('');
  const count=$('bagCount');if(count)count.textContent=visible.length+'/30';
}
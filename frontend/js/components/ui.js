const $ = id => document.getElementById(id);
function toast(msg){const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function openWindow(id){closeWindows();const el=$(id);if(el)el.classList.add('show')}
function closeWindows(){document.querySelectorAll('.modal').forEach(x=>x.classList.remove('show'))}
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeWindows()}));

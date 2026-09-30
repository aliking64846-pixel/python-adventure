const $ = id => document.getElementById(id);
function toast(msg){const t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function openWindow(id){closeWindows();const el=$(id);if(el)el.classList.add('show')}
function closeWindows(){document.querySelectorAll('.modal').forEach(x=>x.classList.remove('show'))}
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeWindows()}));


// Mobile bottom navigation: keep the pressed destination as a soft bubble.
document.querySelectorAll('.bottom .nav').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.bottom .nav').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
  });
});

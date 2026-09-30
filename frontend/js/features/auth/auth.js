function setMode(m){
  mode=m==='register'?'register':'login';
  const reg=mode==='register';
  $('loginForm').style.display=reg?'none':'block';
  $('registerForm').style.display=reg?'block':'none';
  $('loginTab').classList.toggle('active',!reg);
  $('registerTab').classList.toggle('active',reg);
  $('authSubmit').textContent=reg?'إنشاء الحساب 🚀':'دخول إلى اللعبة 🚀';
  $('authMsg').textContent='';
}

function showAuthMessage(message,isError=true){
  const el=$('authMsg');
  el.textContent=message||'';
  el.classList.toggle('success',!isError);
}

function validateAuthForm(){
  if(mode==='login'){
    const login=$('loginValue').value.trim();
    const password=$('loginPassword').value;
    if(!login)return 'اكتب اسم المستخدم أو الإيميل';
    if(!password)return 'اكتب كلمة المرور';
    return null;
  }
  const username=$('regUsername').value.trim();
  const email=$('regEmail').value.trim().toLowerCase();
  const password=$('regPassword').value;
  if(username.length<3||username.length>30)return 'اسم المستخدم يجب أن يكون بين 3 و30 حرفاً';
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return 'الإيميل غير صحيح';
  if(password.length<6)return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
  return null;
}

$('loginTab').onclick=()=>setMode('login');
$('registerTab').onclick=()=>setMode('register');

async function loadState(){
  try{
    const d=await api('/player');
    if(!d||!d.player)return;
    const p=d.player;
    xp=Number(p.xp)||0;
    coins=Number(p.coins)||0;
    progress=Number(p.progress)||0;
    skillPoints=Number(p.skillPoints)||0;
    completedLessons=Array.isArray(p.completedLessons)?p.completedLessons.map(Number):[];
    if(p.skillLevels&&typeof p.skillLevels==='object')Object.assign(skillLevels,p.skillLevels);
    if(p.gameState&&typeof p.gameState==='object')mergeGameState(p.gameState);
    renderAll();
    if(typeof renderPersistentUI==='function')renderPersistentUI();
  }catch(e){console.warn('loadState error:',e)}
}

async function submitAuth(){
  const validation=validateAuthForm();
  if(validation){showAuthMessage(validation);return}
  const button=$('authSubmit');
  try{
    button.disabled=true;
    showAuthMessage(mode==='register'?'جاري إنشاء الحساب...':'جاري تسجيل الدخول...',false);
    const d=mode==='login'
      ?await api('/auth/login',{method:'POST',body:JSON.stringify({login:$('loginValue').value.trim(),password:$('loginPassword').value})})
      :await api('/auth/register',{method:'POST',body:JSON.stringify({username:$('regUsername').value.trim(),email:$('regEmail').value.trim().toLowerCase(),password:$('regPassword').value})});
    if(!d||!d.user)throw new Error('لم يتم استلام بيانات الحساب من الخادم');
    currentUser=d.user;
    $('authScreen').style.display='none';
    $('playerName').textContent='🧙 '+currentUser.username;
    $('loginPassword').value='';
    $('regPassword').value='';
    await loadState();
    if(typeof renderPersistentUI==='function')renderPersistentUI();
  }catch(e){
    console.error('Authentication error:',e);
    showAuthMessage(e.message||'تعذر الاتصال بالخادم');
  }finally{
    button.disabled=false;
  }
}

$('authSubmit').onclick=submitAuth;
$('loginPassword').addEventListener('keydown',e=>{if(e.key==='Enter')submitAuth()});
$('loginValue').addEventListener('keydown',e=>{if(e.key==='Enter')$('loginPassword').focus()});
$('regUsername').addEventListener('keydown',e=>{if(e.key==='Enter')$('regEmail').focus()});
$('regEmail').addEventListener('keydown',e=>{if(e.key==='Enter')$('regPassword').focus()});
$('regPassword').addEventListener('keydown',e=>{if(e.key==='Enter')submitAuth()});

async function checkAuth(){
  try{
    const d=await api('/auth/me');
    if(!d||!d.user)throw new Error('not authenticated');
    currentUser=d.user;
    $('authScreen').style.display='none';
    $('playerName').textContent='🧙 '+currentUser.username;
    await loadState();
  }catch(e){
    currentUser=null;
    $('authScreen').style.display='flex';
  }
}

$('logoutBtn').onclick=async()=>{
  try{await api('/auth/logout',{method:'POST'})}catch(e){console.warn('Logout error:',e)}
  currentUser=null;
  selectedUser=null;
  $('authScreen').style.display='flex';
  $('loginPassword').value='';
  $('regPassword').value='';
  setMode('login');
  showAuthMessage('تم تسجيل الخروج',false);
};
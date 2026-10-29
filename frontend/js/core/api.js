/* Local-only API compatibility layer. No server or database required. */
const API_BASE='/api';
const LOCAL_KEYS={accounts:'pa_local_accounts_v1',active:'pa_local_active_user_v1',messages:'pa_local_messages_v1'};
function localRead(key,fallback){try{const value=localStorage.getItem(key);return value?JSON.parse(value):fallback}catch(_){return fallback}}
function localWrite(key,value){localStorage.setItem(key,JSON.stringify(value));}
function localAccounts(){return localRead(LOCAL_KEYS.accounts,[])}
function localActiveId(){return Number(localStorage.getItem(LOCAL_KEYS.active)||0)}
function localUser(){return localAccounts().find(u=>u.id===localActiveId())||null}
function localPublicUser(u){return u?{id:u.id,username:u.username,email:u.email}:null}
function localDefaultPlayer(user){return {id:user.id,username:user.username,email:user.email,xp:0,coins:100,progress:0,skillPoints:0,skillLevels:{memory:1,debug:0,detect:0,speed:0,build:0,solve:0},completedLessons:[],gameState:{},byteState:{},labStats:{runs:0,successes:0,errors:0}}}
function localSaveUser(updated){const users=localAccounts();const i=users.findIndex(u=>u.id===updated.id);if(i<0)return;users[i]=updated;localWrite(LOCAL_KEYS.accounts,users)}
function localError(message,status=400){const e=new Error(message);e.status=status;throw e}
function localBody(options){if(!options||!options.body)return {};try{return JSON.parse(options.body)}catch(_){return {}}}
async function api(url,options={}){
 const raw=String(url||'');const path=raw.replace(/^https?:\/\/[^/]+/i,'').split('?')[0].replace(/^\/api/,'')||'/';const method=(options.method||'GET').toUpperCase();const body=localBody(options);let user=localUser();
 if(path==='/auth/register'&&method==='POST'){
  const username=String(body.username||'').trim(),email=String(body.email||'').trim().toLowerCase(),password=String(body.password||'');
  if(username.length<3||username.length>30)localError('اسم المستخدم يجب أن يكون بين 3 و30 حرفاً');
  if(!email.includes('@'))localError('الإيميل غير صحيح');
  if(password.length<6)localError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
  const users=localAccounts();if(users.some(u=>u.email===email||u.username.toLowerCase()===username.toLowerCase()))localError('اسم المستخدم أو الإيميل مستخدم مسبقاً');
  const id=users.reduce((n,u)=>Math.max(n,Number(u.id)||0),0)+1;const next={...localDefaultPlayer({id,username,email}),password};users.push(next);localWrite(LOCAL_KEYS.accounts,users);localStorage.setItem(LOCAL_KEYS.active,String(id));return {user:localPublicUser(next)};
 }
 if(path==='/auth/login'&&method==='POST'){
  const login=String(body.login??body.email??'').trim().toLowerCase();const found=localAccounts().find(u=>(u.username.toLowerCase()===login||u.email.toLowerCase()===login)&&u.password===String(body.password||''));
  if(!found)localError('اسم المستخدم أو كلمة المرور غير صحيحة',401);localStorage.setItem(LOCAL_KEYS.active,String(found.id));return {user:localPublicUser(found)};
 }
 if(path==='/auth/me'){if(!user)localError('سجّل الدخول أولاً',401);return {user:localPublicUser(user)}}
 if(path==='/auth/logout'&&method==='POST'){localStorage.removeItem(LOCAL_KEYS.active);return {ok:true}}
 if(!user)localError('سجّل الدخول أولاً',401);
 if(path==='/player'&&method==='GET')return {player:{...user,gameState:user.gameState||{},labStats:user.labStats||{runs:0,successes:0,errors:0}}};
 if(path==='/player'&&method==='PUT'){user={...user,...body};localSaveUser(user);return {ok:true,player:user}}
 if(path==='/game-state'&&method==='PUT'){user.gameState=body;localSaveUser(user);return {ok:true,gameState:body}}
 if(path==='/byte'&&method==='PUT'){user.byteState=body;localSaveUser(user);return {ok:true,byte:body}}
 if(path==='/lab'&&method==='PUT'){user.labStats=body;localSaveUser(user);return {ok:true,labStats:body}}
 if(path==='/lessons'&&method==='GET')return {lessons:Array.isArray(window.lessons)?window.lessons:[]};
 const completed=path.match(/^\/lessons\/(\d+)\/complete$/);
 if(completed&&method==='POST'){
  const id=Number(completed[1]);const done=Array.isArray(user.completedLessons)?user.completedLessons:[];if(!done.includes(id)){done.push(id);const lesson=(window.lessons||[]).find(l=>Number(l.id)===id);user.xp=(Number(user.xp)||0)+(Number(lesson&&lesson.xp)||0);user.progress=Math.min(100,Math.round(done.length/Math.max(1,(window.lessons||[]).length||10)*100));user.completedLessons=done;localSaveUser(user)}return {ok:true,player:user,completedLessons:user.completedLessons};
 }
 if(path==='/users'&&method==='GET'){const query=new URLSearchParams(raw.split('?')[1]||'').get('search')||'';return {users:localAccounts().filter(u=>u.id!==user.id&&u.username.toLowerCase().includes(query.toLowerCase())).map(u=>({...localPublicUser(u),level:Math.max(1,Math.floor((Number(u.xp)||0)/100)+1)}))}}
 const convo=path.match(/^\/messages\/(\d+)$/);
 if(convo&&method==='GET'){const all=localRead(LOCAL_KEYS.messages,[]);return {messages:all.filter(m=>(m.sender_id===user.id&&m.receiver_id===Number(convo[1]))||(m.receiver_id===user.id&&m.sender_id===Number(convo[1])))}}
 if(path==='/messages'&&method==='POST'){const receiverId=Number(body.receiverId);if(!localAccounts().some(u=>u.id===receiverId))localError('هذا اللاعب غير موجود محلياً');const all=localRead(LOCAL_KEYS.messages,[]);const message={id:Date.now(),sender_id:user.id,receiver_id:receiverId,body:String(body.body||'').trim(),created_at:new Date().toISOString()};if(!message.body)localError('اكتب رسالة أولاً');all.push(message);localWrite(LOCAL_KEYS.messages,all);return {ok:true,message}}
 localError('هذه الوظيفة غير متاحة في وضع التشغيل المحلي: '+path,404);
}
async function apiRequest(path,options={}){try{return await api(path,options)}catch(error){console.warn('Local app request:',path,error);return null}}

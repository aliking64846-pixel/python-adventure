const bcrypt = require('bcryptjs');
const playerModel = require('../models/player.model');
const { DEFAULT_SKILLS, DEFAULT_GAME_STATE, DEFAULT_LAB_STATS } = require('../config/defaults');
const { validateRegistration } = require('../validators/auth.validator');

async function register({username,email,password}) {
  username=String(username||'').trim(); email=String(email||'').trim().toLowerCase(); password=String(password||'');
  const error=validateRegistration({username,email,password}); if(error){const e=new Error(error);e.statusCode=400;throw e;}
  if(await playerModel.existsByUsernameOrEmail(username,email)){const e=new Error('اسم المستخدم أو الإيميل مستخدم مسبقاً');e.statusCode=409;throw e;}
  const passwordHash=await bcrypt.hash(password,12);
  return playerModel.create({username,email,passwordHash,skills:DEFAULT_SKILLS,gameState:DEFAULT_GAME_STATE,labStats:DEFAULT_LAB_STATS});
}
async function login({login,password}) {
  login=String(login||'').trim(); password=String(password||''); const user=await playerModel.findByLogin(login);
  if(!user || !(await bcrypt.compare(password,user.password_hash))){const e=new Error('بيانات الدخول غير صحيحة');e.statusCode=401;throw e;}
  return {id:user.id,username:user.username,email:user.email};
}
module.exports={register,login};

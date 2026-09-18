const service=require('../services/auth.service');
const playerService=require('../services/player.service');
async function register(req,res){const user=await service.register(req.body);req.session.userId=user.id;res.status(201).json({user});}
async function login(req,res){const user=await service.login({login:req.body.login??req.body.email,password:req.body.password});req.session.userId=user.id;res.json({user});}
async function me(req,res){const p=await playerService.getPlayer(req.session.userId);if(!p)return res.status(401).json({error:'الحساب غير موجود'});res.json({user:{id:p.id,username:p.username,email:p.email}});}
function logout(req,res,next){req.session.destroy(err=>{if(err)return next(err);res.json({ok:true});});}
module.exports={register,login,me,logout};

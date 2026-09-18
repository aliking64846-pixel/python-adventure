const service=require('../services/message.service');
async function users(req,res){res.json({users:await service.searchUsers(String(req.query.search||'').trim(),req.session.userId)});}
async function messages(req,res){res.json({messages:await service.conversation(req.session.userId,Number(req.params.userId))});}
async function send(req,res){res.status(201).json({ok:true,message:await service.send(req.session.userId,req.body||{})});}
module.exports={users,messages,send};

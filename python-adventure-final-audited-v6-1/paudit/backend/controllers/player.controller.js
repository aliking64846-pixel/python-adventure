const service=require('../services/player.service');
async function get(req,res){const player=await service.getPlayer(req.session.userId);if(!player)return res.status(404).json({error:'اللاعب غير موجود'});res.json({player});}
async function update(req,res){res.json({ok:true,player:await service.updatePlayer(req.session.userId,req.body||{})});}
module.exports={get,update};

const service=require('../services/game.service');
async function gameState(req,res){res.json({ok:true,gameState:await service.saveGameState(req.session.userId,req.body||{})});}
async function byte(req,res){res.json({ok:true,byte:await service.saveByte(req.session.userId,req.body||{})});}
async function lab(req,res){res.json({ok:true,labStats:await service.saveLab(req.session.userId,req.body||{})});}
module.exports={gameState,byte,lab};

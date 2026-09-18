const service=require('../services/lesson.service');
async function list(req,res){res.json({lessons:await service.list()});}
async function complete(req,res){res.json({ok:true,...await service.complete(req.session.userId,Number(req.params.id))});}
module.exports={list,complete};

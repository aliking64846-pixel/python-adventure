const {pool}=require('../db/pool');
const lessonModel=require('../models/lesson.model');
const playerService=require('./player.service');
const {lessons}=require('../config/defaults');
async function list(){return lessons;}
async function complete(userId,lessonId){const lesson=lessons.find(x=>x.id===lessonId);if(!lesson){const e=new Error('الدرس غير موجود');e.statusCode=404;throw e;}const client=await pool.connect();try{await client.query('BEGIN');const already=await lessonModel.isCompleted(userId,lessonId,client);if(!already){await lessonModel.markCompleted(userId,lessonId,client);await client.query('UPDATE players SET xp=xp+$1,skill_points=skill_points+1,progress=LEAST(100,progress+5),updated_at=NOW() WHERE id=$2',[lesson.xp,userId]);}await client.query('COMMIT');return {alreadyCompleted:already,xpEarned:already?0:lesson.xp,player:await playerService.getPlayer(userId)};}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}}
module.exports={list,complete};

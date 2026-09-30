const playerModel=require('../models/player.model');
const {mergeGameState}=require('../utils/game-state');
async function saveGameState(userId,body){const state=mergeGameState(body);if(Object.prototype.hasOwnProperty.call(body,'progress')){const n=Number(body.progress);if(Number.isFinite(n))state.map.stage=Math.max(1,Math.min(6,Math.ceil(n/17)));}await playerModel.updateJson(userId,'game_state',state);return state;}
async function saveByte(userId,body){const state={level:Math.max(1,Number(body.level)||1),bond:Math.max(0,Number(body.bond)||0),energy:Math.max(0,Number(body.energy)||0),state:String(body.state||'idle').slice(0,50),memory:Array.isArray(body.memory)?body.memory.slice(-30):[]};await playerModel.updateJson(userId,'byte_state',state);return state;}
async function saveLab(userId,body){const stats={runs:Math.max(0,Number(body.runs)||0),successes:Math.max(0,Number(body.successes)||0),errors:Math.max(0,Number(body.errors)||0)};await playerModel.updateJson(userId,'lab_stats',stats);return stats;}
module.exports={saveGameState,saveByte,saveLab};

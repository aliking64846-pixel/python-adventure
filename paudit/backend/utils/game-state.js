const {DEFAULT_GAME_STATE}=require('../config/defaults');
function mergeGameState(saved){const s=saved&&typeof saved==='object'?saved:{};return {...DEFAULT_GAME_STATE,...s,quests:{...DEFAULT_GAME_STATE.quests,...(s.quests||{})},achievements:{...DEFAULT_GAME_STATE.achievements,...(s.achievements||{})},map:{...DEFAULT_GAME_STATE.map,...(s.map||{})},chest:{...DEFAULT_GAME_STATE.chest,...(s.chest||{})},lab:{...DEFAULT_GAME_STATE.lab,...(s.lab||{})},inventory:Array.isArray(s.inventory)&&s.inventory.length?s.inventory:DEFAULT_GAME_STATE.inventory};}
module.exports={mergeGameState};

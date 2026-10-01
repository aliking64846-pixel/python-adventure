let gameState = {
  inventory: ['print()', 'input()', 'int()', 'float()', 'type()', '+', '*', '/'],
  quests: { q1:false, q2:false, q3:false, q4:false },
  achievements: { first:true, variables:false, debug:false, master:false },
  map: { stage:1 },
  chest: { opened:0 },
  lab: { runs:0, successes:0, errors:0 },
  platform: { streak:0, lastDaily:'', dailyDone:false, dailyKey:'', review:[], projects:{}, placement:{done:false,score:0}, totalSessions:0 }
};
function mergeGameState(saved) {
  if (!saved || typeof saved !== 'object') return;
  gameState = {
    ...gameState, ...saved,
    quests:{...gameState.quests,...(saved.quests||{})},
    achievements:{...gameState.achievements,...(saved.achievements||{})},
    map:{...gameState.map,...(saved.map||{})},
    chest:{...gameState.chest,...(saved.chest||{})},
    lab:{...gameState.lab,...(saved.lab||{})},
    platform:{...gameState.platform,...(saved.platform||{}),review:Array.isArray(saved.platform?.review)?saved.platform.review:gameState.platform.review,projects:{...gameState.platform.projects,...(saved.platform?.projects||{})},placement:{...gameState.platform.placement,...(saved.platform?.placement||{})}},
    inventory:Array.isArray(saved.inventory)&&saved.inventory.length ? saved.inventory : gameState.inventory
  };
}
function collectGameState() {
  return {
    inventory:gameState.inventory,
    quests:gameState.quests,
    achievements:gameState.achievements,
    map:{stage:Math.max(1,Math.min(10,Math.ceil(Number(progress||0)/10)))},
    chest:gameState.chest,
    lab:gameState.lab,
    platform:gameState.platform
  };
}

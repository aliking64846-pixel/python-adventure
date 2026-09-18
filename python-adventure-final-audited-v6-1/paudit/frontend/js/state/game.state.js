let gameState = {
  inventory: ['print()', 'input()', 'int()', 'float()', 'type()', '+', '*', '/'],
  quests: { q1:false, q2:false, q3:false, q4:false },
  achievements: { first:true, variables:false, debug:false, master:false },
  map: { stage:1 },
  chest: { opened:0 },
  lab: { runs:0, successes:0, errors:0 }
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
    inventory:Array.isArray(saved.inventory)&&saved.inventory.length ? saved.inventory : gameState.inventory
  };
}
function collectGameState() {
  return {
    inventory:gameState.inventory,
    quests:gameState.quests,
    achievements:gameState.achievements,
    map:{stage:Math.max(1,Math.min(6,Math.ceil(Number(progress||0)/17)))},
    chest:gameState.chest,
    lab:gameState.lab
  };
}

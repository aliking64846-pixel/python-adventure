const {requireAuth}=require('../middleware/auth');const {asyncHandler}=require('../utils/async-handler');const c=require('../controllers/game.controller');
function registerGameRoutes(r){r.put('/game-state',requireAuth,asyncHandler(c.gameState));r.put('/byte',requireAuth,asyncHandler(c.byte));r.put('/lab',requireAuth,asyncHandler(c.lab));}
module.exports={registerGameRoutes};

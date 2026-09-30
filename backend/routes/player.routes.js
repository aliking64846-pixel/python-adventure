const {requireAuth}=require('../middleware/auth');const {asyncHandler}=require('../utils/async-handler');const c=require('../controllers/player.controller');
function registerPlayerRoutes(r){r.get('/player',requireAuth,asyncHandler(c.get));r.put('/player',requireAuth,asyncHandler(c.update));}
module.exports={registerPlayerRoutes};

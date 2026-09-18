const {requireAuth}=require('../middleware/auth');const {asyncHandler}=require('../utils/async-handler');const c=require('../controllers/auth.controller');
function registerAuthRoutes(r){r.post('/auth/register',asyncHandler(c.register));r.post('/auth/login',asyncHandler(c.login));r.get('/auth/me',requireAuth,asyncHandler(c.me));r.post('/auth/logout',asyncHandler(c.logout));}
module.exports={registerAuthRoutes};

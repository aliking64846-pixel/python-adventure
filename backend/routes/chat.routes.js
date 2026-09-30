const {requireAuth}=require('../middleware/auth');const {asyncHandler}=require('../utils/async-handler');const c=require('../controllers/message.controller');
function registerChatRoutes(r){r.get('/users',requireAuth,asyncHandler(c.users));r.get('/messages/:userId',requireAuth,asyncHandler(c.messages));r.post('/messages',requireAuth,asyncHandler(c.send));}
module.exports={registerChatRoutes};

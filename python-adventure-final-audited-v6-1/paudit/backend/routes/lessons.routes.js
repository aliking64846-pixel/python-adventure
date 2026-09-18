const {requireAuth}=require('../middleware/auth');const {asyncHandler}=require('../utils/async-handler');const c=require('../controllers/lesson.controller');
function registerLessonsRoutes(r){r.get('/lessons',requireAuth,asyncHandler(c.list));r.post('/lessons/:id/complete',requireAuth,asyncHandler(c.complete));}
module.exports={registerLessonsRoutes};

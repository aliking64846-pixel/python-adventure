const model=require('../models/message.model');
const {validateMessage}=require('../validators/message.validator');
async function searchUsers(search,currentUserId){return model.searchUsers(search,currentUserId);}
async function conversation(userId,otherId){if(!Number.isInteger(otherId)||otherId<=0){const e=new Error('المستخدم غير صحيح');e.statusCode=400;throw e;}if(!(await model.userExists(otherId))){const e=new Error('المستخدم غير موجود');e.statusCode=404;throw e;}return model.conversation(userId,otherId);}
async function send(senderId,{receiverId,body}){receiverId=Number(receiverId);body=String(body||'').trim();const error=validateMessage({senderId,receiverId,body});if(error){const e=new Error(error);e.statusCode=400;throw e;}if(!(await model.userExists(receiverId))){const e=new Error('المستلم غير موجود');e.statusCode=404;throw e;}return model.create(senderId,receiverId,body.slice(0,2000));}
module.exports={searchUsers,conversation,send};

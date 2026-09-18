const { pool } = require('../db/pool');
async function searchUsers(search, currentUserId, db=pool) { const { rows }=await db.query(`SELECT id,username,xp FROM players WHERE username ILIKE $1 AND id<>$2 ORDER BY username LIMIT 20`, [`%${search}%`,currentUserId]); return rows.map(r=>({id:r.id,username:r.username,level:Math.max(1,Math.floor(Number(r.xp||0)/500)+1)})); }
async function conversation(userId, otherId, db=pool) { const { rows }=await db.query(`SELECT id,sender_id,receiver_id,body,created_at FROM messages WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1) ORDER BY created_at ASC LIMIT 100`,[userId,otherId]); return rows; }
async function create(senderId, receiverId, body, db=pool) { const { rows }=await db.query(`INSERT INTO messages(sender_id,receiver_id,body) VALUES($1,$2,$3) RETURNING id,sender_id,receiver_id,body,created_at`,[senderId,receiverId,body]); return rows[0]; }
async function userExists(id, db=pool) { const {rows}=await db.query('SELECT id,username FROM players WHERE id=$1',[id]); return rows[0]||null; }
module.exports={searchUsers,conversation,create,userExists};

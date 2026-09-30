const { pool } = require('../db/pool');
async function isCompleted(userId, lessonId, db=pool) { const { rows } = await db.query('SELECT 1 FROM lesson_progress WHERE user_id=$1 AND lesson_id=$2', [userId, lessonId]); return Boolean(rows[0]); }
async function markCompleted(userId, lessonId, db=pool) { await db.query('INSERT INTO lesson_progress(user_id,lesson_id) VALUES($1,$2) ON CONFLICT(user_id,lesson_id) DO NOTHING', [userId, lessonId]); }
async function listCompleted(userId, db=pool) { const { rows }=await db.query('SELECT lesson_id FROM lesson_progress WHERE user_id=$1 ORDER BY lesson_id',[userId]); return rows.map(r=>Number(r.lesson_id)); }
module.exports={isCompleted,markCompleted,listCompleted};

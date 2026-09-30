const { pool } = require('../db/pool');

async function findById(id, db = pool) {
  const { rows } = await db.query(`SELECT id, username, email, xp, coins, progress, skill_points, skill_levels, game_state, byte_state, lab_stats FROM players WHERE id=$1`, [id]);
  return rows[0] || null;
}

async function findByLogin(login, db = pool) {
  const { rows } = await db.query(`SELECT id, username, email, password_hash FROM players WHERE lower(username)=lower($1) OR lower(email)=lower($1) LIMIT 1`, [login]);
  return rows[0] || null;
}

async function existsByUsernameOrEmail(username, email, db = pool) {
  const { rows } = await db.query(`SELECT id FROM players WHERE lower(username)=lower($1) OR lower(email)=lower($2) LIMIT 1`, [username, email]);
  return Boolean(rows[0]);
}

async function create({ username, email, passwordHash, skills, gameState, labStats }, db = pool) {
  const { rows } = await db.query(`INSERT INTO players (username,email,password_hash,skill_levels,game_state,lab_stats) VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb) RETURNING id,username,email`, [username,email,passwordHash,JSON.stringify(skills),JSON.stringify(gameState),JSON.stringify(labStats)]);
  return rows[0];
}

async function updateProgress(id, { xp, coins, progress, skillPoints, skillLevels }, db = pool) {
  const { rows } = await db.query(`UPDATE players SET xp=COALESCE($1,xp), coins=COALESCE($2,coins), progress=COALESCE($3,progress), skill_points=COALESCE($4,skill_points), skill_levels=COALESCE($5::jsonb,skill_levels), updated_at=NOW() WHERE id=$6 RETURNING id`, [xp,coins,progress,skillPoints,skillLevels ? JSON.stringify(skillLevels) : null,id]);
  return Boolean(rows[0]);
}

async function updateJson(id, column, value, db = pool) {
  const allowed = new Set(['game_state','byte_state','lab_stats']);
  if (!allowed.has(column)) throw new Error('Invalid player JSON column');
  await db.query(`UPDATE players SET ${column}=$1::jsonb, updated_at=NOW() WHERE id=$2`, [JSON.stringify(value), id]);
}

async function upgradeSkill(id, key, maxLevel = 5, db = pool) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`SELECT skill_points, skill_levels FROM players WHERE id=$1 FOR UPDATE`, [id]);
    if (!rows[0]) { const e=new Error('اللاعب غير موجود'); e.statusCode=404; throw e; }
    const levels = rows[0].skill_levels || {};
    const current = Math.max(0, Number(levels[key]) || 0);
    if (rows[0].skill_points <= 0) { const e=new Error('لا توجد نقاط مهارة'); e.statusCode=400; throw e; }
    if (current >= maxLevel) { const e=new Error('المهارة وصلت للمستوى 5'); e.statusCode=400; throw e; }
    levels[key] = current + 1;
    await client.query(`UPDATE players SET skill_points=skill_points-1, skill_levels=$1::jsonb, updated_at=NOW() WHERE id=$2`, [JSON.stringify(levels), id]);
    await client.query('COMMIT');
    return { skillPoints: rows[0].skill_points - 1, skillLevels: levels };
  } catch (e) { await client.query('ROLLBACK'); throw e; }
  finally { client.release(); }
}

module.exports = { findById, findByLogin, existsByUsernameOrEmail, create, updateProgress, updateJson, upgradeSkill };

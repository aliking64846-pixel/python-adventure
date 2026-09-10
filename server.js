const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database(path.join(__dirname, '../database/python_adventure.db'));

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  level INTEGER NOT NULL DEFAULT 12,
  xp INTEGER NOT NULL DEFAULT 2450,
  coins INTEGER NOT NULL DEFAULT 1250,
  progress INTEGER NOT NULL DEFAULT 40,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS player_lessons (
  player_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (player_id, lesson_id),
  FOREIGN KEY(player_id) REFERENCES players(id),
  FOREIGN KEY(lesson_id) REFERENCES lessons(id)
);

CREATE TABLE IF NOT EXISTS byte_state (
  player_id INTEGER PRIMARY KEY,
  level INTEGER NOT NULL DEFAULT 12,
  bond INTEGER NOT NULL DEFAULT 38,
  energy INTEGER NOT NULL DEFAULT 72,
  state TEXT NOT NULL DEFAULT 'FOLLOW',
  memory_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(player_id) REFERENCES players(id)
);
`);

db.prepare(`
INSERT OR IGNORE INTO players(username, level, xp, coins, progress)
VALUES (?, 12, 2450, 1250, 40)
`).run('demo');

const player = db.prepare('SELECT id FROM players WHERE username=?').get('demo');
db.prepare(`
INSERT OR IGNORE INTO lessons(id,title,description,xp_reward)
VALUES (1,?,?,?)
`).run('🐍 ما هي Python؟', 'أساسيات Python والدالة print()', 100);

db.prepare(`
INSERT OR IGNORE INTO byte_state(player_id, level, bond, energy, state, memory_json)
VALUES (?,12,38,72,'FOLLOW','[]')
`).run(player.id);

app.use(express.json({limit:'1mb'}));
app.use(express.static(path.join(__dirname, '../frontend')));

function getPlayer() {
  return db.prepare('SELECT * FROM players WHERE username=?').get('demo');
}
function getByte() {
  const p = getPlayer();
  const b = db.prepare('SELECT * FROM byte_state WHERE player_id=?').get(p.id);
  return {...b, memory: JSON.parse(b.memory_json || '[]')};
}

app.get('/api/health', (req,res) => res.json({ok:true, database:'sqlite'}));

app.get('/api/player', (req,res) => {
  res.json({player:getPlayer(), byte:getByte()});
});

app.put('/api/player', (req,res) => {
  const {xp,coins,progress} = req.body;
  db.prepare(`
    UPDATE players
    SET xp=COALESCE(?,xp), coins=COALESCE(?,coins),
        progress=COALESCE(?,progress), updated_at=CURRENT_TIMESTAMP
    WHERE username='demo'
  `).run(xp,coins,progress);
  res.json({player:getPlayer()});
});

app.put('/api/byte', (req,res) => {
  const p = getPlayer();
  const {level,bond,energy,state,memory} = req.body;
  db.prepare(`
    UPDATE byte_state SET
      level=COALESCE(?,level), bond=COALESCE(?,bond),
      energy=COALESCE(?,energy), state=COALESCE(?,state),
      memory_json=COALESCE(?,memory_json), updated_at=CURRENT_TIMESTAMP
    WHERE player_id=?
  `).run(level,bond,energy,state,
         memory === undefined ? null : JSON.stringify(memory), p.id);
  res.json({byte:getByte()});
});

app.post('/api/lessons/:id/complete', (req,res) => {
  const lessonId = Number(req.params.id);
  const p = getPlayer();
  const lesson = db.prepare('SELECT * FROM lessons WHERE id=?').get(lessonId);
  if (!lesson) return res.status(404).json({error:'Lesson not found'});

  const already = db.prepare(
    'SELECT 1 FROM player_lessons WHERE player_id=? AND lesson_id=?'
  ).get(p.id, lessonId);

  if (!already) {
    db.prepare(
      'INSERT INTO player_lessons(player_id,lesson_id) VALUES (?,?)'
    ).run(p.id,lessonId);

    db.prepare(`
      UPDATE players
      SET xp=xp+?, progress=MIN(100,progress+10), updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(lesson.xp_reward,p.id);
  }
  res.json({player:getPlayer(), lesson, alreadyCompleted:!!already});
});

app.get('/api/lessons', (req,res) => {
  const p = getPlayer();
  const rows = db.prepare(`
    SELECT l.*, pl.completed_at
    FROM lessons l
    LEFT JOIN player_lessons pl
      ON pl.lesson_id=l.id AND pl.player_id=?
    ORDER BY l.id
  `).all(p.id);
  res.json({lessons:rows});
});

app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Python Adventure running at http://localhost:${PORT}`);
});

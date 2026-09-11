const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 10000;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. The server will not be able to use PostgreSQL.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

app.set("trust proxy", 1);
app.use(express.json({ limit: "100kb" }));

app.use(session({
  store: new pgSession({
    pool,
    tableName: "user_sessions",
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || "change-this-secret-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 30
  }
}));

const lessons = [
  {id:1, xp:100, skill:"memory"},
  {id:2, xp:150, skill:"memory"},
  {id:3, xp:175, skill:"solve"},
  {id:4, xp:200, skill:"detect"},
  {id:5, xp:250, skill:"speed"},
  {id:6, xp:300, skill:"build"}
];

const validSkills = ["memory","debug","detect","speed","build","solve"];

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({error:"يجب تسجيل الدخول أولاً"});
  next();
}

async function getPlayer(userId) {
  const p = await pool.query(
    `SELECT id, username, email, xp, coins, progress, skill_points, skill_levels
     FROM players WHERE id=$1`,
    [userId]
  );
  if (!p.rows[0]) return null;

  const completed = await pool.query(
    `SELECT lesson_id FROM lesson_progress WHERE user_id=$1 ORDER BY lesson_id`,
    [userId]
  );

  return {
    ...p.rows[0],
    skillPoints: p.rows[0].skill_points,
    skillLevels: p.rows[0].skill_levels || {},
    completedLessons: completed.rows.map(r => Number(r.lesson_id))
  };
}

function publicUser(p) {
  return { id: p.id, username: p.username, email: p.email };
}

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ok:true, database:"connected"});
  } catch (e) {
    res.status(503).json({ok:false, database:"error"});
  }
});

app.post("/auth/register", async (req, res) => {
  const username = String(req.body.username || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!/^[\w\u0600-\u06FF-]{3,30}$/u.test(username))
    return res.status(400).json({error:"اسم المستخدم يجب أن يكون بين 3 و30 حرفاً"});
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({error:"الإيميل غير صحيح"});
  if (password.length < 6)
    return res.status(400).json({error:"كلمة المرور يجب أن تكون 6 أحرف على الأقل"});

  try {
    const exists = await pool.query(
      "SELECT id FROM players WHERE lower(username)=lower($1) OR lower(email)=lower($2)",
      [username, email]
    );
    if (exists.rows.length)
      return res.status(409).json({error:"اسم المستخدم أو الإيميل مستخدم مسبقاً"});

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO players
       (username,email,password_hash,xp,coins,progress,skill_points,skill_levels)
       VALUES ($1,$2,$3,0,100,0,0,$4::jsonb)
       RETURNING id,username,email`,
      [username, email, hash, JSON.stringify({memory:1,debug:0,detect:0,speed:0,build:0,solve:0})]
    );

    req.session.userId = result.rows[0].id;
    res.status(201).json({user: publicUser(result.rows[0])});
  } catch (e) {
    console.error(e);
    res.status(500).json({error:"تعذر إنشاء الحساب"});
  }
});

app.post("/auth/login", async (req, res) => {
  const login = String(req.body.login || "").trim();
  const password = String(req.body.password || "");

  try {
    const result = await pool.query(
      `SELECT id,username,email,password_hash FROM players
       WHERE lower(username)=lower($1) OR lower(email)=lower($1) LIMIT 1`,
      [login]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({error:"بيانات الدخول غير صحيحة"});

    req.session.userId = user.id;
    res.json({user: publicUser(user)});
  } catch (e) {
    console.error(e);
    res.status(500).json({error:"تعذر تسجيل الدخول"});
  }
});

app.get("/auth/me", requireAuth, async (req, res) => {
  const result = await pool.query("SELECT id,username,email FROM players WHERE id=$1", [req.session.userId]);
  if (!result.rows[0]) {
    req.session.destroy(() => {});
    return res.status(401).json({error:"الجلسة غير صالحة"});
  }
  res.json({user: publicUser(result.rows[0])});
});

app.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ok:true});
  });
});

app.get("/player", requireAuth, async (req, res) => {
  try {
    const player = await getPlayer(req.session.userId);
    if (!player) return res.status(404).json({error:"اللاعب غير موجود"});
    res.json({player});
  } catch (e) {
    console.error(e);
    res.status(500).json({error:"تعذر تحميل بيانات اللاعب"});
  }
});

app.put("/player", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { coins, xp, progress, upgradeSkill } = req.body;

  try {
    if (upgradeSkill) {
      if (!validSkills.includes(upgradeSkill))
        return res.status(400).json({error:"مهارة غير صالحة"});

      const current = await getPlayer(userId);
      if (!current) return res.status(404).json({error:"اللاعب غير موجود"});
      if (current.skillPoints <= 0) return res.status(400).json({error:"لا توجد نقاط مهارة"});
      if ((current.skillLevels[upgradeSkill] || 0) >= 5)
        return res.status(400).json({error:"المهارة وصلت للمستوى 5"});

      const levels = {...current.skillLevels};
      levels[upgradeSkill] = (levels[upgradeSkill] || 0) + 1;

      await pool.query(
        "UPDATE players SET skill_points=skill_points-1, skill_levels=$1::jsonb, updated_at=NOW() WHERE id=$2",
        [JSON.stringify(levels), userId]
      );
    } else {
      // These fields are intentionally restricted to non-negative numbers.
      // Game actions that award XP/coins should ideally be moved to dedicated
      // server-side endpoints as the game grows.
      const fields = [];
      const values = [];
      let i = 1;
      if (Number.isFinite(Number(coins)) && Number(coins) >= 0) {
        fields.push(`coins=$${i++}`); values.push(Math.floor(Number(coins)));
      }
      if (Number.isFinite(Number(xp)) && Number(xp) >= 0) {
        fields.push(`xp=$${i++}`); values.push(Math.floor(Number(xp)));
      }
      if (Number.isFinite(Number(progress)) && Number(progress) >= 0 && Number(progress) <= 100) {
        fields.push(`progress=$${i++}`); values.push(Math.floor(Number(progress)));
      }
      if (fields.length) {
        values.push(userId);
        await pool.query(`UPDATE players SET ${fields.join(",")}, updated_at=NOW() WHERE id=$${i}`, values);
      }
    }

    res.json({player: await getPlayer(userId)});
  } catch (e) {
    console.error(e);
    res.status(500).json({error:"تعذر حفظ بيانات اللاعب"});
  }
});

app.post("/lessons/:id/complete", requireAuth, async (req, res) => {
  const lessonId = Number(req.params.id);
  const lesson = lessons.find(l => l.id === lessonId);
  if (!lesson) return res.status(404).json({error:"الدرس غير موجود"});

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const already = await client.query(
      "SELECT 1 FROM lesson_progress WHERE user_id=$1 AND lesson_id=$2",
      [req.session.userId, lessonId]
    );
    if (already.rows.length) {
      await client.query("ROLLBACK");
      return res.status(409).json({error:"هذا الدرس مكتمل بالفعل"});
    }

    if (lessonId > 1) {
      const prev = await client.query(
        "SELECT 1 FROM lesson_progress WHERE user_id=$1 AND lesson_id=$2",
        [req.session.userId, lessonId - 1]
      );
      if (!prev.rows.length) {
        await client.query("ROLLBACK");
        return res.status(400).json({error:"أكمل الدرس السابق أولاً"});
      }
    }

    await client.query(
      "INSERT INTO lesson_progress(user_id,lesson_id) VALUES($1,$2)",
      [req.session.userId, lessonId]
    );

    const total = lessons.length;
    const progress = Math.round((lessonId / total) * 100);
    const skillMap = {memory:"memory",debug:"debug",detect:"detect",speed:"speed",build:"build",solve:"solve"};
    const skill = skillMap[lesson.skill] || "solve";

    const current = await client.query(
      "SELECT xp,coins,skill_points,skill_levels FROM players WHERE id=$1 FOR UPDATE",
      [req.session.userId]
    );
    const row = current.rows[0];
    const levels = {...(row.skill_levels || {})};
    const newXp = Number(row.xp) + lesson.xp;
    const newCoins = Number(row.coins) + 25;
    levels[skill] = Math.min(5, Number(levels[skill] || 0) + 1);

    await client.query(
      `UPDATE players SET xp=$1,coins=$2,progress=$3,skill_points=skill_points+1,
       skill_levels=$4::jsonb,updated_at=NOW() WHERE id=$5`,
      [newXp,newCoins,progress,JSON.stringify(levels),req.session.userId]
    );

    await client.query("COMMIT");
    res.json({player: await getPlayer(req.session.userId)});
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({error:"تعذر إكمال الدرس"});
  } finally {
    client.release();
  }
});

app.get("/users", requireAuth, async (req, res) => {
  const search = String(req.query.search || "").trim();
  if (!search) return res.json({users:[]});

  try {
    const result = await pool.query(
      `SELECT id,username,xp FROM players
       WHERE id<>$1 AND username ILIKE $2
       ORDER BY username LIMIT 20`,
      [req.session.userId, `%${search}%`]
    );
    res.json({
      users: result.rows.map(u => ({
        id:u.id, username:u.username, level:Math.max(1,Math.floor(Number(u.xp)/500)+1)
      }))
    });
  } catch (e) {
    res.status(500).json({error:"تعذر البحث عن اللاعبين"});
  }
});

app.get("/messages/:userId", requireAuth, async (req, res) => {
  const other = Number(req.params.userId);
  if (!Number.isInteger(other)) return res.status(400).json({error:"معرف غير صالح"});

  try {
    const result = await pool.query(
      `SELECT id,sender_id,receiver_id,body,created_at
       FROM messages
       WHERE (sender_id=$1 AND receiver_id=$2)
          OR (sender_id=$2 AND receiver_id=$1)
       ORDER BY created_at ASC LIMIT 200`,
      [req.session.userId, other]
    );
    res.json({messages:result.rows});
  } catch (e) {
    res.status(500).json({error:"تعذر تحميل الرسائل"});
  }
});

app.post("/messages", requireAuth, async (req, res) => {
  const receiverId = Number(req.body.receiverId);
  const body = String(req.body.body || "").trim();

  if (!Number.isInteger(receiverId) || receiverId === req.session.userId)
    return res.status(400).json({error:"المستلم غير صالح"});
  if (!body || body.length > 2000)
    return res.status(400).json({error:"الرسالة فارغة أو طويلة جداً"});

  try {
    const exists = await pool.query("SELECT 1 FROM players WHERE id=$1", [receiverId]);
    if (!exists.rows.length) return res.status(404).json({error:"اللاعب غير موجود"});

    const result = await pool.query(
      `INSERT INTO messages(sender_id,receiver_id,body)
       VALUES($1,$2,$3) RETURNING id,sender_id,receiver_id,body,created_at`,
      [req.session.userId, receiverId, body]
    );
    res.status(201).json({message:result.rows[0]});
  } catch (e) {
    res.status(500).json({error:"تعذر إرسال الرسالة"});
  }
});

app.use(express.static(path.join(__dirname, "public")));

// Express 5 no longer accepts the old app.get("*") wildcard syntax.
// Use a normal middleware fallback for browser routes instead.
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/auth/") &&
      !req.path.startsWith("/player") &&
      !req.path.startsWith("/lessons/") &&
      !req.path.startsWith("/users") &&
      !req.path.startsWith("/messages/") &&
      req.path !== "/health") {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
  }
  next();
});

// Create the application tables automatically on first startup.
// This avoids having to open a SQL console on Railway.
async function initDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      username VARCHAR(30) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      xp INTEGER NOT NULL DEFAULT 0,
      coins INTEGER NOT NULL DEFAULT 100,
      progress INTEGER NOT NULL DEFAULT 0,
      skill_points INTEGER NOT NULL DEFAULT 0,
      skill_levels JSONB NOT NULL DEFAULT '{"memory":1,"debug":0,"detect":0,"speed":0,"build":0,"solve":0}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      lesson_id INTEGER NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      sender_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      receiver_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_lesson_progress_user
      ON lesson_progress(user_id);

    CREATE INDEX IF NOT EXISTS idx_messages_pair
      ON messages(sender_id, receiver_id, created_at);
  `);

  console.log("Database tables are ready.");
}

async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Python Adventure running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server startup failed:", err);
  process.exit(1);
});

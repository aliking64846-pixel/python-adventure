const express = require('express');
const path = require('path');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const AUTH_SECRET =
  process.env.AUTH_SECRET || 'python-adventure-change-this-secret';

const db = new Database(
  path.join(__dirname, '../database/python_adventure.db')
);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  password_hash TEXT,
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
  FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS byte_state (
  player_id INTEGER PRIMARY KEY,
  level INTEGER NOT NULL DEFAULT 12,
  bond INTEGER NOT NULL DEFAULT 38,
  energy INTEGER NOT NULL DEFAULT 72,
  state TEXT NOT NULL DEFAULT 'FOLLOW',
  memory_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TEXT,
  FOREIGN KEY(sender_id) REFERENCES players(id) ON DELETE CASCADE,
  FOREIGN KEY(receiver_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
ON messages(sender_id, receiver_id, id);

CREATE INDEX IF NOT EXISTS idx_messages_receiver
ON messages(receiver_id, read_at);
`);

function ensureColumn(name, definition) {
  try {
    db.prepare(
      `ALTER TABLE players ADD COLUMN ${name} ${definition}`
    ).run();
  } catch (_) {}
}

ensureColumn('email', 'TEXT');
ensureColumn('password_hash', 'TEXT');

try {
  db.prepare(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_players_email
    ON players(email)
    WHERE email IS NOT NULL
  `).run();
} catch (_) {}

db.prepare(`
INSERT OR IGNORE INTO players(
  username, level, xp, coins, progress
)
VALUES (?, 12, 2450, 1250, 40)
`).run('demo');

const demo = db
  .prepare('SELECT id FROM players WHERE username=?')
  .get('demo');

db.prepare(`
INSERT OR IGNORE INTO lessons(
  id, title, description, xp_reward
)
VALUES (1, ?, ?, ?)
`).run(
  '🐍 ما هي Python؟',
  'أساسيات Python والدالة print()',
  100
);

db.prepare(`
INSERT OR IGNORE INTO byte_state(
  player_id,
  level,
  bond,
  energy,
  state,
  memory_json
)
VALUES (?, 12, 38, 72, 'FOLLOW', '[]')
`).run(demo.id);


/* =========================
   Authentication
========================= */

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');

  const derived = crypto
    .scryptSync(password, salt, 64)
    .toString('hex');

  return `${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  try {
    const [salt, key] = String(stored).split(':');

    if (!salt || !key) {
      return false;
    }

    const derived = crypto
      .scryptSync(password, salt, 64)
      .toString('hex');

    const a = Buffer.from(key, 'hex');
    const b = Buffer.from(derived, 'hex');

    return (
      a.length === b.length &&
      crypto.timingSafeEqual(a, b)
    );
  } catch (_) {
    return false;
  }
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function createToken(userId) {
  const payload = base64url(
    JSON.stringify({
      userId,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000
    })
  );

  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
}

function verifyToken(token) {
  try {
    const [payload, signature] =
      String(token || '').split('.');

    if (!payload || !signature) {
      return null;
    }

    const expected = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payload)
      .digest('base64url');

    const a = Buffer.from(signature);
    const b = Buffer.from(expected);

    if (
      a.length !== b.length ||
      !crypto.timingSafeEqual(a, b)
    ) {
      return null;
    }

    const data = JSON.parse(
      Buffer.from(payload, 'base64url').toString()
    );

    if (
      !data.userId ||
      !data.exp ||
      Date.now() > data.exp
    ) {
      return null;
    }

    return data.userId;
  } catch (_) {
    return null;
  }
}

function getCookie(req, name) {
  const header = req.headers.cookie || '';

  const part = header
    .split(';')
    .map(v => v.trim())
    .find(v => v.startsWith(name + '='));

  return part
    ? decodeURIComponent(
        part.substring(name.length + 1)
      )
    : null;
}

function setAuthCookie(res, token) {
  const secure =
    process.env.NODE_ENV === 'production'
      ? '; Secure'
      : '';

  res.setHeader(
    'Set-Cookie',
    `auth_token=${encodeURIComponent(
      token
    )}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secure}`
  );
}

function clearAuthCookie(res) {
  res.setHeader(
    'Set-Cookie',
    'auth_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'
  );
}

function currentUser(req) {
  const userId = verifyToken(
    getCookie(req, 'auth_token')
  );

  if (!userId) {
    return null;
  }

  return db.prepare(`
    SELECT
      id,
      username,
      email,
      level,
      xp,
      coins,
      progress,
      created_at,
      updated_at
    FROM players
    WHERE id=?
  `).get(userId) || null;
}

function authRequired(req, res, next) {
  const user = currentUser(req);

  if (!user) {
    return res.status(401).json({
      error: 'يجب تسجيل الدخول أولاً'
    });
  }

  req.user = user;
  next();
}

function getPlayerById(id) {
  return db.prepare(`
    SELECT
      id,
      username,
      email,
      level,
      xp,
      coins,
      progress,
      created_at,
      updated_at
    FROM players
    WHERE id=?
  `).get(id);
}

function getByte(playerId) {
  const b = db
    .prepare(
      'SELECT * FROM byte_state WHERE player_id=?'
    )
    .get(playerId);

  if (!b) {
    db.prepare(`
      INSERT INTO byte_state(
        player_id,
        level,
        bond,
        energy,
        state,
        memory_json
      )
      VALUES (?, 12, 38, 72, 'FOLLOW', '[]')
    `).run(playerId);

    return getByte(playerId);
  }

  return {
    ...b,
    memory: JSON.parse(b.memory_json || '[]')
  };
}


/* =========================
   Middleware
========================= */

app.use(
  express.json({
    limit: '1mb'
  })
);

app.use(
  express.static(
    path.join(__dirname, '../frontend')
  )
);


/* =========================
   Public API
========================= */

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    database: 'sqlite'
  });
});


/* =========================
   Register
========================= */

app.post('/api/auth/register', async (req, res) => {
  try {
    const username = String(
      req.body.username || ''
    ).trim();

    const email = String(
      req.body.email || ''
    ).trim().toLowerCase();

    const password = String(
      req.body.password || ''
    );

    if (
      !/^[\p{L}\p{N}_]{3,20}$/u.test(
        username
      )
    ) {
      return res.status(400).json({
        error:
          'اسم المستخدم يجب أن يكون 3-20 حرفًا أو رقمًا أو _'
      });
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      return res.status(400).json({
        error: 'الإيميل غير صحيح'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error:
          'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
      });
    }

    const exists = db.prepare(`
      SELECT id
      FROM players
      WHERE username=? OR email=?
    `).get(username, email);

    if (exists) {
      return res.status(409).json({
        error:
          'اسم المستخدم أو الإيميل مستخدم بالفعل'
      });
    }

    const hash = hashPassword(password);

    const result = db.prepare(`
      INSERT INTO players(
        username,
        email,
        password_hash,
        level,
        xp,
        coins,
        progress
      )
      VALUES (?, ?, ?, 1, 0, 100, 0)
    `).run(
      username,
      email,
      hash
    );

    const userId = result.lastInsertRowid;

    db.prepare(`
      INSERT INTO byte_state(
        player_id,
        level,
        bond,
        energy,
        state,
        memory_json
      )
      VALUES (?, 1, 10, 100, 'FOLLOW', '[]')
    `).run(userId);

    const user = getPlayerById(userId);

    setAuthCookie(
      res,
      createToken(userId)
    );

    res.status(201).json({
      user
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'تعذر إنشاء الحساب'
    });
  }
});


/* =========================
   Login
========================= */

app.post('/api/auth/login', async (req, res) => {
  try {
    const login = String(
      req.body.login || ''
    ).trim();

    const password = String(
      req.body.password || ''
    );

    const user = db.prepare(`
      SELECT *
      FROM players
      WHERE username=? OR email=?
    `).get(
      login,
      login.toLowerCase()
    );

    if (
      !user ||
      !user.password_hash
    ) {
      return res.status(401).json({
        error:
          'اسم المستخدم/الإيميل أو كلمة المرور غير صحيحة'
      });
    }

    const ok = verifyPassword(
      password,
      user.password_hash
    );

    if (!ok) {
      return res.status(401).json({
        error:
          'اسم المستخدم/الإيميل أو كلمة المرور غير صحيحة'
      });
    }

    setAuthCookie(
      res,
      createToken(user.id)
    );

    res.json({
      user: getPlayerById(user.id)
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'تعذر تسجيل الدخول'
    });
  }
});


/* =========================
   Logout
========================= */

app.post('/api/auth/logout', (req, res) => {
  clearAuthCookie(res);

  res.json({
    ok: true
  });
});


/* =========================
   Current User
========================= */

app.get(
  '/api/auth/me',
  authRequired,
  (req, res) => {
    res.json({
      user: req.user
    });
  }
);


/* =========================
   Player / Game
========================= */

app.get(
  '/api/player',
  authRequired,
  (req, res) => {
    res.json({
      player: getPlayerById(
        req.user.id
      ),
      byte: getByte(
        req.user.id
      )
    });
  }
);


app.put(
  '/api/player',
  authRequired,
  (req, res) => {

    const {
      xp,
      coins,
      progress
    } = req.body;

    db.prepare(`
      UPDATE players
      SET
        xp=COALESCE(?,xp),
        coins=COALESCE(?,coins),
        progress=COALESCE(?,progress),
        updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(
      xp,
      coins,
      progress,
      req.user.id
    );

    res.json({
      player: getPlayerById(
        req.user.id
      )
    });
  }
);


/* =========================
   Byte
========================= */

app.put(
  '/api/byte',
  authRequired,
  (req, res) => {

    const {
      level,
      bond,
      energy,
      state,
      memory
    } = req.body;

    db.prepare(`
      INSERT INTO byte_state(
        player_id,
        level,
        bond,
        energy,
        state,
        memory_json
      )
      VALUES (
        ?,
        COALESCE(?,12),
        COALESCE(?,38),
        COALESCE(?,72),
        COALESCE(?,'FOLLOW'),
        COALESCE(?,'[]')
      )
      ON CONFLICT(player_id)
      DO UPDATE SET
        level=COALESCE(
          excluded.level,
          byte_state.level
        ),
        bond=COALESCE(
          excluded.bond,
          byte_state.bond
        ),
        energy=COALESCE(
          excluded.energy,
          byte_state.energy
        ),
        state=COALESCE(
          excluded.state,
          byte_state.state
        ),
        memory_json=COALESCE(
          excluded.memory_json,
          byte_state.memory_json
        ),
        updated_at=CURRENT_TIMESTAMP
    `).run(
      req.user.id,
      level,
      bond,
      energy,
      state,
      memory === undefined
        ? null
        : JSON.stringify(memory)
    );

    res.json({
      byte: getByte(
        req.user.id
      )
    });
  }
);


/* =========================
   Lessons
========================= */

app.post(
  '/api/lessons/:id/complete',
  authRequired,
  (req, res) => {

    const lessonId =
      Number(req.params.id);

    const lesson = db
      .prepare(
        'SELECT * FROM lessons WHERE id=?'
      )
      .get(lessonId);

    if (!lesson) {
      return res.status(404).json({
        error: 'Lesson not found'
      });
    }

    const already = db.prepare(`
      SELECT 1
      FROM player_lessons
      WHERE player_id=? AND lesson_id=?
    `).get(
      req.user.id,
      lessonId
    );

    if (!already) {

      db.prepare(`
        INSERT INTO player_lessons(
          player_id,
          lesson_id
        )
        VALUES (?,?)
      `).run(
        req.user.id,
        lessonId
      );

      db.prepare(`
        UPDATE players
        SET
          xp=xp+?,
          progress=MIN(
            100,
            progress+10
          ),
          updated_at=CURRENT_TIMESTAMP
        WHERE id=?
      `).run(
        lesson.xp_reward,
        req.user.id
      );
    }

    res.json({
      player: getPlayerById(
        req.user.id
      ),
      lesson,
      alreadyCompleted:
        !!already
    });
  }
);


app.get(
  '/api/lessons',
  authRequired,
  (req, res) => {

    const rows = db.prepare(`
      SELECT
        l.*,
        pl.completed_at
      FROM lessons l
      LEFT JOIN player_lessons pl
        ON pl.lesson_id=l.id
        AND pl.player_id=?
      ORDER BY l.id
    `).all(
      req.user.id
    );

    res.json({
      lessons: rows
    });
  }
);


/* =========================
   Search Users
========================= */

app.get(
  '/api/users',
  authRequired,
  (req, res) => {

    const search = String(
      req.query.search || ''
    ).trim();

    if (!search) {
      return res.json({
        users: []
      });
    }

    const users = db.prepare(`
      SELECT
        id,
        username,
        level
      FROM players
      WHERE id != ?
        AND username LIKE ?
      ORDER BY username
      LIMIT 20
    `).all(
      req.user.id,
      `%${search}%`
    );

    res.json({
      users
    });
  }
);


/* =========================
   Get Conversation
========================= */

app.get(
  '/api/messages/:userId',
  authRequired,
  (req, res) => {

    const otherId =
      Number(req.params.userId);

    const other =
      getPlayerById(otherId);

    if (
      !other ||
      other.id === req.user.id
    ) {
      return res.status(404).json({
        error: 'المستخدم غير موجود'
      });
    }

    const messages = db.prepare(`
      SELECT
        m.id,
        m.sender_id,
        m.receiver_id,
        m.body,
        m.created_at,
        m.read_at,
        p.username AS sender_username
      FROM messages m
      JOIN players p
        ON p.id=m.sender_id
      WHERE
        (
          m.sender_id=?
          AND
          m.receiver_id=?
        )
        OR
        (
          m.sender_id=?
          AND
          m.receiver_id=?
        )
      ORDER BY m.id ASC
      LIMIT 200
    `).all(
      req.user.id,
      otherId,
      otherId,
      req.user.id
    );

    db.prepare(`
      UPDATE messages
      SET read_at=CURRENT_TIMESTAMP
      WHERE
        receiver_id=?
        AND
        sender_id=?
        AND
        read_at IS NULL
    `).run(
      req.user.id,
      otherId
    );

    res.json({
      other,
      messages
    });
  }
);


/* =========================
   Send Message
========================= */

app.post(
  '/api/messages',
  authRequired,
  (req, res) => {

    const receiverId =
      Number(req.body.receiverId);

    const body =
      String(
        req.body.body || ''
      ).trim();

    if (
      !receiverId ||
      receiverId === req.user.id
    ) {
      return res.status(400).json({
        error:
          'المستخدم المستلم غير صحيح'
      });
    }

    if (
      !body ||
      body.length > 1000
    ) {
      return res.status(400).json({
        error:
          'الرسالة يجب أن تكون بين 1 و1000 حرف'
      });
    }

    const receiver =
      getPlayerById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        error:
          'المستخدم غير موجود'
      });
    }

    const result = db.prepare(`
      INSERT INTO messages(
        sender_id,
        receiver_id,
        body
      )
      VALUES (?,?,?)
    `).run(
      req.user.id,
      receiverId,
      body
    );

    const message = db.prepare(`
      SELECT
        m.id,
        m.sender_id,
        m.receiver_id,
        m.body,
        m.created_at,
        p.username AS sender_username
      FROM messages m
      JOIN players p
        ON p.id=m.sender_id
      WHERE m.id=?
    `).get(
      result.lastInsertRowid
    );

    res.status(201).json({
      message
    });
  }
);


/* =========================
   Frontend
========================= */

// Express 5
// لا تستخدم app.get('*')
app.get(
  '/{*splat}',
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../frontend/index.html'
      )
    );
  }
);


app.listen(PORT, () => {
  console.log(
    `Python Adventure running at http://localhost:${PORT}`
  );
});

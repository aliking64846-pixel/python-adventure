const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");

const app = express();
const PORT = Number(process.env.PORT || 10000);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10
});

app.set("trust proxy", 1);
app.use(express.json({ limit: "200kb" }));

// دعم /api/... من الموقع
app.use("/api", (req, res, next) => {
  req.url = req.url.replace(/^\/api(?=\/|$)/, "") || "/";
  next();
});

const DEFAULT_SKILLS = {
  memory: 1,
  debug: 0,
  detect: 0,
  speed: 0,
  build: 0,
  solve: 0
};

const DEFAULT_GAME_STATE = {
  inventory: [
    "print()",
    "input()",
    "int()",
    "float()",
    "type()",
    "+",
    "*",
    "/"
  ],

  quests: {
    q1: false,
    q2: false,
    q3: false,
    q4: false
  },

  achievements: {
    first: true,
    variables: false,
    debug: false,
    master: false
  },

  map: {
    stage: 1
  },

  chest: {
    opened: 0
  },

  lab: {
    runs: 0,
    successes: 0,
    errors: 0
  }
};

const lessons = [
  { id: 1, xp: 100 },
  { id: 2, xp: 150 },
  { id: 3, xp: 175 },
  { id: 4, xp: 200 },
  { id: 5, xp: 250 },
  { id: 6, xp: 300 }
];

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function mergeGameState(saved) {
  const s = saved && typeof saved === "object" ? saved : {};

  return {
    ...clone(DEFAULT_GAME_STATE),
    ...s,

    quests: {
      ...DEFAULT_GAME_STATE.quests,
      ...(s.quests || {})
    },

    achievements: {
      ...DEFAULT_GAME_STATE.achievements,
      ...(s.achievements || {})
    },

    map: {
      ...DEFAULT_GAME_STATE.map,
      ...(s.map || {})
    },

    chest: {
      ...DEFAULT_GAME_STATE.chest,
      ...(s.chest || {})
    },

    lab: {
      ...DEFAULT_GAME_STATE.lab,
      ...(s.lab || {})
    },

    inventory:
      Array.isArray(s.inventory) && s.inventory.length
        ? s.inventory.slice(0, 200)
        : clone(DEFAULT_GAME_STATE.inventory)
  };
}async function initDb() {
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

      skill_levels JSONB NOT NULL DEFAULT
      '{"memory":1,"debug":0,"detect":0,"speed":0,"build":0,"solve":0}'::jsonb,

      game_state JSONB NOT NULL DEFAULT '{}'::jsonb,
      byte_state JSONB NOT NULL DEFAULT '{}'::jsonb,

      lab_stats JSONB NOT NULL DEFAULT
      '{"runs":0,"successes":0,"errors":0}'::jsonb,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE players
      ADD COLUMN IF NOT EXISTS game_state
      JSONB NOT NULL DEFAULT '{}'::jsonb;

    ALTER TABLE players
      ADD COLUMN IF NOT EXISTS byte_state
      JSONB NOT NULL DEFAULT '{}'::jsonb;

    ALTER TABLE players
      ADD COLUMN IF NOT EXISTS lab_stats
      JSONB NOT NULL DEFAULT
      '{"runs":0,"successes":0,"errors":0}'::jsonb;

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id SERIAL PRIMARY KEY,

      user_id INTEGER NOT NULL
        REFERENCES players(id)
        ON DELETE CASCADE,

      lesson_id INTEGER NOT NULL,

      completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      UNIQUE(user_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,

      sender_id INTEGER NOT NULL
        REFERENCES players(id)
        ON DELETE CASCADE,

      receiver_id INTEGER NOT NULL
        REFERENCES players(id)
        ON DELETE CASCADE,

      body TEXT NOT NULL,

      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS
      idx_lesson_progress_user
      ON lesson_progress(user_id);

    CREATE INDEX IF NOT EXISTS
      idx_messages_pair
      ON messages(sender_id, receiver_id, created_at);
  `);

  console.log("Database tables are ready.");
}

app.use(
  session({
    store: new pgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true
    }),

    secret:
      process.env.SESSION_SECRET ||
      "change-this-secret",

    resave: false,
    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 30
    }
  })
);

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({
      error: "يجب تسجيل الدخول أولاً"
    });
  }

  next();
}

async function getPlayer(userId) {
  const result = await pool.query(`
    SELECT
      id,
      username,
      email,
      xp,
      coins,
      progress,
      skill_points,
      skill_levels,
      game_state,
      byte_state,
      lab_stats
    FROM players
    WHERE id=$1
  `, [userId]);

  if (!result.rows[0]) {
    return null;
  }

  const lessonsDone = await pool.query(`
    SELECT lesson_id
    FROM lesson_progress
    WHERE user_id=$1
    ORDER BY lesson_id
  `, [userId]);

  const row = result.rows[0];

  return {
    id: row.id,
    username: row.username,
    email: row.email,

    xp: row.xp,
    coins: row.coins,
    progress: row.progress,

    skillPoints: row.skill_points,

    skillLevels: {
      ...DEFAULT_SKILLS,
      ...(row.skill_levels || {})
    },

    completedLessons:
      lessonsDone.rows.map(
        x => Number(x.lesson_id)
      ),

    gameState:
      mergeGameState(row.game_state),

    byte:
      row.byte_state || {},

    labStats:
      row.lab_stats || {
        runs: 0,
        successes: 0,
        errors: 0
      }
  };
        }app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      ok: true,
      database: "connected"
    });
  } catch (error) {
    console.error(error);

    res.status(503).json({
      ok: false,
      database: "error"
    });
  }
});


app.post("/auth/register", async (req, res) => {
  try {
    const username = String(
      req.body.username || ""
    ).trim();

    const email = String(
      req.body.email || ""
    ).trim().toLowerCase();

    const password = String(
      req.body.password || ""
    );

    if (
      username.length < 3 ||
      username.length > 30
    ) {
      return res.status(400).json({
        error: "اسم المستخدم يجب أن يكون بين 3 و30 حرفاً"
      });
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        error: "الإيميل غير صحيح"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
      });
    }

    const exists = await pool.query(
      `
      SELECT id
      FROM players
      WHERE lower(username)=lower($1)
         OR lower(email)=lower($2)
      `,
      [username, email]
    );

    if (exists.rows.length) {
      return res.status(409).json({
        error: "اسم المستخدم أو الإيميل مستخدم مسبقاً"
      });
    }

    const hash = await bcrypt.hash(
      password,
      12
    );

    const result = await pool.query(
      `
      INSERT INTO players
      (
        username,
        email,
        password_hash,
        skill_levels,
        game_state,
        lab_stats
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4::jsonb,
        $5::jsonb,
        $6::jsonb
      )
      RETURNING id, username, email
      `,
      [
        username,
        email,
        hash,
        JSON.stringify(DEFAULT_SKILLS),
        JSON.stringify(DEFAULT_GAME_STATE),
        JSON.stringify({
          runs: 0,
          successes: 0,
          errors: 0
        })
      ]
    );

    req.session.userId =
      result.rows[0].id;

    res.status(201).json({
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "تعذر إنشاء الحساب"
    });
  }
});


app.post("/auth/login", async (req, res) => {
  try {
    const login = String(
      req.body.login ??
      req.body.email ??
      ""
    ).trim().toLowerCase();

    const password = String(
      req.body.password || ""
    );

    const result = await pool.query(
      `
      SELECT
        id,
        username,
        email,
        password_hash
      FROM players
      WHERE lower(username)=lower($1)
         OR lower(email)=lower($1)
      LIMIT 1
      `,
      [login]
    );

    const user = result.rows[0];

    if (
      !user ||
      !(await bcrypt.compare(
        password,
        user.password_hash
      ))
    ) {
      return res.status(401).json({
        error: "بيانات الدخول غير صحيحة"
      });
    }

    req.session.userId = user.id;

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "تعذر تسجيل الدخول"
    });
  }
});


app.get(
  "/auth/me",
  requireAuth,
  async (req, res) => {
    const player =
      await getPlayer(
        req.session.userId
      );

    if (!player) {
      return res.status(401).json({
        error: "الحساب غير موجود"
      });
    }

    res.json({
      user: {
        id: player.id,
        username: player.username,
        email: player.email
      }
    });
  }
);


app.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({
      ok: true
    });
  });
});app.get("/player", requireAuth, async (req, res) => {
  try {
    const player = await getPlayer(req.session.userId);

    if (!player) {
      return res.status(404).json({
        error: "اللاعب غير موجود"
      });
    }

    res.json({ player });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "تعذر تحميل تقدم اللاعب"
    });
  }
});


app.put("/player", requireAuth, async (req, res) => {
  try {
    const body = req.body || {};

    const xp =
      Number.isFinite(Number(body.xp))
        ? Math.max(0, Math.floor(Number(body.xp)))
        : null;

    const coins =
      Number.isFinite(Number(body.coins))
        ? Math.max(0, Math.floor(Number(body.coins)))
        : null;

    const progress =
      Number.isFinite(Number(body.progress))
        ? Math.max(
            0,
            Math.min(
              100,
              Number(body.progress)
            )
          )
        : null;

    await pool.query(
      `
      UPDATE players
      SET
        xp = COALESCE($1, xp),
        coins = COALESCE($2, coins),
        progress = COALESCE($3, progress),
        updated_at = NOW()
      WHERE id = $4
      `,
      [
        xp,
        coins,
        progress,
        req.session.userId
      ]
    );


    if (
      body.skillPoints !== undefined ||
      body.skillLevels !== undefined
    ) {
      const points =
        body.skillPoints !== undefined
          ? Math.max(
              0,
              Math.floor(
                Number(body.skillPoints) || 0
              )
            )
          : null;

      const levels =
        body.skillLevels &&
        typeof body.skillLevels === "object"
          ? JSON.stringify(
              body.skillLevels
            )
          : null;

      await pool.query(
        `
        UPDATE players
        SET
          skill_points =
            COALESCE($1, skill_points),

          skill_levels =
            COALESCE(
              $2::jsonb,
              skill_levels
            ),

          updated_at = NOW()
        WHERE id = $3
        `,
        [
          points,
          levels,
          req.session.userId
        ]
      );
    }


    res.json({
      ok: true,
      player:
        await getPlayer(
          req.session.userId
        )
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "تعذر حفظ تقدم اللاعب"
    });
  }
});


app.put(
  "/game-state",
  requireAuth,
  async (req, res) => {
    try {
      const state =
        mergeGameState(req.body);

      await pool.query(
        `
        UPDATE players
        SET
          game_state = $1::jsonb,
          updated_at = NOW()
        WHERE id = $2
        `,
        [
          JSON.stringify(state),
          req.session.userId
        ]
      );

      res.json({
        ok: true,
        gameState: state
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "تعذر حفظ حالة اللعبة"
      });
    }
  }
);


app.put(
  "/byte",
  requireAuth,
  async (req, res) => {
    try {
      const body = req.body || {};

      const state = {
        level: Math.max(
          1,
          Number(body.level) || 1
        ),

        bond: Math.max(
          0,
          Number(body.bond) || 0
        ),

        energy: Math.max(
          0,
          Number(body.energy) || 0
        ),

        state: String(
          body.state || "idle"
        ).slice(0, 50),

        memory:
          Array.isArray(body.memory)
            ? body.memory.slice(-30)
            : []
      };

      await pool.query(
        `
        UPDATE players
        SET
          byte_state = $1::jsonb,
          updated_at = NOW()
        WHERE id = $2
        `,
        [
          JSON.stringify(state),
          req.session.userId
        ]
      );

      res.json({
        ok: true,
        byte: state
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "تعذر حفظ Byte"
      });
    }
  }
);


app.put(
  "/lab",
  requireAuth,
  async (req, res) => {
    try {
      const body = req.body || {};

      const stats = {
        runs: Math.max(
          0,
          Number(body.runs) || 0
        ),

        successes: Math.max(
          0,
          Number(body.successes) || 0
        ),

        errors: Math.max(
          0,
          Number(body.errors) || 0
        )
      };

      await pool.query(
        `
        UPDATE players
        SET
          lab_stats = $1::jsonb,
          updated_at = NOW()
        WHERE id = $2
        `,
        [
          JSON.stringify(stats),
          req.session.userId
        ]
      );

      res.json({
        ok: true,
        labStats: stats
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "تعذر حفظ المختبر"
      });
    }
  }
);app.post("/lessons/:id/complete", requireAuth, async (req, res) => {
  const lessonId = Number(req.params.id);

  const lesson = lessons.find(
    item => item.id === lessonId
  );

  if (!lesson) {
    return res.status(404).json({
      error: "الدرس غير موجود"
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const old = await client.query(
      `
      SELECT id
      FROM lesson_progress
      WHERE user_id=$1
        AND lesson_id=$2
      `,
      [
        req.session.userId,
        lessonId
      ]
    );

    if (!old.rows.length) {

      await client.query(
        `
        INSERT INTO lesson_progress
        (
          user_id,
          lesson_id
        )
        VALUES ($1,$2)
        `,
        [
          req.session.userId,
          lessonId
        ]
      );

      await client.query(
        `
        UPDATE players
        SET
          xp = xp + $1,

          skill_points =
            skill_points + 1,

          progress =
            LEAST(
              100,
              progress + 5
            ),

          updated_at = NOW()

        WHERE id = $2
        `,
        [
          lesson.xp,
          req.session.userId
        ]
      );
    }

    await client.query("COMMIT");

    res.json({
      ok: true,

      alreadyCompleted:
        !!old.rows.length,

      xpEarned:
        old.rows.length
          ? 0
          : lesson.xp,

      player:
        await getPlayer(
          req.session.userId
        )
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error(error);

    res.status(500).json({
      error: "تعذر حفظ إكمال الدرس"
    });

  } finally {
    client.release();
  }
});


app.get("/users", requireAuth, async (req, res) => {
  try {
    const search =
      String(
        req.query.search || ""
      ).trim();

    const result =
      await pool.query(
        `
        SELECT
          id,
          username

        FROM players

        WHERE username ILIKE $1
          AND id <> $2

        ORDER BY username

        LIMIT 20
        `,
        [
          `%${search}%`,
          req.session.userId
        ]
      );

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "تعذر البحث عن المستخدمين"
    });
  }
});


app.get(
  "/messages/:userId",
  requireAuth,
  async (req, res) => {

    try {
      const other =
        Number(req.params.userId);

      const result =
        await pool.query(
          `
          SELECT
            id,
            sender_id,
            receiver_id,
            body,
            created_at

          FROM messages

          WHERE
            (
              sender_id=$1
              AND receiver_id=$2
            )

            OR

            (
              sender_id=$2
              AND receiver_id=$1
            )

          ORDER BY created_at ASC

          LIMIT 100
          `,
          [
            req.session.userId,
            other
          ]
        );

      res.json(result.rows);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error: "تعذر تحميل الرسائل"
      });
    }
  }
);


app.post(
  "/messages",
  requireAuth,
  async (req, res) => {

    try {

      const receiverId =
        Number(
          req.body.receiverId ??
          req.body.receiver_id
        );

      const body =
        String(
          req.body.body || ""
        ).trim();

      if (!receiverId || !body) {
        return res.status(400).json({
          error: "الرسالة فارغة"
        });
      }

      const result =
        await pool.query(
          `
          INSERT INTO messages
          (
            sender_id,
            receiver_id,
            body
          )

          VALUES
          (
            $1,
            $2,
            $3
          )

          RETURNING *
          `,
          [
            req.session.userId,
            receiverId,
            body.slice(0, 2000)
          ]
        );

      res.json({
        ok: true,
        message: result.rows[0]
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error: "تعذر إرسال الرسالة"
      });
    }
  }
);app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

// فتح الموقع
app.use((req, res, next) => {
  if (
    req.method === "GET" &&
    !req.path.startsWith("/auth/") &&
    !req.path.startsWith("/player") &&
    !req.path.startsWith("/lessons/") &&
    !req.path.startsWith("/users") &&
    !req.path.startsWith("/messages/") &&
    req.path !== "/health"
  ) {
    return res.sendFile(
      path.join(
        __dirname,
        "public",
        "index.html"
      )
    );
  }

  next();
});


async function startServer() {
  try {
    await initDb();

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `Python Adventure running on port ${PORT}`
        );
      }
    );

  } catch (error) {
    console.error(
      "Server startup failed:",
      error
    );

    process.exit(1);
  }
}


startServer();

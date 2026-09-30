CREATE TABLE IF NOT EXISTS players (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  coins INTEGER NOT NULL DEFAULT 100 CHECK (coins >= 0),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  skill_points INTEGER NOT NULL DEFAULT 0 CHECK (skill_points >= 0),
  skill_levels JSONB NOT NULL DEFAULT '{"memory":1,"debug":0,"detect":0,"speed":0,"build":0,"solve":0}'::jsonb,
  game_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  byte_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  lab_stats JSONB NOT NULL DEFAULT '{"runs":0,"successes":0,"errors":0}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL CHECK (lesson_id > 0),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  receiver_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(sender_id, receiver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, created_at);

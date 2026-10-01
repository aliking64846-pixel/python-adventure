const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { pool } = require("../db/pool");

function sessionMiddleware() {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production.");
  }

  return session({
    store: new pgSession({ pool, tableName: "user_sessions", createTableIfMissing: true }),
    secret: secret || "dev-only-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 30
    }
  });
}

module.exports = { sessionMiddleware };

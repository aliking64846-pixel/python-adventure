const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { pool } = require("../db/pool");

function sessionMiddleware() {
  return session({
    store: new pgSession({ pool, tableName: "user_sessions", createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || "change-this-secret",
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

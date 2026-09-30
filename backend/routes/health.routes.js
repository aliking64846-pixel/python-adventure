const { pool } = require("../db/pool");

function registerHealthRoutes(router) {
  const healthHandler = async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ ok: true, database: "connected" });
    } catch (error) {
      console.error(error);
      res.status(503).json({ ok: false, database: "error" });
    }
  };
  router.get("/health", healthHandler);
}

module.exports = { registerHealthRoutes };

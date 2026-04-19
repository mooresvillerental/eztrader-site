const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {
  try {
    const p = path.join(process.cwd(), "engine_state.json");
    const raw = fs.readFileSync(p, "utf8");
    const data = JSON.parse(raw);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: "engine_state_unavailable",
      detail: String(e && e.message ? e.message : e),
    });
  }
};

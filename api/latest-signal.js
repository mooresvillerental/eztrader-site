const fs = require("fs");
const path = require("path");

module.exports = async (_req, res) => {
  try {
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "live_signal.json"), "utf8")
    );
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "live_signal_unavailable", detail: String(err.message || err) }));
  }
};

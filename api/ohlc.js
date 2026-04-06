const fs = require("fs");
const path = require("path");

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(obj));
}

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const symbol = String(url.searchParams.get("symbol") || "BTC-USD").toUpperCase();
    const interval = Number(url.searchParams.get("interval") || 5);

    const fp = path.join(process.cwd(), "ohlc.json");
    const raw = JSON.parse(fs.readFileSync(fp, "utf8"));

    const bySymbol = raw && typeof raw === "object" && !Array.isArray(raw) ? raw[symbol] : null;
    const candles = Array.isArray(bySymbol) ? bySymbol : (Array.isArray(raw) ? raw : []);

    return send(res, 200, {
      ok: true,
      symbol,
      interval,
      candles
    });
  } catch (err) {
    return send(res, 500, {
      ok: false,
      error: "ohlc_unavailable",
      detail: String(err.message || err)
    });
  }
};

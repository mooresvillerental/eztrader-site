const fs = require("fs");
const path = require("path");

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(obj));
}

function normalizeLiveOhlc(raw, symbol) {
  const highs = Array.isArray(raw?.highs) ? raw.highs : [];
  const lows = Array.isArray(raw?.lows) ? raw.lows : [];
  const closes = Array.isArray(raw?.closes) ? raw.closes : [];
  const volumes = Array.isArray(raw?.volumes) ? raw.volumes : [];
  const ts = Number(raw?.timestamp || 0);

  const n = Math.min(highs.length, lows.length, closes.length, volumes.length);
  if (!n) return [];

  const step = 300; // 5 minutes
  const start = ts > 0 ? ts - ((n - 1) * step) : 0;

  const candles = [];
  for (let i = 0; i < n; i++) {
    const close = Number(closes[i]);
    const high = Number(highs[i]);
    const low = Number(lows[i]);
    const prevClose = i > 0 ? Number(closes[i - 1]) : close;
    const open = Number.isFinite(prevClose) ? prevClose : close;
    const time = start > 0 ? (start + i * step) : 0;

    if (
      Number.isFinite(time) &&
      Number.isFinite(open) &&
      Number.isFinite(high) &&
      Number.isFinite(low) &&
      Number.isFinite(close)
    ) {
      candles.push({ time, open, high, low, close });
    }
  }
  return candles;
}

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const symbol = String(url.searchParams.get("symbol") || "BTC-USD").toUpperCase();
    const interval = Number(url.searchParams.get("interval") || 5);

    // 1) Prefer live per-symbol OHLC copied into this repo
    const livePath = path.join(process.cwd(), "signals", "ohlc", `${symbol}.json`);
    if (fs.existsSync(livePath)) {
      const raw = JSON.parse(fs.readFileSync(livePath, "utf8"));
      const candles = normalizeLiveOhlc(raw, symbol);
      return send(res, 200, { ok: true, symbol, interval, candles, source: "signals/ohlc" });
    }

    // 2) Fallback to old static ohlc.json
    const fp = path.join(process.cwd(), "ohlc.json");
    if (fs.existsSync(fp)) {
      const raw = JSON.parse(fs.readFileSync(fp, "utf8"));
      const bySymbol = raw && typeof raw === "object" && !Array.isArray(raw) ? raw[symbol] : null;
      const candles = Array.isArray(bySymbol) ? bySymbol : (Array.isArray(raw) ? raw : []);
      return send(res, 200, { ok: true, symbol, interval, candles, source: "ohlc.json" });
    }

    return send(res, 200, { ok: true, symbol, interval, candles: [], source: "none" });
  } catch (err) {
    return send(res, 500, {
      ok: false,
      error: "ohlc_unavailable",
      detail: String(err.message || err)
    });
  }
};

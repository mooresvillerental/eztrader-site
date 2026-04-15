const { readEngineState } = require("./_state");

module.exports = async function handler(req, res) {
  try {
    const state = readEngineState();
    const signal = state.latest_signal || {};
    const scannerState = state.scanner_state || {};

    const payload = {
      symbol: signal.symbol || "BTC-USD",
      action: signal.action || "HOLD",
      price: Number(signal.price || 0),
      timestamp: signal.timestamp || "",
      confidence: Number(signal.confidence || 0),
      trade_eligible: Boolean(signal.trade_eligible),
      quality_blocked: Boolean(signal.quality_blocked),
      block_reason: signal.block_reason || "",
      trend: signal.trend || "neutral",
      regime: signal.regime || "range",
      strategy: signal.strategy || "NO_SIGNAL",
      status_detail: signal.status_detail || "Waiting for valid setup",
      setup_price: Number(signal.setup_price || 0),
      engine_source: signal.engine_source || "engine_state",
      best_symbol: scannerState.best_symbol || signal.symbol || "BTC-USD",
      feed_status: scannerState.feed_status || "live",
    };

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({
      error: "failed_to_read_latest_signal",
      details: error.message,
    });
  }
};

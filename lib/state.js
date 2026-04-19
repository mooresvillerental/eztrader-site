const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const ENGINE_STATE_PATH = path.join(ROOT, "engine_state.json");
const LEGACY_SIGNAL_PATH = path.join(ROOT, "live_signal.json");
const LEGACY_PORTFOLIO_PATH = path.join(ROOT, "live_portfolio.json");

function safeReadJson(filePath, fallback = {}) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (_) {
    return fallback;
  }
}

function defaultEngineState() {
  return {
    latest_signal: {
      symbol: "BTC-USD",
      action: "HOLD",
      price: 0,
      timestamp: "",
      confidence: 0,
      trade_eligible: false,
      quality_blocked: true,
      block_reason: "waiting_for_valid_setup",
      trend: "neutral",
      regime: "range",
      strategy: "NO_SIGNAL",
      status_detail: "Waiting for valid setup",
      setup_price: 0,
      engine_source: "engine_state_default",
    },
    assistant_portfolio: {
      assistant_cash_usd: 0,
      assistant_holdings: { "BTC-USD": 0 },
      assistant_avg_entry: { "BTC-USD": 0 },
      assistant_portfolio_value: 0,
      assistant_unrealized_pl: 0,
      assistant_realized_pl: 0,
      assistant_starting_value: 0,
      assistant_return_pct: 0,
      active_symbol: "BTC-USD",
      live_price: 0,
      last_updated: "",
    },
    shadow_stats: {},
    broker_portfolio: {},
    scanner_state: {},
  };
}

function normalizeEngineState(state) {
  const base = defaultEngineState();
  const merged = { ...base, ...(state || {}) };
  merged.latest_signal = { ...base.latest_signal, ...(merged.latest_signal || {}) };
  merged.assistant_portfolio = {
    ...base.assistant_portfolio,
    ...(merged.assistant_portfolio || {}),
  };

  if (!merged.latest_signal.symbol) {
    merged.latest_signal.symbol = "BTC-USD";
  }
  if (!merged.assistant_portfolio.active_symbol) {
    merged.assistant_portfolio.active_symbol = merged.latest_signal.symbol || "BTC-USD";
  }

  return merged;
}

function migrateLegacyToEngineState() {
  const base = defaultEngineState();
  const legacySignal = safeReadJson(LEGACY_SIGNAL_PATH, {});
  const legacyPortfolio = safeReadJson(LEGACY_PORTFOLIO_PATH, {});

  const state = JSON.parse(JSON.stringify(base));

  state.latest_signal = {
    ...state.latest_signal,
    ...legacySignal,
    engine_source: "legacy_bridge",
  };

  const legacyCash = Number(
    legacyPortfolio.assistant_cash_usd ??
    legacyPortfolio.cash_usd ??
    legacyPortfolio.cash ??
    0
  );

  const legacyHoldings =
    legacyPortfolio.assistant_holdings ||
    legacyPortfolio.holdings ||
    { "BTC-USD": Number(legacyPortfolio.btc ?? 0) };

  const legacyAvgEntry =
    legacyPortfolio.assistant_avg_entry ||
    legacyPortfolio.avg_entry ||
    { "BTC-USD": Number(legacyPortfolio.avg_entry_price ?? 0) };

  state.assistant_portfolio = {
    ...state.assistant_portfolio,
    ...legacyPortfolio,
    assistant_cash_usd: legacyCash,
    assistant_holdings: legacyHoldings,
    assistant_avg_entry: legacyAvgEntry,
    active_symbol:
      legacyPortfolio.active_symbol ||
      state.latest_signal.symbol ||
      "BTC-USD",
    live_price: Number(
      legacyPortfolio.live_price ?? state.latest_signal.price ?? 0
    ),
  };

  return normalizeEngineState(state);
}

function readEngineState() {
  const onDisk = safeReadJson(ENGINE_STATE_PATH, null);
  if (onDisk) {
    return normalizeEngineState(onDisk);
  }
  return migrateLegacyToEngineState();
}

module.exports = {
  readEngineState,
};

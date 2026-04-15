const { readEngineState } = require("./_state");

module.exports = async function handler(req, res) {
  try {
    const state = readEngineState();
    const signal = state.latest_signal || {};
    const portfolio = state.assistant_portfolio || {};

    const activeSymbol = portfolio.active_symbol || signal.symbol || "BTC-USD";
    const holdings = portfolio.assistant_holdings || {};
    const avgEntry = portfolio.assistant_avg_entry || {};
    const livePrice = Number(portfolio.live_price ?? signal.price ?? 0);
    const cash = Number(portfolio.assistant_cash_usd || 0);
    const portfolioValue = Number(portfolio.assistant_portfolio_value || cash);

    const payload = {
      active_symbol: activeSymbol,
      live_price: livePrice,
      cash_usd: cash,
      holdings: holdings,
      avg_entry: avgEntry,
      portfolio_value: portfolioValue,
      assistant_cash_usd: cash,
      assistant_holdings: holdings,
      assistant_avg_entry: avgEntry,
      assistant_portfolio_value: portfolioValue,
      assistant_unrealized_pl: Number(portfolio.assistant_unrealized_pl || 0),
      assistant_realized_pl: Number(portfolio.assistant_realized_pl || 0),
      assistant_starting_value: Number(portfolio.assistant_starting_value || 0),
      assistant_return_pct: Number(portfolio.assistant_return_pct || 0),
      last_updated: portfolio.last_updated || signal.timestamp || "",
    };

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({
      error: "failed_to_read_assistant_portfolio",
      details: error.message,
    });
  }
};

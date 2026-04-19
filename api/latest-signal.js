const { readEngineState } = require("../lib/state");

module.exports = async function handler(req, res) {
  try {
    const state = readEngineState();
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      ok: true,
      signal: state?.latest_signal || null,
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: "latest_signal_unavailable",
      detail: String(e && e.message ? e.message : e),
    });
  }
};

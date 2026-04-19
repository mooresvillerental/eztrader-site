const { proxyToExecutor } = require("../lib/executor");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  return proxyToExecutor(req, res, "/confirm");
};

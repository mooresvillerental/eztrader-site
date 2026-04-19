const { proxyToExecutor } = require("./_executor");

module.exports = async function handler(req, res) {
  return proxyToExecutor(req, res, "/shadow-last-closed");
};

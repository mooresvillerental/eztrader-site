async function readJsonBody(req) {
  try {
    if (!req || !req.body) return {};
    if (typeof req.body === "string") return JSON.parse(req.body || "{}");
    return req.body;
  } catch {
    return {};
  }
}

function trimSlash(v) {
  return String(v || "").replace(/\/+$/, "");
}

function getExecutorBase() {
  const raw =
    process.env.EXECUTOR_BASE_URL ||
    process.env.EZTRADER_EXECUTOR_BASE_URL ||
    "";
  return trimSlash(raw);
}

async function proxyToExecutor(req, res, targetPath) {
  try {
    const base = getExecutorBase();
    if (!base) {
      return res.status(500).json({
        error: "executor_base_missing",
        details: "Set EXECUTOR_BASE_URL in Vercel environment variables.",
      });
    }

    const url = `${base}${targetPath}`;
    const method = String(req.method || "POST").toUpperCase();
    const bodyObj = await readJsonBody(req);

    const upstream = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-EZTRADER-Proxy": "vercel-api",
      },
      body: method === "GET" ? undefined : JSON.stringify(bodyObj || {}),
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(upstream.status).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "executor_proxy_failed",
      details: error.message,
    });
  }
}

module.exports = {
  proxyToExecutor,
};

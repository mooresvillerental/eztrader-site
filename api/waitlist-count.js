const { Redis } = require("@upstash/redis");

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

module.exports = async (_req, res) => {
  try {
    if (!redis) {
      return json(res, 200, { count: 0, storage: "not_configured" });
    }

    const count = await redis.get("waitlist:count");
    return json(res, 200, { count: Number(count || 0) });
  } catch (err) {
    return json(res, 500, {
      error: "server_error",
      detail: String(err && err.message ? err.message : err),
    });
  }
};

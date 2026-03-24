const { Resend } = require("resend");
const { Redis } = require("@upstash/redis");

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const EMAIL_KEY_PREFIX = "waitlist:email:";
const COUNT_KEY = "waitlist:count";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "method_not_allowed" });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : (req.body || {});

    const email = normalizeEmail(body.email);

    if (!isValidEmail(email)) {
      return json(res, 400, { error: "invalid_email" });
    }

    let count = null;
    let alreadyJoined = false;

    if (redis) {
      const exists = await redis.get(EMAIL_KEY_PREFIX + email);
      alreadyJoined = !!exists;

      if (!alreadyJoined) {
        await redis.set(EMAIL_KEY_PREFIX + email, {
          email,
          created_at: new Date().toISOString(),
          source: "geteztrader.com",
        });
        count = await redis.incr(COUNT_KEY);
      } else {
        const current = await redis.get(COUNT_KEY);
        count = Number(current || 0);
      }
    }

    if (resend) {
      await resend.emails.send({
        from: "EZTrader Waitlist <support@geteztrader.com>",
        to: "support@geteztrader.com",
        subject: alreadyJoined ? "Duplicate waitlist signup attempt" : "New EZTrader waitlist signup",
        text:
          (alreadyJoined ? "Duplicate signup attempt:\n" : "New signup:\n") +
          email +
          "\n\nSource: geteztrader.com",
      });
    }

    return json(res, 200, {
      ok: true,
      already_joined: alreadyJoined,
      count,
    });
  } catch (err) {
    return json(res, 500, {
      error: "server_error",
      detail: String(err && err.message ? err.message : err),
    });
  }
};

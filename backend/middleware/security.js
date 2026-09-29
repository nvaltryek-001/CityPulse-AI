import helmet from "helmet";

let bucket = new Map();

export function securityMiddleware(req, res, next) {
  return helmet({
    crossOriginResourcePolicy: false
  })(req, res, next);
}

export function apiRateLimiter(req, res, next) {

  const now = Date.now();

  const key =
    req.ip ||
    req.headers["x-forwarded-for"] ||
    "unknown";

  const current =
    bucket.get(key) || {
      count: 0,
      windowStart: now
    };

  const windowMs =
    60 * 1000;

  const maxRequests =
    120;

  if (
    now - current.windowStart >=
    windowMs
  ) {
    current.count = 0;
    current.windowStart = now;
  }

  current.count++;

  bucket.set(key, current);

  if (current.count > maxRequests) {
    return res.status(429).json({
      success: false,
      message:
        "Too many requests. Please try again shortly."
    });
  }

  next();
}

export default securityMiddleware;

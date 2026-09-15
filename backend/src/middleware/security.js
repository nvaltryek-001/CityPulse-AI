import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

const origins = String(
  process.env.FRONTEND_URL ||
  "http://localhost:5173,http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003"
)
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

export function securityMiddleware(app) {
  app.disable("x-powered-by");

  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: "cross-origin"
      }
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || origins.includes(origin)) {
          return callback(null, true);
        }

        if (process.env.NODE_ENV !== "production") {
          return callback(null, true);
        }

        return callback(new Error("CORS origin not allowed"));
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
    })
  );

  app.use(
    express.json({
      limit: process.env.JSON_BODY_LIMIT || "8mb"
    })
  );

  app.use(
    express.urlencoded({
      extended: true,
      limit: process.env.URLENCODED_BODY_LIMIT || "1mb"
    })
  );

  app.use(
    mongoSanitize({
      replaceWith: "_"
    })
  );
}

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT || 300),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again later."
  }
});

export const reportRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: Number(process.env.REPORT_RATE_LIMIT || 30),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many report submissions. Please try again later."
  }
});

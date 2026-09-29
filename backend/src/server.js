import analyticsRoutes from './routes/analyticsRoutes.js';
import geoSyncRoutes from "./routes/geoSyncRoutes.js";
import exploreDataRoutes from "./routes/exploreDataRoutes.js";
import nearbyIssueRoutes from "./routes/nearbyIssueRoutes.js";
import civicDatasetRoutes from "./routes/civicDatasetRoutes.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { connectDatabase } from "./config/db.js";

import healthRoutes from "./routes/healthRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";

const app = express();

const allowedFrontendOrigins = new Set(
  [
    env.frontendUrl,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ].filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {

      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedFrontendOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      if (
        process.env.NODE_ENV !== "production" &&
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(
        new Error("CORS origin not allowed")
      );
    },
    credentials: false
  })
);

app.use(helmet());
app.use(morgan("dev"));

app.use(
  express.json({
    limit: "25mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "25mb"
  })
);

app.get("/", (_req, res) => {
  res.json({
    name: "CityPulse AI API",
    status: "running"
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/civic-data", civicDatasetRoutes);
app.use("/api/reports/nearby", nearbyIssueRoutes);
app.use("/api/share", shareRoutes);

app.use("/api/explore", exploreDataRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports/geo-sync", geoSyncRoutes);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

async function startServer() {
  try {
    await connectDatabase();



app.listen(env.port, "0.0.0.0", () => {
      console.log("");
      console.log("======================================");
      console.log(" CITYPULSE AI BACKEND");
      console.log("======================================");
      console.log(` API: http://localhost:${env.port}`);
      console.log(
        ` Health: http://localhost:${env.port}/api/health`
      );
      console.log(
        ` AI: POST http://localhost:${env.port}/api/ai/analyze`
      );
      console.log("======================================");
      console.log("");
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
}

startServer();

import { Router } from "express";
import mongoose from "mongoose";
import { env } from "../config/env.js";

const router = Router();

router.get("/", async (_req, res) => {
  res.json({
    success: true,
    service: "CityPulse AI API",
    status: "ok",
    environment: env.nodeEnv,
    mongodb:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
    geminiConfigured: Boolean(env.geminiApiKey),
    timestamp: new Date().toISOString()
  });
});

export default router;

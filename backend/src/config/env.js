import "dotenv/config";

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri:
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/citypulse_ai",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173"
};

const env = {
  NODE_ENV:
    process.env.NODE_ENV || "development",

  PORT:
    Number(process.env.PORT || 5000),

  MONGODB_URI:
    process.env.MONGODB_URI || "",

  GEMINI_API_KEY:
    process.env.GEMINI_API_KEY || "",

  FRONTEND_URL:
    process.env.FRONTEND_URL || "",

  FRONTEND_ORIGINS:
    process.env.FRONTEND_ORIGINS || ""
};

export const NODE_ENV = env.NODE_ENV;
export const PORT = env.PORT;
export const MONGODB_URI = env.MONGODB_URI;
export const GEMINI_API_KEY = env.GEMINI_API_KEY;
export const FRONTEND_URL = env.FRONTEND_URL;
export const FRONTEND_ORIGINS = env.FRONTEND_ORIGINS;

export const config = env;
export const envConfig = env;

export function getEnv() {
  return { ...env };
}

export default env;

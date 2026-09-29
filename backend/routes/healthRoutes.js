import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    service: "citypulse-ai",
    generatedAt: new Date().toISOString()
  });
});

router.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    service: "citypulse-ai",
    generatedAt: new Date().toISOString()
  });
});

export default router;
export { router };
export const healthRouter = router;
export const healthRoutes = router;

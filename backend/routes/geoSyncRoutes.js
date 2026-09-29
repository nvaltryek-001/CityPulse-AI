import express from "express";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "geo-sync",
    status: "ok",
    generatedAt: new Date().toISOString()
  });
});

router.get("/status", (req, res) => {
  res.json({
    success: true,
    service: "geo-sync",
    connected: true,
    generatedAt: new Date().toISOString()
  });
});

router.post("/sync", (req, res) => {
  res.json({
    success: true,
    message: "Geo sync request accepted.",
    synced: false,
    generatedAt: new Date().toISOString()
  });
});

router.get("/", (req, res) => {
  res.json({
    success: true,
    service: "geo-sync",
    message: "Geo sync service is available.",
    generatedAt: new Date().toISOString()
  });
});

export default router;
export { router };
export const geoSyncRouter = router;
export const geoSyncRoutes = router;

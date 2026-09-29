import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  const reportId =
    req.body?.reportId ||
    "";

  res.json({
    success: true,
    reportId,
    shared: false,
    message:
      "Share payload prepared. Delivery is handled by the frontend share actions.",
    generatedAt:
      new Date().toISOString()
  });
});

router.get("/:reportId", (req, res) => {
  res.json({
    success: true,
    reportId:
      req.params.reportId,
    message:
      "Share metadata available."
  });
});

export default router;
export { router };
export const shareRouter = router;
export const shareRoutes = router;

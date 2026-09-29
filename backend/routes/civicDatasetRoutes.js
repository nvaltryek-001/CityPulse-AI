import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const model =
      mongoose.models.CivicDataset ||
      mongoose.models.CivicIssue ||
      mongoose.models.DatasetRecord;

    if (!model) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        source:
          "MongoDB civic dataset model not currently registered"
      });
    }

    const data =
      await model
        .find({})
        .limit(500)
        .lean();

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load civic dataset."
    });
  }
});

export default router;
export { router };
export const civicDatasetRouter = router;
export const civicDatasetRoutes = router;

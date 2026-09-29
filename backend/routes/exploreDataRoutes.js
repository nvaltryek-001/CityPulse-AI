import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const models = [
      "CivicDataset",
      "CivicIssue",
      "DatasetRecord"
    ];

    let model = null;

    for (const name of models) {
      if (mongoose.models[name]) {
        model = mongoose.models[name];
        break;
      }
    }

    if (!model) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        source:
          "Existing civic dataset model not registered"
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
        "Unable to load explore data."
    });
  }
});

router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "explore-data",
    status: "ok"
  });
});

export default router;
export { router };
export const exploreDataRouter = router;
export const exploreDataRoutes = router;

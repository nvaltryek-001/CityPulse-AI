import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const latitude =
      Number(req.query.latitude);

    const longitude =
      Number(req.query.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "latitude and longitude are required."
      });
    }

    const Report =
      mongoose.models.Report;

    if (!Report) {
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }

    const data =
      await Report
        .find({
          "location.latitude": {
            $gte: latitude - 0.08,
            $lte: latitude + 0.08
          },
          "location.longitude": {
            $gte: longitude - 0.08,
            $lte: longitude + 0.08
          }
        })
        .sort({
          createdAt: -1
        })
        .limit(
          Number(
            req.query.limit || 20
          )
        )
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
        "Unable to load nearby issues."
    });
  }
});

export default router;
export { router };
export const nearbyIssueRouter = router;
export const nearbyIssueRoutes = router;

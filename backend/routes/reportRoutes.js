import express from "express";
import mongoose from "mongoose";

const router = express.Router();

function getReportModel() {
  if (mongoose.models.Report) {
    return mongoose.models.Report;
  }

  const schema = new mongoose.Schema(
    {
      reportId: String,
      category: String,
      issueType: String,
      description: String,
      status: {
        type: String,
        default: "Submitted"
      },
      priority: {
        type: String,
        default: "Medium"
      },
      severity: {
        type: Number,
        default: 3
      },
      department: String,
      location: {
        latitude: Number,
        longitude: Number,
        address: String
      },
      aiAnalysis: mongoose.Schema.Types.Mixed,
      images: mongoose.Schema.Types.Mixed
    },
    {
      timestamps: true,
      strict: false
    }
  );

  return mongoose.model(
    "Report",
    schema
  );
}

router.get("/", async (req, res) => {
  try {
    const Report = getReportModel();

    const reports =
      await Report
        .find({})
        .sort({
          createdAt: -1
        })
        .limit(200)
        .lean();

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load reports."
    });
  }
});

router.get("/nearby", async (req, res) => {
  try {
    const latitude =
      Number(req.query.latitude);

    const longitude =
      Number(req.query.longitude);

    const radius =
      Number(req.query.radius || 5000);

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

    const Report = getReportModel();

    const reports =
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
        .limit(50)
        .lean();

    res.json({
      success: true,
      count: reports.length,
      radius,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load nearby reports."
    });
  }
});

router.get("/:reportId", async (req, res) => {
  try {
    const Report = getReportModel();

    const report =
      await Report.findOne({
        reportId:
          req.params.reportId
      }).lean();

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found."
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load report."
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const Report = getReportModel();

    const timestamp =
      new Date()
        .toISOString()
        .replace(/\D/g, "")
        .slice(0, 14);

    const report =
      await Report.create({
        ...req.body,
        reportId:
          req.body.reportId ||
          `CP-${timestamp}`,
        status:
          req.body.status ||
          "Submitted"
      });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to create report."
    });
  }
});

export default router;
export { router };
export const reportRouter = router;
export const reportRoutes = router;

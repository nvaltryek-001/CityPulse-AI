import Report from "../models/Report.js";
import {
  buildBackendShareText
} from "../services/shareService.js";

export async function getSharePayload(
  req,
  res
) {
  try {
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

    const text =
      buildBackendShareText(
        report
      );

    const subject =
      `CityPulse AI Civic Report — ${report.reportId}`;

    return res.json({
      success: true,
      data: {
        reportId:
          report.reportId,
        subject,
        text
      }
    });
  } catch (error) {
    console.error(
      "Share payload error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate share payload."
    });
  }
}

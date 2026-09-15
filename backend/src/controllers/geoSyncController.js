import {
  syncReportToGeoIndex
} from "../services/gpsReportService.js";

import Report
  from "../models/Report.js";

export async function syncReportGeo(
  req,
  res
) {

  try {

    const reportId =
      req.params.reportId;

    if (!reportId) {

      return res.status(400).json({
        success: false,
        message:
          "reportId is required."
      });
    }

    const report =
      await Report.findById(
        reportId
      ).lean();

    if (!report) {

      return res.status(404).json({
        success: false,
        message:
          "Report not found."
      });
    }

    const geoRecord =
      await syncReportToGeoIndex(
        report
      );

    if (!geoRecord) {

      return res.status(400).json({
        success: false,
        mapped: false,
        message:
          "This report does not contain valid GPS coordinates."
      });
    }

    return res.json({
      success: true,
      mapped: true,
      geoReport: geoRecord
    });

  } catch (error) {

    console.error(
      "Geo sync error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to synchronize report GPS."
    });
  }
}

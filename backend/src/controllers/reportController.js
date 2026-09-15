import { syncReportToGeoIndex } from "../services/gpsReportService.js";
import {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport
} from "../services/reportService.js";

export async function createReportController(
  req,
  res
) {
  try {
    const body = req.body || {};

    if (!body.description && !body.aiAnalysis) {
      return res.status(400).json({
        success: false,
        message:
          "Report description or AI analysis is required."
      });
    }

    const report =
      await createReport(body);

    await syncReportToGeoIndex(report);

    return res.status(201).json({
      success: true,
      message: "Civic report created successfully.",
      data: report
    });
  } catch (error) {
    console.error(
      "Create report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create civic report."
    });
  }
}

export async function listReports(
  req,
  res
) {
  try {
    const reports =
      await getReports(req.query);

    return res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error(
      "List reports error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports."
    });
  }
}

export async function getReport(
  req,
  res
) {
  try {
    const report =
      await getReportById(
        req.params.reportId
      );

    await syncReportToGeoIndex(report);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found."
      });
    }

    return res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error(
      "Get report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch report."
    });
  }
}

export async function patchReport(
  req,
  res
) {
  try {
    const report =
      await updateReport(
        req.params.reportId,
        req.body || {}
      );

    await syncReportToGeoIndex(report);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found."
      });
    }

    return res.json({
      success: true,
      message: "Report updated successfully.",
      data: report
    });
  } catch (error) {
    console.error(
      "Update report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update report."
    });
  }
}

export async function removeReport(
  req,
  res
) {
  try {
    const report =
      await deleteReport(
        req.params.reportId
      );

    await syncReportToGeoIndex(report);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found."
      });
    }

    return res.json({
      success: true,
      message: "Report deleted successfully."
    });
  } catch (error) {
    console.error(
      "Delete report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete report."
    });
  }
}


import {
  listCivicDatasetRecords,
  getCivicDatasetStats
} from "../services/civicDatasetService.js";

export async function getCivicDataset(req, res) {
  try {
    const records =
      await listCivicDatasetRecords(req.query);

    res.json({
      success: true,
      source: "BBMP",
      count: records.length,
      records
    });
  } catch (error) {
    console.error("Civic dataset error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load civic dataset"
    });
  }
}

export async function getCivicDatasetAnalytics(req, res) {
  try {
    const stats =
      await getCivicDatasetStats();

    res.json({
      success: true,
      source: "BBMP",
      ...stats
    });
  } catch (error) {
    console.error(
      "Civic dataset analytics error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to calculate civic dataset analytics"
    });
  }
}
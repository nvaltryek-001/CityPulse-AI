import {
  findNearbyIssues,
  getNearbyStats
} from "../services/nearbyIssueService.js";

export async function getNearbyIssues(
  req,
  res
) {

  try {

    const {
      latitude,
      longitude,
      radius = 5000,
      category,
      status,
      limit = 100
    } = req.query;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {

      return res.status(400).json({
        success: false,
        message:
          "latitude and longitude are required."
      });
    }

    const issues =
      await findNearbyIssues({
        latitude,
        longitude,
        radiusMeters: radius,
        category,
        status,
        limit
      });

    return res.json({
      success: true,
      source: "CITYPULSE",
      latitude: Number(latitude),
      longitude: Number(longitude),
      radiusMeters: Number(radius),
      count: issues.length,
      issues
    });

  } catch (error) {

    console.error(
      "Nearby issues error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load nearby civic issues."
    });
  }
}

export async function getNearbyIssueStats(
  req,
  res
) {

  try {

    const {
      latitude,
      longitude,
      radius = 5000
    } = req.query;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {

      return res.status(400).json({
        success: false,
        message:
          "latitude and longitude are required."
      });
    }

    const stats =
      await getNearbyStats({
        latitude,
        longitude,
        radiusMeters: radius
      });

    return res.json({
      success: true,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radiusMeters: Number(radius),
      stats
    });

  } catch (error) {

    console.error(
      "Nearby stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to calculate nearby statistics."
    });
  }
}

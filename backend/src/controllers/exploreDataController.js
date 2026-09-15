import {
  getExploreData
} from "../services/exploreDataService.js";

export async function getExploreDataController(
  req,
  res
) {

  try {

    const {
      latitude,
      longitude,
      radius = 10000,
      limit = 250,
      category,
      status
    } = req.query;

    const data =
      await getExploreData({
        latitude,
        longitude,
        radiusMeters: radius,
        limit,
        category,
        status
      });

    return res.json({
      success: true,
      ...data
    });

  } catch (error) {

    console.error(
      "Explore data error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load Explore civic data."
    });
  }
}

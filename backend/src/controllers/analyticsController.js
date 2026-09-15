import {
  getAnalytics
} from "../services/analyticsService.js";

export async function analyticsController(
  req,
  res
) {

  try {

    const result =
      await getAnalytics({
        from: req.query.from,
        to: req.query.to,
        category:
          req.query.category
      });

    return res.json(
      result
    );

  } catch (error) {

    console.error(
      "Analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate analytics."
    });
  }
}

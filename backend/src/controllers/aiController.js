import { analyzeCivicImages } from "../services/geminiService.js";

export async function analyzeImages(req, res) {
  try {
    const { images, report } = req.body || {};

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required."
      });
    }

    const result = await analyzeCivicImages({
      images,
      report
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("AI analysis error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "AI analysis failed."
    });
  }
}

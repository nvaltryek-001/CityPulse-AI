import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message:
          "GEMINI_API_KEY is not configured."
      });
    }

    const imageData =
      req.body?.imageData;

    const mimeType =
      req.body?.mimeType ||
      "image/jpeg";

    if (!imageData) {
      return res.status(400).json({
        success: false,
        message:
          "imageData is required."
      });
    }

    const ai =
      new GoogleGenAI({
        apiKey
      });

    const result =
      await ai.models.generateContent({
        model:
          process.env.GEMINI_MODEL ||
          "gemini-3.6-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: imageData
                }
              },
              {
                text:
                  `Analyze this civic issue image.
Return JSON with:
detectedIssue,
category,
severity,
priority,
confidence,
observations,
recommendation,
department,
evidenceQuality,
possibleDuplicate.
Do not invent location information.`
              }
            ]
          }
        ],
        config: {
          responseMimeType:
            "application/json"
        }
      });

    const text =
      result?.text ||
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "{}";

    let data = {};

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        detectedIssue:
          "Civic issue",
        category:
          "Others",
        severity: 3,
        priority:
          "Medium",
        confidence: 0,
        observations:
          text,
        recommendation:
          "Review manually.",
        department:
          "Municipal Services",
        evidenceQuality:
          "Unknown",
        possibleDuplicate:
          false
      };
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "AI analysis failed."
    });
  }
});

router.get("/health", (req, res) => {
  res.json({
    success: true,
    configured:
      Boolean(
        process.env.GEMINI_API_KEY
      ),
    service: "gemini"
  });
});

export default router;
export { router };
export const aiRouter = router;
export const aiRoutes = router;

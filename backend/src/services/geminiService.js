import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

const MODEL_NAME = "gemini-3.6-flash";

function extractJson(text) {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");

  if (first === -1 || last === -1) {
    throw new Error("Gemini returned invalid JSON");
  }

  return JSON.parse(cleaned.slice(first, last + 1));
}

function normalizeBase64(value) {
  if (!value) return "";

  if (value.includes(",")) {
    return value.split(",")[1];
  }

  return value;
}

export async function analyzeCivicImages({
  images = [],
  report = {}
}) {
  if (!env.geminiApiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add your Gemini API key to backend/.env"
    );
  }

  if (!Array.isArray(images) || images.length === 0) {
    throw new Error("At least one image is required");
  }

  const ai = new GoogleGenAI({
    apiKey: env.geminiApiKey
  });

  const imageParts = images
    .filter((image) => image?.dataUrl)
    .map((image) => ({
      inlineData: {
        data: normalizeBase64(image.dataUrl),
        mimeType: image.type || "image/jpeg"
      }
    }));

  if (imageParts.length === 0) {
    throw new Error("No valid image data was supplied");
  }

  const prompt = `
You are CityPulse AI, an expert civic infrastructure inspection assistant.

Analyze the supplied civic issue photograph(s).

User-provided context:
Issue type: ${report.issueType || "Unknown"}
Location: ${report.location || "Unknown"}
Severity supplied by user: ${report.severity || "Unknown"}
Traffic level: ${report.trafficLevel || "Unknown"}
Safety risk: ${report.safetyRisk || "Unknown"}
Description: ${report.description || "No description"}

Your task:
1. Identify the most likely civic problem.
2. Determine its category.
3. Estimate severity.
4. Determine priority.
5. Identify visible evidence.
6. Recommend the responsible civic department.
7. Recommend practical action.
8. Estimate AI confidence.
9. Identify whether the image appears unclear or insufficient.
10. Do NOT invent facts that cannot be visually supported.

Allowed categories:
- Roads
- Pothole
- Garbage
- Drainage
- Water Supply
- Street Light
- Electricity
- Sanitation
- Traffic
- Public Safety
- Other

Return ONLY valid JSON using exactly this structure:

{
  "detectedIssue": "string",
  "category": "string",
  "severity": 1,
  "priority": "Low",
  "confidence": 0,
  "observations": [
    "string"
  ],
  "recommendation": "string",
  "department": "string",
  "evidenceQuality": "Good",
  "possibleDuplicate": false
}

severity must be 1 to 5.
priority must be Low, Medium, High, or Critical.
confidence must be between 0 and 100.
evidenceQuality must be Good, Fair, or Poor.
`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt
          },
          ...imageParts.map((imagePart) => ({
            inlineData: imagePart.inlineData
          }))
        ]
      }
    ]
  });

  const text = response.text;

  const parsed = extractJson(text);

  return {
    detectedIssue:
      parsed.detectedIssue || "Civic issue detected",

    category:
      parsed.category ||
      report.issueType ||
      "Other",

    severity: Math.min(
      5,
      Math.max(1, Number(parsed.severity) || 1)
    ),

    priority:
      parsed.priority || "Medium",

    confidence: Math.min(
      100,
      Math.max(0, Number(parsed.confidence) || 0)
    ),

    observations:
      Array.isArray(parsed.observations)
        ? parsed.observations
        : [],

    recommendation:
      parsed.recommendation ||
      "Inspection by the responsible civic department is recommended.",

    department:
      parsed.department ||
      "Municipal Civic Authority",

    evidenceQuality:
      parsed.evidenceQuality ||
      "Fair",

    possibleDuplicate:
      Boolean(parsed.possibleDuplicate)
  };
}

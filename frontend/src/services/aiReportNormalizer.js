const DEFAULT_ANALYSIS = {
  title: "Civic Issue",
  description: "",
  category: "Other",
  subCategory: null,
  priority: "medium",
  severity: "medium",
  department: "Municipal Services",
  confidence: 0,
  recommendation: "",
  detectedObjects: [],
  keywords: []
};

function cleanString(value, fallback = "") {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value).trim();
}

function normalizePriority(value) {
  const text =
    cleanString(value, "medium").toLowerCase();

  if (
    ["critical", "urgent", "emergency"].includes(text)
  ) {
    return "critical";
  }

  if (
    ["high", "severe"].includes(text)
  ) {
    return "high";
  }

  if (
    ["low", "minor"].includes(text)
  ) {
    return "low";
  }

  return "medium";
}

function normalizeConfidence(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  if (number <= 1) {
    return Math.round(number * 100);
  }

  return Math.max(
    0,
    Math.min(100, Math.round(number))
  );
}

function parseJsonText(text) {
  if (!text) {
    return null;
  }

  if (typeof text === "object") {
    return text;
  }

  const raw = String(text).trim();

  try {
    return JSON.parse(raw);
  } catch {}

  const fenced =
    raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

  try {
    return JSON.parse(fenced);
  } catch {}

  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");

  if (start >= 0 && end > start) {
    try {
      return JSON.parse(
        fenced.slice(start, end + 1)
      );
    } catch {}
  }

  return null;
}

export function normalizeAIReport(raw) {
  const parsed =
    parseJsonText(
      raw?.analysis ||
      raw?.result ||
      raw?.text ||
      raw
    ) || {};

  const result = {
    ...DEFAULT_ANALYSIS,

    title:
      cleanString(
        parsed.title,
        DEFAULT_ANALYSIS.title
      ),

    description:
      cleanString(
        parsed.description
      ),

    category:
      cleanString(
        parsed.category,
        DEFAULT_ANALYSIS.category
      ),

    subCategory:
      parsed.subCategory ??
      parsed.sub_category ??
      null,

    priority:
      normalizePriority(
        parsed.priority
      ),

    severity:
      normalizePriority(
        parsed.severity
      ),

    department:
      cleanString(
        parsed.department,
        DEFAULT_ANALYSIS.department
      ),

    confidence:
      normalizeConfidence(
        parsed.confidence
      ),

    recommendation:
      cleanString(
        parsed.recommendation
      ),

    detectedObjects:
      Array.isArray(parsed.detectedObjects)
        ? parsed.detectedObjects
        : [],

    keywords:
      Array.isArray(parsed.keywords)
        ? parsed.keywords
        : []
  };

  return result;
}

export { parseJsonText };

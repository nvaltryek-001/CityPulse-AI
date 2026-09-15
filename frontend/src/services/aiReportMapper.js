import { normalizeAIReport }
  from "./aiReportNormalizer.js";

export function mapAIToReport(aiResponse = {}) {

  const analysis =
    normalizeAIReport(
      aiResponse.analysis ||
      aiResponse.result ||
      aiResponse.data ||
      aiResponse
    );

  return {

    title:
      analysis.title,

    description:
      analysis.description,

    category:
      analysis.category,

    subCategory:
      analysis.subCategory,

    priority:
      analysis.priority,

    severity:
      analysis.severity,

    department:
      analysis.department,

    aiAnalysis:
      analysis,

    recommendation:
      analysis.recommendation,

    confidence:
      analysis.confidence,

    detectedObjects:
      analysis.detectedObjects,

    keywords:
      analysis.keywords
  };
}

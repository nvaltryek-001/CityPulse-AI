/**
 * CityPulse AI
 * AI Analysis Contract
 *
 * This is the exact shape expected from the
 * future backend AI Vision endpoint.
 */

export function createEmptyAIResult() {
  return {
    detectedIssue: "",
    category: "",
    confidence: 0,

    severity: 0,
    priority: "Medium",

    department: "",

    observations: [],

    recommendation: "",

    model: "pending",

    analyzedAt: null
  };
}

export function normalizeAIResult(result = {}) {
  return {
    ...createEmptyAIResult(),

    ...result,

    confidence:
      Number(result.confidence || 0),

    severity:
      Number(result.severity || 0),

    observations:
      Array.isArray(
        result.observations
      )
        ? result.observations
        : [],

    analyzedAt:
      result.analyzedAt ||
      new Date().toISOString()
  };
}

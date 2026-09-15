/**
 * CityPulse AI
 * Standard Civic Report Model
 *
 * This object is intentionally backend-ready.
 * Later Script 10 will send the same structure to MongoDB.
 */

export const REPORT_CATEGORIES = [
  "Road & Traffic",
  "Cleanliness",
  "Street Lights",
  "Water & Drainage",
  "Public Safety",
  "Parks & Recreation",
  "Other"
];

export const REPORT_STATUSES = [
  "Open",
  "Under Review",
  "In Progress",
  "Resolved"
];

export const REPORT_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Critical"
];

export const TRAFFIC_IMPACTS = [
  "Low",
  "Medium",
  "High"
];

export function createReportId() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);

  return `CP-${year}-${random}`;
}

export function getDepartment(category) {
  const departments = {
    "Road & Traffic": "Public Works Department",
    "Cleanliness": "Solid Waste Management",
    "Street Lights": "Electrical Department",
    "Water & Drainage": "Water Supply Department",
    "Public Safety": "Public Safety Department",
    "Parks & Recreation": "Parks & Recreation Department",
    "Other": "Civic Administration"
  };

  return departments[category] || "Civic Administration";
}

export function getPriority(severity, safetyRisk, trafficImpact) {
  const severityScore = Number(severity || 1);
  const safetyScore = Number(safetyRisk || 1);

  const trafficScore =
    trafficImpact === "High"
      ? 3
      : trafficImpact === "Medium"
      ? 2
      : 1;

  const score =
    severityScore +
    safetyScore +
    trafficScore;

  if (score >= 12) return "Critical";
  if (score >= 9) return "High";
  if (score >= 6) return "Medium";

  return "Low";
}

export function getExpectedResponse(priority) {
  const responseTimes = {
    Critical: "Immediate attention",
    High: "Within 24 hours",
    Medium: "Within 3 days",
    Low: "Within 7 days"
  };

  return responseTimes[priority] || "To be assessed";
}

export function createEmptyReport() {
  return {
    id: createReportId(),

    issueType: "",
    category: "",
    description: "",

    severity: 3,
    safetyRisk: 3,
    trafficImpact: "Medium",

    location: "",
    latitude: null,
    longitude: null,
    accuracy: null,

    images: [],

    aiAnalysis: {
      detectedIssue: "",
      confidence: 0,
      observations: [],
      recommendation: "",
      model: "pending"
    },

    department: "",
    priority: "Medium",

    status: "Open",

    expectedResponse: "To be assessed",

    citizen: {
      name: "",
      email: "",
      phone: ""
    },

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    metadata: {
      source: "CityPulse AI",
      version: "1.0",
      platform: "web"
    }
  };
}

export function normalizeReport(input = {}) {
  const category = input.category || "";
  const severity = Number(input.severity || 3);
  const safetyRisk = Number(input.safetyRisk || 3);
  const trafficImpact = input.trafficImpact || "Medium";

  const priority =
    input.priority ||
    getPriority(
      severity,
      safetyRisk,
      trafficImpact
    );

  return {
    ...createEmptyReport(),

    ...input,

    id: input.id || createReportId(),

    severity,
    safetyRisk,
    trafficImpact,

    category,

    department:
      input.department ||
      getDepartment(category),

    priority,

    expectedResponse:
      input.expectedResponse ||
      getExpectedResponse(priority),

    status:
      input.status || "Open",

    images:
      Array.isArray(input.images)
        ? input.images
        : [],

    aiAnalysis:
      input.aiAnalysis || {
        detectedIssue: input.issueType || "",
        confidence: 0,
        observations: [],
        recommendation: "",
        model: "pending"
      },

    createdAt:
      input.createdAt ||
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),

    metadata: {
      source: "CityPulse AI",
      version: "1.0",
      platform: "web",
      ...(input.metadata || {})
    }
  };
}

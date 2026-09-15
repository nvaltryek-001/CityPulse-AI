import { getCurrentReport } from "./reportService.js";
import { attachGpsToReport } from "./reportGpsPayload.js";

const STORAGE_KEY = "citypulse_report_pipeline";

function readPipeline() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePipeline(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

  return data;
}

export function startPipeline() {
  return savePipeline({
    ...readPipeline(),
    status: "draft",
    currentStep: "report",
    startedAt:
      readPipeline().startedAt ||
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString()
  });
}

export function savePipelineReport(report) {
  return savePipeline({
    ...readPipeline(),
    report,
    currentStep: "report",
    updatedAt: new Date().toISOString()
  });
}

export function savePipelinePhotos(photos) {
  return savePipeline({
    ...readPipeline(),
    photos: Array.isArray(photos) ? photos : [],
    currentStep: "photos",
    updatedAt: new Date().toISOString()
  });
}

export function savePipelineAnalysis(analysis) {
  return savePipeline({
    ...readPipeline(),
    analysis: analysis || null,
    currentStep: "analysis",
    updatedAt: new Date().toISOString()
  });
}

export function savePipelineGps(gps) {
  const current = readPipeline();

  let report =
    current.report ||
    getCurrentReport?.() ||
    {};

  if (gps) {
    report = attachGpsToReport(
      report,
      gps
    );
  }

  return savePipeline({
    ...current,
    report,
    gps: gps || null,
    currentStep: "gps",
    updatedAt: new Date().toISOString()
  });
}

export function savePipelineCivicReport(civicReport) {
  return savePipeline({
    ...readPipeline(),
    civicReport:
      civicReport || null,
    currentStep: "civic-report",
    updatedAt: new Date().toISOString()
  });
}

export function markPipelineSubmitted(result) {
  return savePipeline({
    ...readPipeline(),
    result: result || null,
    status: "submitted",
    currentStep: "complete",
    submittedAt:
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString()
  });
}

export function getPipeline() {
  return readPipeline();
}

export function clearPipeline() {
  localStorage.removeItem(STORAGE_KEY);
}

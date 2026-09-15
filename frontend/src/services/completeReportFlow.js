import { submitReportWithOfflineSupport } from "./offlineReportSubmitter.js";
import { getCurrentReport } from "./reportService.js";
import { attachGpsToReport } from "./reportGpsPayload.js";

const FLOW_KEY = "citypulse_complete_report_flow";

function readFlow() {
  try {
    const raw = localStorage.getItem(FLOW_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeFlow(flow) {
  localStorage.setItem(FLOW_KEY, JSON.stringify(flow));
  return flow;
}

export function startReportFlow() {
  const existing = readFlow();

  const flow = {
    ...existing,
    startedAt: existing.startedAt || new Date().toISOString(),
    status: "draft",
    step: "report"
  };

  return writeFlow(flow);
}

export function updateReportFlow(values = {}) {
  const current = readFlow();

  return writeFlow({
    ...current,
    ...values,
    updatedAt: new Date().toISOString()
  });
}

export function setReportPhotos(photos = []) {
  return updateReportFlow({
    photos,
    photoCount: photos.length,
    step: "photos"
  });
}

export function setReportAnalysis(analysis = {}) {
  return updateReportFlow({
    analysis,
    step: "analysis"
  });
}

export function setReportGps(gps) {
  const current = readFlow();

  let report = current.report || getCurrentReport?.() || {};

  if (gps) {
    report = attachGpsToReport(report, gps);
  }

  return updateReportFlow({
    report,
    gps,
    step: "gps"
  });
}

export function setCivicReport(civicReport = {}) {
  return updateReportFlow({
    civicReport,
    step: "civic-report"
  });
}

export function markReportSubmitted(result = {}) {
  return updateReportFlow({
    result,
    status: "submitted",
    submittedAt: new Date().toISOString(),
    step: "complete"
  });
}

export function getReportFlow() {
  return readFlow();
}

export function clearReportFlow() {
  localStorage.removeItem(FLOW_KEY);
}

export function isReportFlowComplete() {
  const flow = readFlow();

  return Boolean(
    flow.status === "submitted" &&
    flow.result
  );
}

export async function submitCompleteReportOfflineSafe(reportPayload) {
  return submitReportWithOfflineSupport(reportPayload);
}

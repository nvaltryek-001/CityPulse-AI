
export async function submitReportProductionSafe(reportPayload) {
  return submitReportWithOfflineSupport(reportPayload);
}
import { submitReportWithOfflineSupport } from "./offlineReportSubmitter.js";
import {
  createMongoReport
} from "./mongodbReportApi.js";

import {
  getPipeline,
  markPipelineSubmitted
} from "./reportPipelineService.js";

import {
  buildFinalReportPayload
} from "./finalReportPayload.js";

export async function submitCurrentReport(
  overrides = {}
) {

  const pipeline =
    getPipeline();

  const payload =
    buildFinalReportPayload({
      ...pipeline,
      ...overrides
    });

  if (!payload.title) {
    throw new Error(
      "Report title is required."
    );
  }

  if (!payload.description) {
    throw new Error(
      "Report description is required."
    );
  }

  if (!payload.category) {
    throw new Error(
      "Report category is required."
    );
  }

  const result =
    await createMongoReport(
      payload
    );

  markPipelineSubmitted(
    result
  );

  return {
    payload,
    result
  };
}


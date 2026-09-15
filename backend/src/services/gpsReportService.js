import CivicGeoReport
  from "../models/CivicGeoReport.js";

import {
  extractReportCoordinates
} from "./reportGpsService.js";

export async function syncReportToGeoIndex(
  report
) {

  if (!report) {
    return null;
  }

  const coordinates =
    extractReportCoordinates(report);

  /*
   * No GPS = do not create a map point.
   *
   * This prevents fabricated coordinates.
   */
  if (!coordinates) {
    return null;
  }

  const rawId =
    report._id ??
    report.id ??
    report.reportId;

  if (
    rawId === undefined ||
    rawId === null
  ) {
    return null;
  }

  const reportId =
    String(rawId);

  const geoRecord = {

    reportId,

    title:
      report.title ??
      report.issueTitle ??
      report.category ??
      "Civic Issue",

    description:
      report.description ??
      "",

    category:
      report.category ??
      "Other",

    priority:
      report.priority ??
      "medium",

    status:
      report.status ??
      "open",

    department:
      report.department ??
      "",

    address:
      report.location?.address ??
      report.address ??
      "",

    latitude:
      coordinates.latitude,

    longitude:
      coordinates.longitude,

    location:
      coordinates.geo,

    source:
      "CITYPULSE",

    originalReportId:
      report._id ?? null,

    createdAt:
      report.createdAt ??
      new Date()
  };

  return CivicGeoReport.findOneAndUpdate(
    {
      reportId
    },
    {
      $set: geoRecord
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  ).lean();
}

export async function removeReportFromGeoIndex(
  report
) {

  if (!report) {
    return null;
  }

  const rawId =
    report._id ??
    report.id ??
    report.reportId;

  if (
    rawId === undefined ||
    rawId === null
  ) {
    return null;
  }

  return CivicGeoReport.deleteOne({
    reportId: String(rawId)
  });
}

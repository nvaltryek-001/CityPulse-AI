import CivicGeoReport from "../models/CivicGeoReport.js";
import CivicDatasetRecord from "../models/CivicDatasetRecord.js";

export async function getExploreData({
  latitude,
  longitude,
  radiusMeters = 10000,
  limit = 250,
  category,
  status
} = {}) {

  const response = {
    source: "CITYPULSE + BBMP",
    citypulse: [],
    bbmp: [],
    totals: {
      citypulse: 0,
      bbmp: 0
    }
  };

  /*
   * CITYPULSE GPS REPORTS
   *
   * Only records with real coordinates are returned.
   */
  if (
    latitude !== undefined &&
    longitude !== undefined
  ) {

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {

      const safeRadius = Math.min(
        Math.max(
          Number(radiusMeters) || 10000,
          100
        ),
        50000
      );

      const safeLimit = Math.min(
        Math.max(
          Number(limit) || 250,
          1
        ),
        500
      );

      const filter = {
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat]
            },
            $maxDistance: safeRadius
          }
        }
      };

      if (category) {
        filter.category = category;
      }

      if (status) {
        filter.status = status;
      }

      const records = await CivicGeoReport
        .find(filter)
        .limit(safeLimit)
        .lean();

      response.citypulse = records.map(record => ({
        id: String(record._id),
        reportId: record.reportId,
        source: "CITYPULSE",
        title: record.title,
        description: record.description,
        category: record.category,
        priority: record.priority,
        status: record.status,
        department: record.department,
        address: record.address,
        latitude: record.latitude,
        longitude: record.longitude,
        createdAt: record.createdAt
      }));

      response.totals.citypulse =
        response.citypulse.length;
    }
  }

  /*
   * BBMP HISTORICAL DATA
   *
   * Historical BBMP dataset does NOT contain reliable
   * latitude/longitude in our imported records.
   *
   * Therefore we intentionally do NOT fabricate map points.
   *
   * We still expose a small real-data summary so Explore
   * can show BBMP civic intelligence beside the live map.
   */

  const bbmpMatch = {};

  if (category) {
    bbmpMatch.category = category;
  }

  if (status) {
    bbmpMatch.status = status;
  }

  const bbmpRecords = await CivicDatasetRecord
    .find(bbmpMatch)
    .sort({ grievanceDate: -1 })
    .limit(500)
    .lean();

  response.bbmp = bbmpRecords.map(record => ({
    id: String(record._id),
    complaintId: record.complaintId,
    source: "BBMP",
    category: record.category,
    subCategory: record.subCategory,
    grievanceDate: record.grievanceDate,
    wardName: record.wardName,
    status: record.status
  }));

  response.totals.bbmp =
    response.bbmp.length;

  return response;
}

import Report from "../models/Report.js";

function createReportId() {
  const now = new Date();

  const date = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `CP-${date}-${random}`;
}

export async function createReport(data) {
  const reportId =
    data.reportId || createReportId();

  const report = await Report.create({
    ...data,
    reportId
  });

  return report;
}

export async function getReports(filters = {}) {
  const query = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  return Report.find(query)
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();
}

export async function getReportById(reportId) {
  return Report.findOne({
    reportId
  }).lean();
}

export async function updateReport(
  reportId,
  updates
) {
  return Report.findOneAndUpdate(
    { reportId },
    { $set: updates },
    {
      new: true,
      runValidators: true
    }
  ).lean();
}

export async function deleteReport(reportId) {
  return Report.findOneAndDelete({
    reportId
  }).lean();
}

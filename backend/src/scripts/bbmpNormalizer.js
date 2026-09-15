function cleanText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function normalizeStatus(value) {
  const text = cleanText(value).toLowerCase();

  if (
    text.includes("closed") ||
    text.includes("resolved") ||
    text.includes("complete")
  ) {
    return "resolved";
  }

  if (
    text.includes("progress") ||
    text.includes("working") ||
    text.includes("assigned")
  ) {
    return "in-progress";
  }

  if (
    text.includes("reject") ||
    text.includes("invalid")
  ) {
    return "rejected";
  }

  return "open";
}

function normalizeCategory(value) {
  const text = cleanText(value);

  if (!text) {
    return "Other";
  }

  return text;
}

export function normalizeBBMPRecord(row, index = 0) {
  const complaintId =
    cleanText(
      row["Complaint ID"] ??
      row["ComplaintID"] ??
      row["complaint_id"]
    ) || `BBMP-${index + 1}`;

  const category =
    normalizeCategory(
      row["Category"] ??
      row["category"]
    );

  const subCategory =
    cleanText(
      row["Sub Category"] ??
      row["SubCategory"] ??
      row["sub_category"]
    );

  const grievanceDate =
    cleanText(
      row["Grievance Date"] ??
      row["GrievanceDate"] ??
      row["grievance_date"]
    );

  const wardName =
    cleanText(
      row["Ward Name"] ??
      row["WardName"] ??
      row["ward_name"]
    );

  const status =
    normalizeStatus(
      row["Grievance Status"] ??
      row["GrievanceStatus"] ??
      row["status"]
    );

  const remarks =
    cleanText(
      row["Staff Remarks"] ??
      row["StaffRemarks"] ??
      row["remarks"]
    );

  const staffName =
    cleanText(
      row["Staff Name"] ??
      row["StaffName"] ??
      row["staff_name"]
    );

  return {
    externalId: complaintId,
    source: "BBMP",
    sourceDataset: "BBMP Grievances",
    category,
    subCategory,
    grievanceDate,
    wardName,
    status,
    staffRemarks: remarks,
    staffName,
    location: {
      address: wardName || "",
      wardName,
      latitude: null,
      longitude: null
    },
    importedAt: new Date()
  };
}

export function normalizeBBMPRecords(rows) {
  return rows.map((row, index) =>
    normalizeBBMPRecord(row, index)
  );
}
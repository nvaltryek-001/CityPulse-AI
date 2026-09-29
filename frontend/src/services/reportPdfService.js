import jsPDF from "jspdf";

function safeText(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value);
}

function formatDate(value) {

  if (!value) {
    return new Date().toLocaleString();
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return new Date().toLocaleString();
  }

  return date.toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  );
}

function getReportId(report = {}) {

  return (
    report.reportId ||
    report.id ||
    report._id ||
    "CITYPULSE-REPORT"
  );
}

function getImageData(
  report = {},
  imageDataOverride = ""
) {

  if (imageDataOverride) {
    return imageDataOverride;
  }

  const firstImage =
    Array.isArray(
      report.images
    )
      ? report.images[0]
      : null;

  return (
    firstImage?.dataUrl ||
    firstImage?.url ||
    ""
  );
}

function getImageFormat(
  imageData = ""
) {

  const match =
    String(imageData).match(
      /^data:image\/([a-zA-Z0-9+.-]+);/i
    );

  const format =
    match?.[1]?.toLowerCase() ||
    "jpeg";

  if (format === "jpg") {
    return "JPEG";
  }

  if (format === "jpeg") {
    return "JPEG";
  }

  if (format === "png") {
    return "PNG";
  }

  if (format === "webp") {
    return "WEBP";
  }

  return "JPEG";
}

function drawWrappedText(
  doc,
  text,
  x,
  y,
  width,
  lineHeight = 5
) {

  const lines =
    doc.splitTextToSize(
      safeText(text),
      width
    );

  doc.text(
    lines,
    x,
    y
  );

  return (
    y +
    lines.length *
      lineHeight
  );
}

function drawSectionTitle(
  doc,
  title,
  x,
  y
) {

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(11);

  doc.setTextColor(
    10,
    116,
    201
  );

  doc.text(
    title,
    x,
    y
  );

  doc.setTextColor(
    25,
    55,
    82
  );
}

export async function generateReportPdf(
  report = {},
  imageDataOverride = ""
) {

  const doc =
    new jsPDF({
      unit: "mm",
      format: "a4"
    });

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const margin = 16;

  const reportId =
    getReportId(report);

  const imageData =
    getImageData(
      report,
      imageDataOverride
    );

  const category =
    report.category ||
    "Civic Issue";

  const issue =
    report.issueType ||
    report.title ||
    "Civic Issue";

  const description =
    report.description ||
    "No description available.";

  const priority =
    report.priority ||
    "Medium";

  const department =
    report.department ||
    "Municipal Services";

  const status =
    report.status ||
    "Submitted";

  const severity =
    report.severity ??
    "—";

  const createdAt =
    formatDate(
      report.createdAt
    );

  const address =
    report.location?.address ||
    "Address not provided";

  const latitude =
    report.location?.latitude ??
    "";

  const longitude =
    report.location?.longitude ??
    "";

  const statusNote =
    report.statusNote ||
    report.note ||
    "";

  const statusUpdatedAt =
    report.statusUpdatedAt
      ? formatDate(
          report.statusUpdatedAt
        )
      : "";

  const resolvedAt =
    report.resolvedAt
      ? formatDate(
          report.resolvedAt
        )
      : "";

  doc.setFillColor(
    21,
    54,
    82
  );

  doc.rect(
    0,
    0,
    pageWidth,
    34,
    "F"
  );

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(20);

  doc.text(
    "CityPulse AI",
    margin,
    15
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(9);

  doc.text(
    "Civic Issue Report",
    margin,
    23
  );

  doc.text(
    `Report ID: ${reportId}`,
    pageWidth - margin,
    15,
    {
      align: "right"
    }
  );

  doc.text(
    createdAt,
    pageWidth - margin,
    23,
    {
      align: "right"
    }
  );

  let y = 46;

  drawSectionTitle(
    doc,
    "REPORT DETAILS",
    margin,
    y
  );

  y += 8;

  const detailWidth =
    (pageWidth -
      margin * 2 -
      8) /
    2;

  const drawField =
    (
      label,
      value,
      x,
      rowY
    ) => {

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        111,
        132,
        148
      );

      doc.text(
        label.toUpperCase(),
        x,
        rowY
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(10);

      doc.setTextColor(
        24,
        57,
        85
      );

      doc.text(
        safeText(value),
        x,
        rowY + 5
      );
    };

  drawField(
    "Category",
    category,
    margin,
    y
  );

  drawField(
    "Issue",
    issue,
    margin + detailWidth + 8,
    y
  );

  y += 18;

  drawField(
    "Status",
    status,
    margin,
    y
  );

  drawField(
    "Priority",
    priority,
    margin + detailWidth + 8,
    y
  );

  y += 18;

  drawField(
    "Severity",
    severity,
    margin,
    y
  );

  drawField(
    "Department",
    department,
    margin + detailWidth + 8,
    y
  );

  y += 22;

  drawSectionTitle(
    doc,
    "DESCRIPTION",
    margin,
    y
  );

  y += 7;

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(10);

  y =
    drawWrappedText(
      doc,
      description,
      margin,
      y,
      pageWidth - margin * 2,
      5
    );

  y += 8;

  drawSectionTitle(
    doc,
    "CURRENT LOCATION",
    margin,
    y
  );

  y += 7;

  y =
    drawWrappedText(
      doc,
      address,
      margin,
      y,
      pageWidth - margin * 2,
      5
    );

  if (
    latitude !== "" &&
    longitude !== ""
  ) {

    y += 4;

    doc.setFontSize(9);

    doc.setTextColor(
      80,
      105,
      123
    );

    doc.text(
      `Latitude: ${latitude}    Longitude: ${longitude}`,
      margin,
      y
    );
  }

  if (
    statusNote ||
    statusUpdatedAt ||
    resolvedAt
  ) {

    y += 10;

    drawSectionTitle(
      doc,
      "STATUS UPDATE",
      margin,
      y
    );

    y += 7;

    if (statusUpdatedAt) {
      doc.setFontSize(9);
      doc.setTextColor(
        80,
        105,
        123
      );

      doc.text(
        `Updated: ${statusUpdatedAt}`,
        margin,
        y
      );

      y += 6;
    }

    if (resolvedAt) {
      doc.text(
        `Resolved: ${resolvedAt}`,
        margin,
        y
      );

      y += 6;
    }

    if (statusNote) {
      doc.setTextColor(
        25,
        55,
        82
      );

      y =
        drawWrappedText(
          doc,
          statusNote,
          margin,
          y,
          pageWidth - margin * 2,
          5
        );

      y += 4;
    }
  }

  if (
    statusNote ||
    statusUpdatedAt ||
    resolvedAt
  ) {

    drawSectionTitle(
      doc,
      "STATUS / UPDATE NOTE",
      margin,
      y
    );

    y += 7;

    if (statusNote) {

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(10);

      y =
        drawWrappedText(
          doc,
          statusNote,
          margin,
          y,
          pageWidth - margin * 2,
          5
        );
    }

    if (
      statusUpdatedAt ||
      resolvedAt
    ) {

      y += 4;

      doc.setFontSize(8);

      doc.setTextColor(
        80,
        105,
        123
      );

      if (statusUpdatedAt) {

        doc.text(
          `Last update: ${statusUpdatedAt}`,
          margin,
          y
        );

        y += 4;
      }

      if (resolvedAt) {

        doc.text(
          `Resolved: ${resolvedAt}`,
          margin,
          y
        );

        y += 4;
      }

      doc.setTextColor(
        25,
        55,
        82
      );
    }

    y += 8;
  }

  y += 14;

  drawSectionTitle(
    doc,
    "PROBLEM EVIDENCE",
    margin,
    y
  );

  y += 7;

  if (imageData) {

    const imageFormat =
      getImageFormat(
        imageData
      );

    const imageX =
      margin;

    const imageY =
      y;

    const imageWidth =
      pageWidth - margin * 2;

    const maxImageHeight =
      pageHeight -
      imageY -
      30;

    const imageHeight =
      Math.min(
        maxImageHeight,
        78
      );

    doc.setFillColor(
      245,
      248,
      250
    );

    doc.roundedRect(
      imageX,
      imageY,
      imageWidth,
      imageHeight,
      3,
      3,
      "F"
    );

    try {

      doc.addImage(
        imageData,
        imageFormat,
        imageX + 3,
        imageY + 3,
        imageWidth - 6,
        imageHeight - 6,
        undefined,
        "MEDIUM"
      );

    } catch {

      doc.setFontSize(9);

      doc.setTextColor(
        120,
        130,
        140
      );

      doc.text(
        "Problem image could not be embedded.",
        imageX + 6,
        imageY + 12
      );
    }

  } else {

    doc.setDrawColor(
      210,
      220,
      228
    );

    doc.setLineDashPattern(
      [2, 2],
      0
    );

    doc.rect(
      margin,
      y,
      pageWidth - margin * 2,
      45
    );

    doc.setLineDashPattern(
      [],
      0
    );

    doc.setFontSize(9);

    doc.setTextColor(
      120,
      135,
      145
    );

    doc.text(
      "No evidence image attached.",
      margin + 6,
      y + 12
    );
  }

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.setTextColor(
    120,
    135,
    145
  );

  doc.text(
    "Generated by CityPulse AI",
    margin,
    pageHeight - 10
  );

  doc.text(
    "People. Places. Progress.",
    pageWidth - margin,
    pageHeight - 10,
    {
      align: "right"
    }
  );

  return doc;
}

export async function downloadReportPdf(
  report,
  imageDataOverride = ""
) {

  const doc =
    await generateReportPdf(
      report,
      imageDataOverride
    );

  const reportId =
    getReportId(report);

  doc.save(
    `CityPulse-${reportId}.pdf`
  );
}

export async function createReportPdfFile(
  report,
  imageDataOverride = ""
) {

  const doc =
    await generateReportPdf(
      report,
      imageDataOverride
    );

  const reportId =
    getReportId(report);

  const blob =
    doc.output("blob");

  return new File(
    [blob],
    `CityPulse-${reportId}.pdf`,
    {
      type: "application/pdf"
    }
  );
}

export async function shareReportPdf(
  report,
  imageDataOverride = ""
) {

  const file =
    await createReportPdfFile(
      report,
      imageDataOverride
    );

  const text =
    `CityPulse civic report ${getReportId(report)}: ${report.issueType || report.category || "Civic issue"}`;

  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({
      files: [file]
    })
  ) {

    await navigator.share({
      title:
        `CityPulse Report ${getReportId(report)}`,

      text,

      files: [file]
    });

    return true;
  }

  return false;
}

export function getWhatsAppReportUrl(
  report = {}
) {

  const reportId =
    getReportId(report);

  const message =
    [
      "CityPulse AI - Civic Report",
      "",
      `Report ID: ${reportId}`,
      `Issue: ${report.issueType || report.category || "Civic Issue"}`,
      `Status: ${report.status || "Submitted"}`,
      `Priority: ${report.priority || "Medium"}`
    ].join("\n");

  return (
    "https://wa.me/?text=" +
    encodeURIComponent(
      message
    )
  );
}

export function getEmailReportUrl(
  report = {}
) {

  const reportId =
    getReportId(report);

  const subject =
    `CityPulse Civic Report ${reportId}`;

  const body =
    [
      "CityPulse AI - Civic Report",
      "",
      `Report ID: ${reportId}`,
      `Issue: ${report.issueType || report.category || "Civic Issue"}`,
      `Status: ${report.status || "Submitted"}`,
      `Priority: ${report.priority || "Medium"}`
    ].join("\n");

  return (
    "mailto:?subject=" +
    encodeURIComponent(subject) +
    "&body=" +
    encodeURIComponent(body)
  );
}

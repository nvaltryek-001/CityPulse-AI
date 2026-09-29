export function buildReportShareText(report = {}) {
  const reportId =
    report.reportId ||
    "Pending Report";

  const issue =
    report.issueType ||
    report.aiAnalysis?.detectedIssue ||
    "Civic Issue";

  const status =
    report.status ||
    "Submitted";

  const priority =
    report.priority ||
    "Medium";

  const category =
    report.category ||
    "Other";

  return [
    `CityPulse AI Report: ${reportId}`,
    `Issue: ${issue}`,
    `Category: ${category}`,
    `Status: ${status}`,
    `Priority: ${priority}`,
    "Reported through CityPulse AI."
  ].join("\n");
}

export async function nativeShareReport(report = {}) {
  const text = buildReportShareText(report);

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function"
  ) {
    try {
      await navigator.share({
        title: `CityPulse AI - ${report.reportId || "Civic Report"}`,
        text
      });

      return {
        success: true,
        method: "native"
      };
    } catch (error) {
      if (error?.name === "AbortError") {
        return {
          success: false,
          cancelled: true,
          method: "native"
        };
      }
    }
  }

  return {
    success: false,
    unsupported: true,
    method: "native"
  };
}

export function whatsappReport(report = {}) {
  const text = encodeURIComponent(
    buildReportShareText(report)
  );

  window.open(
    `https://wa.me/?text=${text}`,
    "_blank",
    "noopener,noreferrer"
  );
}

export function emailReport(report = {}) {
  const subject = encodeURIComponent(
    `CityPulse AI Report ${report.reportId || ""}`
  );

  const body = encodeURIComponent(
    buildReportShareText(report)
  );

  window.location.href =
    `mailto:?subject=${subject}&body=${body}`;
}

export async function copyReportText(report = {}) {
  const text = buildReportShareText(report);

  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    await navigator.clipboard.writeText(text);

    return true;
  }

  const textarea =
    document.createElement("textarea");

  textarea.value = text;
  textarea.setAttribute(
    "readonly",
    ""
  );

  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);

  textarea.select();

  const copied =
    document.execCommand("copy");

  document.body.removeChild(textarea);

  return copied;
}

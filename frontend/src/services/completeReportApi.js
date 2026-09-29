const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

// eslint-disable-next-line no-useless-assignment
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      `Request failed with status ${response.status}`
    );
  }

  return data;
}

export async function submitCompleteReport(payload) {
  return request("/reports", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getReportById(reportId) {
  if (!reportId) {
    throw new Error("Report ID is required.");
  }

  return request(`/reports/${encodeURIComponent(reportId)}`);
}

export async function getNearbyReports(latitude, longitude, options = {}) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude)
  });

  if (options.radius) {
    params.set("radius", String(options.radius));
  }

  if (options.limit) {
    params.set("limit", String(options.limit));
  }

  if (options.category) {
    params.set("category", options.category);
  }

  if (options.status) {
    params.set("status", options.status);
  }

  return request(`/reports/nearby?${params.toString()}`);
}

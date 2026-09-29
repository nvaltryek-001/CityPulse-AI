const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:5000/api";

async function request(path, options = {}) {

  const response = await fetch(
    `${API_BASE}${path}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    }
  );

  const text = await response.text();

// eslint-disable-next-line no-useless-assignment
  let data = null;

  try {
    data = text
      ? JSON.parse(text)
      : null;
  } catch {
    data = text;
  }

  if (!response.ok) {

    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

function queryString(params = {}) {

  const search = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        search.set(
          key,
          String(value)
        );
      }
    }
  );

  const text = search.toString();

  return text
    ? `?${text}`
    : "";
}

export const cityPulseApi = {

  baseUrl: API_BASE,

  health() {
    return request("/health");
  },

  reports() {
    return request("/reports");
  },

  report(reportId) {
    return request(
      `/reports/${encodeURIComponent(reportId)}`
    );
  },

  explore(params = {}) {
    return request(
      `/explore${queryString(params)}`
    );
  },

  analytics() {
    return request("/analytics");
  },

  civicData(params = {}) {
    return request(
      `/civic-data${queryString(params)}`
    );
  },

  civicDatasetAnalytics() {
    return request(
      "/civic-data/analytics"
    );
  },

  nearby(
    latitude,
    longitude,
    radius = 5000,
    limit = 20
  ) {

    const query = queryString({
      latitude,
      longitude,
      radius,
      limit
    });

    return request(
      `/reports/nearby${query}`
    );
  },

  createReport(payload) {

    return request(
      "/reports",
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
  },

  updateReport(reportId, payload) {

    return request(
      `/reports/${encodeURIComponent(reportId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload)
      }
    );
  },

  analyze(payload) {

    return request(
      "/ai/analyze",
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
  }
};

export function getApiBaseUrl() {
  return API_BASE;
}

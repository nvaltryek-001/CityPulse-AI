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

  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `API request failed: ${response.status}`
    );
  }

  return data;
}

export const api = {
  baseUrl: API_BASE,

  health() {
    return request("/health");
  },

  analyze(payload) {
    return request("/ai/analyze", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  createReport(payload) {
    return request("/reports", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  getReports(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.set(key, value);
      }
    });

    const suffix = query.toString()
      ? `?${query.toString()}`
      : "";

    return request(`/reports${suffix}`);
  },

  getReport(id) {
    return request(`/reports/${encodeURIComponent(id)}`);
  },

  updateReport(id, payload) {
    return request(`/reports/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  }
};

export default api;

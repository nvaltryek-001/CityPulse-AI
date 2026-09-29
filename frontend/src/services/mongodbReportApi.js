const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

async function request(path, options = {}) {

  const response = await fetch(
    `${API_BASE}${path}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    }
  );

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
      `API request failed (${response.status})`
    );
  }

  return data;
}

export async function createMongoReport(payload) {

  if (!payload) {
    throw new Error(
      "Report payload is required."
    );
  }

  return request(
    "/reports",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export async function fetchMongoReports(
  options = {}
) {

  const params =
    new URLSearchParams();

  if (options.page) {
    params.set(
      "page",
      String(options.page)
    );
  }

  if (options.limit) {
    params.set(
      "limit",
      String(options.limit)
    );
  }

  if (options.category) {
    params.set(
      "category",
      options.category
    );
  }

  if (options.status) {
    params.set(
      "status",
      options.status
    );
  }

  const query =
    params.toString();

  return request(
    query
      ? `/reports?${query}`
      : "/reports"
  );
}

export async function fetchMongoReport(
  reportId
) {

  if (!reportId) {
    throw new Error(
      "Report ID is required."
    );
  }

  return request(
    `/reports/${encodeURIComponent(
      reportId
    )}`
  );
}

export async function updateMongoReport(
  reportId,
  payload
) {

  if (!reportId) {
    throw new Error(
      "Report ID is required."
    );
  }

  return request(
    `/reports/${encodeURIComponent(
      reportId
    )}`,
    {
      method: "PUT",
      body: JSON.stringify(payload || {})
    }
  );
}

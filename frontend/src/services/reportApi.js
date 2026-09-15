const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

async function request(
  path,
  options = {}
) {
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

  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new Error(
      `Invalid API response (${response.status})`
    );
  }

  if (
    !response.ok ||
    payload.success === false
  ) {
    throw new Error(
      payload.message ||
      `Request failed (${response.status})`
    );
  }

  return payload;
}

export async function createRemoteReport(
  report
) {
  const response =
    await request("/api/reports", {
      method: "POST",
      body: JSON.stringify(report)
    });

  return response.data;
}

export async function getRemoteReports(
  filters = {}
) {
  const params =
    new URLSearchParams();

  Object.entries(filters).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        params.set(key, value);
      }
    }
  );

  const query = params.toString();

  const response =
    await request(
      `/api/reports${query ? `?${query}` : ""}`
    );

  return response.data || [];
}

export async function getRemoteReport(
  reportId
) {
  const response =
    await request(
      `/api/reports/${encodeURIComponent(
        reportId
      )}`
    );

  return response.data;
}

export async function updateRemoteReport(
  reportId,
  updates
) {
  const response =
    await request(
      `/api/reports/${encodeURIComponent(
        reportId
      )}`,
      {
        method: "PATCH",
        body: JSON.stringify(updates)
      }
    );

  return response.data;
}

export async function deleteRemoteReport(
  reportId
) {
  return request(
    `/api/reports/${encodeURIComponent(
      reportId
    )}`,
    {
      method: "DELETE"
    }
  );
}

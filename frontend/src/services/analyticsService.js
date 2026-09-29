const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

async function request(path) {

  const response =
    await fetch(
      `${API_BASE}${path}`
    );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      data.error ||
      `Analytics request failed (${response.status})`
    );
  }

  return data;
}

export async function fetchAnalytics(
  options = {}
) {

  const params =
    new URLSearchParams();

  if (options.from) {
    params.set(
      "from",
      options.from
    );
  }

  if (options.to) {
    params.set(
      "to",
      options.to
    );
  }

  if (options.category) {
    params.set(
      "category",
      options.category
    );
  }

  const query =
    params.toString();

  return request(
    query
      ? `/analytics?${query}`
      : "/analytics"
  );
}

export async function fetchReportsForAnalytics() {
const response =
    await fetch(
      `${API_BASE}/reports?limit=1000`
    );
  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Unable to load reports."
    );
  }

  return (
    data.reports ||
    data.data ||
    data.results ||
    []
  );
}

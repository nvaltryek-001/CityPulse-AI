const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

async function request(path) {

  const response =
    await fetch(`${API_BASE}${path}`);

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
      `Explore request failed (${response.status})`
    );
  }

  return data;
}

export async function fetchNearbyIssues(
  latitude,
  longitude,
  options = {}
) {

  if (
    !Number.isFinite(Number(latitude)) ||
    !Number.isFinite(Number(longitude))
  ) {
    throw new Error(
      "Valid latitude and longitude are required."
    );
  }

  const params =
    new URLSearchParams();

  params.set(
    "latitude",
    String(latitude)
  );

  params.set(
    "longitude",
    String(longitude)
  );

  params.set(
    "radius",
    String(options.radius || 5000)
  );

  params.set(
    "limit",
    String(options.limit || 100)
  );

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

  const data =
    await request(
      `/reports/nearby?${params.toString()}`
    );

  return (
    data.reports ||
    data.data ||
    data.results ||
    []
  );
}

export async function fetchLiveReports(
  options = {}
) {

  const params =
    new URLSearchParams();

  params.set(
    "limit",
    String(options.limit || 100)
  );

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

  const data =
    await request(
      `/reports?${query}`
    );

  return (
    data.reports ||
    data.data ||
    data.results ||
    []
  );
}

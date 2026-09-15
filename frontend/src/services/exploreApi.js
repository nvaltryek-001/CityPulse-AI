const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

export async function getExploreData({
  latitude,
  longitude,
  radius = 10000,
  limit = 250,
  category = "",
  status = ""
} = {}) {

  const params =
    new URLSearchParams();

  if (
    latitude !== undefined &&
    longitude !== undefined
  ) {
    params.set(
      "latitude",
      String(latitude)
    );

    params.set(
      "longitude",
      String(longitude)
    );
  }

  params.set(
    "radius",
    String(radius)
  );

  params.set(
    "limit",
    String(limit)
  );

  if (category) {
    params.set(
      "category",
      category
    );
  }

  if (status) {
    params.set(
      "status",
      status
    );
  }

  const response =
    await fetch(
      `${API_BASE}/api/explore?${params.toString()}`
    );

  if (!response.ok) {
    throw new Error(
      `Explore API failed: ${response.status}`
    );
  }

  return response.json();
}

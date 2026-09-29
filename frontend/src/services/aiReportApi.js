const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

async function parseResponse(response) {
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
      `AI request failed (${response.status})`
    );
  }

  return data;
}

export async function analyzeCivicImage(
  image,
  metadata = {}
) {
  if (!image) {
    throw new Error(
      "An image is required for AI analysis."
    );
  }

  const body = {
    image,
    metadata
  };

  const response = await fetch(
    `${API_BASE}/ai/analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  return parseResponse(response);
}

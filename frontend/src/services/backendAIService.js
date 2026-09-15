const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new Error(
      `API returned invalid response (${response.status})`
    );
  }

  if (!response.ok || payload.success === false) {
    throw new Error(
      payload.message || `Request failed (${response.status})`
    );
  }

  return payload;
}

export async function analyzeWithBackend({
  images,
  report
}) {
  const response = await request("/api/ai/analyze", {
    method: "POST",
    body: JSON.stringify({
      images,
      report
    })
  });

  return response.data;
}

export async function checkBackendHealth() {
  return request("/api/health");
}

export { API_BASE };

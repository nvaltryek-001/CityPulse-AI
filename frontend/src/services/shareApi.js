const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export async function getRemoteSharePayload(
  reportId
) {
  const response =
    await fetch(
      `${API_BASE}/api/share/${encodeURIComponent(
        reportId
      )}`
    );

  const payload =
    await response.json();

  if (
    !response.ok ||
    payload.success === false
  ) {
    throw new Error(
      payload.message ||
      "Unable to generate share payload."
    );
  }

  return payload.data;
}

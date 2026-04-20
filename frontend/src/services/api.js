const BASE_URL =
  import.meta.env.VITE_API_BASE ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5001/api"
    : `http://${window.location.hostname}:5001/api`);

export async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  try {
    const response = await fetch(url, options);

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message =
        typeof data === "object" && data?.message
          ? data.message
          : `Request failed: ${response.status}`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error("API ERROR:", {
      url,
      method: options.method || "GET",
      error: error?.message || error,
    });
    throw error;
  }
}

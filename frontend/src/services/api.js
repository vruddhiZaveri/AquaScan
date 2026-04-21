const BASE_URL =
  import.meta.env.VITE_API_BASE ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5001/api"
    : `http://${window.location.hostname}:5001/api`);

const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 25000);

export async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const timeoutMs = Number(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });

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
    const isAbort = error?.name === "AbortError";
    const finalError = isAbort
      ? new Error("The request took too long. Please try again.")
      : error;

    console.error("API ERROR:", {
      url,
      method: options.method || "GET",
      timeoutMs,
      error: finalError?.message || finalError,
    });

    throw finalError;
  } finally {
    clearTimeout(timeoutId);
  }
}

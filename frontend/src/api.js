const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function readBody(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function getCsrfToken() {
  const response = await fetch(`${API_BASE}/api/auth/csrf`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" }
  });

  const data = await readBody(response);
  if (!response.ok || !data.token) {
    throw new Error(data.message || "Could not obtain CSRF token.");
  }
  return data.token;
}

export async function apiRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers
  };

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    // The backend returns the CSRF token in JSON and stores its cookie.
    // Send that token in the header expected by CookieCsrfTokenRepository.
    headers["X-XSRF-TOKEN"] = await getCsrfToken();
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    headers,
    credentials: "include"
  });

  const data = await readBody(response);
  if (!response.ok) {
    const message =
      data.message ||
      data.error ||
      (response.status === 403
        ? "Request rejected. Refresh the page and try again."
        : `Request failed (${response.status}).`);
    throw new Error(message);
  }
  return data;
}

export const authApi = {
  signup: (payload) =>
    apiRequest("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (payload) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  me: () => apiRequest("/api/auth/me"),
  logout: () => apiRequest("/api/auth/logout", { method: "POST" })
};

import axios from "axios";

const ACCESS_TOKEN_KEY = "cozybench_access_token";
export const GUEST_MODE_KEY = "cozybench_guest_mode";

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

type JwtPayload = {
  sub?: string;
  email?: string;
};

export function getAuthenticatedEmail() {
  const token = getAccessToken();

  if (!token) return null;

  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return null;

    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = JSON.parse(atob(paddedBase64)) as JwtPayload;

    return typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Guest routes use the Spring HttpSession cookie and intentionally omit JWT auth.
export const guestApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const buildingDtApi = axios.create({
  baseURL:
    import.meta.env.VITE_BUILDING_DT_API_BASE_URL ||
    "/api/building-dt/components",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const guestMode = typeof window !== "undefined"
    && sessionStorage.getItem(GUEST_MODE_KEY) === "true";
  if (guestMode && config.url?.startsWith("/v1/simulations")) {
    config.url = config.url.replace("/v1/simulations", "/v1/guest/simulations");
    config.withCredentials = true;
    delete config.headers.Authorization;
    return config;
  }

  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

buildingDtApi.interceptors.request.use((config) => {
  const guestMode = typeof window !== "undefined"
    && sessionStorage.getItem(GUEST_MODE_KEY) === "true";
  if (guestMode) {
    delete config.headers.Authorization;
    return config;
  }

  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

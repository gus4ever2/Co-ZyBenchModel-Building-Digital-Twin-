import axios from "axios";

export const GUEST_MODE_KEY = "cozybench_guest_mode";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// All requests use the Spring HttpSession cookie. There is no bearer token.
export const guestApi = api;

export const buildingDtApi = axios.create({
  baseURL:
    import.meta.env.VITE_BUILDING_DT_API_BASE_URL ||
    "/api/building-dt/components",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;

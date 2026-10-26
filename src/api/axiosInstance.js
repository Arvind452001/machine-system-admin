import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://node.aitechnotech.in/machine";

const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const BASE_URL = normalizedBaseUrl.endsWith("/api/v1")
  ? normalizedBaseUrl.slice(0, -7)
  : normalizedBaseUrl;

export const STORAGE_KEY_TOKEN = "machine_system_auth_token";
export const STORAGE_KEY_USER = "machine_system_auth_user";

export const getAuthToken = () => {
  try {
    const directToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (directToken) return directToken;

    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      return parsed.token || parsed.accessToken || null;
    }
  } catch (e) {
    console.error("Error reading token:", e);
  }
  return null;
};

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Remove Content-Type for FormData so axios/browser adds multipart boundary
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized request (401). Token may be invalid or expired.");
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected server error occurred.";

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    customError.originalError = error;

    return Promise.reject(customError);
  }
);

export default axiosInstance;

import axios from "axios";

import { clearSession, getStoredToken } from "@/lib/auth";

export interface ApiErrorResponse {
  error?: string;
  success?: boolean;
  subscriptionExpired?: boolean;
}

export const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      clearSession();
      // Only redirect if the user is in a dashboard, not if they're on a login page getting an 'invalid password' error
      if (window.location.pathname.includes("/dashboard")) {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

import axios from "axios";
import { storage, TOKENS } from "../utils/storage";

const DEBUG_API = true; // ✅ make false in production

export const api = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = storage.get(TOKENS.staff);
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (DEBUG_API) {
    console.log("[STAFF API] ->", config.method?.toUpperCase(), config.baseURL + config.url, {
      params: config.params,
      hasToken: !!token,
    });
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (DEBUG_API) {
      console.log("[STAFF API] <-", response.status, response.config.url, response.data);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    if (DEBUG_API) {
      console.log("[STAFF API] ERR <-", status, error.config?.url, error.response?.data);
    }
    if (status === 401) {
      storage.del(TOKENS.staff);
      console.log("[STAFF API] 401: token removed, please login again");
    }
    return Promise.reject(error);
  }
);

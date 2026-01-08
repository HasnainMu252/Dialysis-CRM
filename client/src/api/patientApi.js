import axios from "axios";
import { storage, TOKENS } from "../utils/storage";

const DEBUG_API = true;

export const patientApi = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

patientApi.interceptors.request.use((config) => {
  const token = storage.get(TOKENS.patient);
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (DEBUG_API) {
    console.log("[PATIENT API] ->", config.method?.toUpperCase(), config.baseURL + config.url, {
      params: config.params,
      hasToken: !!token,
    });
  }
  return config;
});

patientApi.interceptors.response.use(
  (response) => {
    if (DEBUG_API) console.log("[PATIENT API] <-", response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    if (DEBUG_API) console.log("[PATIENT API] ERR <-", status, error.config?.url, error.response?.data);
    if (status === 401) storage.del(TOKENS.patient);
    return Promise.reject(error);
  }
);

import { api } from "./client";

const enc = (v) => encodeURIComponent(String(v || "").trim());

export const listBeds = (params = {}) => api.get("/beds", { params });

export const getBed = (code) => api.get(`/beds/${enc(code)}`);
export const createBed = (payload) => api.post("/beds", payload);
export const updateBed = (code, payload) => api.put(`/beds/${enc(code)}`, payload);
export const updateBedStatus = (code, status) =>
  api.patch(`/beds/${enc(code)}/status`, { status });

export const deleteBed = (code) => api.delete(`/beds/${enc(code)}`);

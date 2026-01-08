import { api } from "./client";

const enc = (v) => encodeURIComponent(String(v || "").trim());

export const listShifts = () => api.get("/shifts");

export const getShift = (code) => api.get(`/shifts/${enc(code)}`);

export const createShift = (payload) => api.post("/shifts", payload);

// export const updateShift = (code, payload) =>
//   api.patch(`/shifts/${enc(code)}`, payload);

export const deleteShift = (code) =>
  api.delete(`/shifts/${enc(code)}`);

export const addShiftStaff = (code, payload) =>
  api.post(`/shifts/${enc(code)}/staff`, payload); // { userId }

// export const removeShiftStaff = (code, userId) =>
//   api.delete(`/shifts/${enc(code)}/staff/${enc(userId)}`);

export const todayWorkload = () => api.get("/shifts/workload/today");


export const updateShift = (code, payload) =>
  api.patch(`/shifts/${encodeURIComponent(code)}`, payload);

export const removeShiftStaff = (code, userId) =>
  api.delete(`/shifts/${encodeURIComponent(code)}/staff/${encodeURIComponent(userId)}`);

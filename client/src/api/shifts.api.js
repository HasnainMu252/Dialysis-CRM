import { api } from "./client";

const enc = (v) => encodeURIComponent(String(v || "").trim());

// Shift CRUD
export const createShift = (payload) => api.post("/shifts", payload);

export const listShifts = () => api.get("/shifts");

export const getShift = (code) => api.get(`/shifts/${enc(code)}`);

export const updateShift = (code, payload) =>
  api.patch(`/shifts/${enc(code)}`, payload); // or PUT if your backend requires

export const deleteShift = (code) =>
  api.delete(`/shifts/${enc(code)}`);

// Staff Assignment
export const assignStaff = (shiftCode, userId) =>
  api.post(`/shifts/${enc(shiftCode)}/staff`, { userId });

export const removeStaff = (shiftCode, userId) =>
  api.delete(`/shifts/${enc(shiftCode)}/staff/${enc(userId)}`);

// Workload
export const getTodayWorkload = () =>
  api.get("/shifts/workload/today");

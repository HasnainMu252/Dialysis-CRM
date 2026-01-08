// /client/src/api/schedules.api.js
import { api } from "./client";
import { patientApi } from "./patientApi";

// safe encoder
const enc = (v) => encodeURIComponent(String(v || "").trim());

// ======================
// STAFF APIs
// ======================

// list with filters
export const listSchedules = (params = {}) =>
  api.get("/schedules", { params });

// IMPORTANT: use scheduleCode (e.g. SC-000016)
export const getSchedule = (code) =>
  api.get(`/schedules/${enc(code)}`);

export const createSchedule = (payload) =>
  api.post("/schedules", payload);

export const updateSchedule = (code, payload) =>
  api.patch(`/schedules/${enc(code)}`, payload);

export const deleteSchedule = (code) =>
  api.delete(`/schedules/${enc(code)}`);

// ======================
// EXTRA (Dashboard)
// ======================

export const todaySchedules = () =>
  api.get("/schedules/today");

export const upcomingSchedules = () =>
  api.get("/schedules/upcoming");

export const schedulesByPatientMrn = (mrn) =>
  api.get(`/schedules/patient/${enc(mrn)}`);

// ======================
// CANCEL FLOW
// ======================

export const cancelSchedule = (code, payload) =>
  api.patch(`/schedules/${enc(code)}/cancel`, payload);

export const approveCancel = (code, payload) =>
  api.patch(`/schedules/${enc(code)}/cancel/approve`, payload);

// ======================
// PATIENT APIs
// ======================

export const patientUpcoming = () =>
  patientApi.get("/schedules/upcoming");

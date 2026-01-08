import { api } from "./client";
import { patientApi } from "./patientApi";

// helper
const enc = (v) => encodeURIComponent(String(v || "").trim());

// ============ STAFF/ADMIN PATIENT MANAGEMENT ============

export const listPatients = (params = {}) => api.get("/patients", { params });

export const getPatient = (mrn) => api.get(`/patients/${enc(mrn)}`);


export const getPatientById = (id) => api.get(`/patients/id/${enc(id)}`);

export const createPatient = (payload) => api.post("/patients", payload);

export const updatePatient = (mrn, payload) => api.put(`/patients/${enc(mrn)}`, payload);

export const deletePatient = (mrn) => api.delete(`/patients/${enc(mrn)}`);

export const searchPatients = (query) =>
  api.get("/patients/search", { params: { q: query } });

// ============ PATIENT SELF SERVICE ============

export const patientSelf = () => patientApi.get("/patients/me");
export const updatePatientSelf = (payload) => patientApi.put("/patients/me", payload);
export const getPatientAppointments = () => patientApi.get("/patients/me/appointments");
export const getPatientDialysisRecords = () => patientApi.get("/patients/me/dialysis-records");
export const patientRegister = (payload) =>patientApi.post("/auth/patient-register", payload);
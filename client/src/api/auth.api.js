import { api } from "./client";
import { patientApi } from "./patientApi";

export const registerStaff = (payload) => api.post("/auth/register", payload);
export const loginStaff = (payload) => api.post("/auth/login", payload);
export const staffMe = () => api.get("/auth/me");

export const loginPatient = (payload) =>
  patientApi.post("/auth/patient-login", payload);

export const patientMe = () => patientApi.get("/patients/me");

import { api } from "./client";

const enc = (v) => encodeURIComponent(String(v || "").trim());

export const checkin = (code) => api.patch(`/lifecycle/${enc(code)}/checkin`);
export const startSession = (code) => api.patch(`/lifecycle/${enc(code)}/start`);
export const completeSession = (code) => api.patch(`/lifecycle/${enc(code)}/complete`);
export const markNoShow = (code) => api.patch(`/lifecycle/${enc(code)}/noshow`);

import { api } from "./client";

export const listReferrals = (params = {}) => api.get("/referrals", { params });
export const getReferral = (id) => api.get(`/referrals/${id}`);
export const createReferral = (payload) => api.post("/referrals", payload);
export const updateReferral = (id, payload) => api.put(`/referrals/${id}`, payload);
export const deleteReferral = (id) => api.delete(`/referrals/${id}`);

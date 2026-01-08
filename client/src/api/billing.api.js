import { api } from "./client";

export const listBills = (params = {}) => api.get("/billing", { params });
export const getBill = (code) => api.get(`/billing/${encodeURIComponent(code)}`);
export const createBill = (payload) => api.post("/billing", payload);
export const updateBill = (code, payload) => api.put(`/billing/${encodeURIComponent(code)}`, payload);
export const deleteBill = (code) => api.delete(`/billing/${encodeURIComponent(code)}`);

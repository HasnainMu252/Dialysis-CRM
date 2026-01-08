import { api } from "./client";

export const getSettings = () => api.get("/settings");
export const patchSettings = (payload) => api.patch("/settings", payload);

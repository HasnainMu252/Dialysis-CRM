import { api } from "./client";

// Only route exposed: POST /maintenance/release
export const releaseBed = (payload) => api.post("/maintenance/release", payload);

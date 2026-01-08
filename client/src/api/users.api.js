import { api } from "./client";

// Your backend returns an ARRAY from /auth/me
export const listAllUsers = () => api.get("/auth/me");

export const listNurses = async () => {
  const res = await listAllUsers();
  const arr = Array.isArray(res.data) ? res.data : [];
  return {
    data: {
      nurses: arr.filter((u) => u?.role === "Nurse" && u?.active !== false),
    },
  };
};

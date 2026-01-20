import { api } from "./client";

// List all users with optional filters
export const listUsers = (params = {}) => api.get("/users", { params });

// Get single user by userId (e.g., "usr-01")
export const getUser = (userId) => api.get(`/users/${userId}`);

// Update user by userId
export const updateUser = (userId, payload) => api.patch(`/users/${userId}`, payload);

// Toggle user active status
export const toggleUserActive = (userId) => api.patch(`/users/${userId}/toggle-active`);

// Delete user by userId
export const deleteUser = (userId) => api.delete(`/users/${userId}`);

// Admin creates staff users
export const registerStaff = (payload) => api.post("/auth/register", payload);

// Get nurses only (for dropdowns)
export const listNurses = async () => {
  const res = await listUsers({ role: "Nurse", active: true });
  return {
    data: {
      nurses: res.data?.users || [],
    },
  };
};

// Get staff by role (for shift assignment)
export const listStaffByRole = async (role) => {
  const res = await listUsers({ role, active: true });
  return res.data?.users || [];
};
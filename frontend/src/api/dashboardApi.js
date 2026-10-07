import apiClient from "./apiClient";

export const getAdminDashboard = async () => {
  const response = await apiClient.get("/dashboard/admin");

  return response.data;
};

export const getStaffDashboard = async () => {
  const response = await apiClient.get("/dashboard/staff");

  return response.data;
};
import apiClient from "./apiClient";

export const getStaff = async () => {
  const response = await apiClient.get("/staff");

  return response.data;
};

export const getStaffById = async (id) => {
  const response = await apiClient.get(`/staff/${id}`);

  return response.data;
};

export const createStaff = async (staffData) => {
  const response = await apiClient.post("/staff", staffData);

  return response.data;
};

export const updateStaff = async (staffId, staffData) => {
  const response = await apiClient.put(`/staff/${staffId}`, staffData);

  return response.data;
};

export const deleteStaff = async (staffId) => {
  const response = await apiClient.delete(`/staff/${staffId}`);

  return response.data;
};

export const staffDropdown = async () => {
  const response = await apiClient.get("/staff/dropdown");

  return response.data;
}
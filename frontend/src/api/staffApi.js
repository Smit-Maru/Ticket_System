import apiClient from "./apiClient";

export const getStaff = async () => {
  const response = await apiClient.get("/staff");

  return response.data;
};

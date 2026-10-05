import apiClient from "./apiClient";

export const loginUser = async (loginData) => {
  const response = await apiClient.post("/", loginData);

  return response.data;
};

export const signUpUser = async (data) => {
  const response = await apiClient.post("/signUp", data);

  return response.data;
};

export async function logout() {
  const response = await apiClient.post("/logout");
  return response.data;
}

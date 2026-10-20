import axios from "axios";

const hostname = window.location.hostname || "localhost";
const protocol = window.location.protocol;

const apiClient = axios.create({
  baseURL: `${protocol}//${hostname}:5000/api`,
  withCredentials: true,
});

let refreshRequest;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url;
    const isAuthRequest =
      url === "/" ||
      url === "/signUp" ||
      url === "/logout" ||
      url === "/refresh";

    if (
      originalRequest &&
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {

      // This prevents repeatedly retrying the same request.
      // originalRequest._retry is undefined but !undefined is true
      originalRequest._retry = true;

      try {
        if (!refreshRequest) {
          refreshRequest = apiClient
            .post("/refresh")
            .finally(() => {
              refreshRequest = undefined;
            });
        }

        await refreshRequest;

        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

import axios from "axios";

const hostname = window.location.hostname || "localhost";

const apiClient = axios.create({
  baseURL: `http://${hostname}:5000/api`,
  withCredentials: true,
});

export default apiClient;

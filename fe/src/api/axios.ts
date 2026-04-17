import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Response Interceptor for Error Handling
api.interceptors.response.use(
  (response) => {
    if (response.config.responseType === "blob") {
      return response;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState(); // ✅ correct
      logout();
      // window.location.href = "/";
    }
    return Promise.reject(error.response?.data || error.message);
  },
);

export default api;

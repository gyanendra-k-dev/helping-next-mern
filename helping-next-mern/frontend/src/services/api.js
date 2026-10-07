import axios from "axios";

// Central Axios instance for the Node.js / Express REST API.
// Set VITE_API_BASE_URL in .env, e.g.
// VITE_API_BASE_URL=http://localhost:5000/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    Accept: "application/json",
  },
});

// Attach the JWT (saved at login) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

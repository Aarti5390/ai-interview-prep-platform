import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',  // or `${import.meta.env.VITE_API_URL}/api`
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // must match the key used in login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
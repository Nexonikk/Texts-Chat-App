import axios from "axios";

const axiosBaseService = axios.create({
  baseURL: "https://texts-chat-app.onrender.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosBaseService.interceptors.request.use(
  (config) => {
    // You can add any request modifications here
    // For example, adding an auth token
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosBaseService.interceptors.response.use(
  (response) => {
    // You can add any response modifications here
    return response;
  },
  (error) => {
    // Handle errors here
    // For example, redirecting to login page on 401 errors
    if (error.response && error.response.status === 401) {
      // Redirect to login page or dispatch a logout action
    }
    return Promise.reject(error);
  }
);

export default axiosBaseService;

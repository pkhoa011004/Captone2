import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const apiInstance = axios.create({
  baseURL: API_URL,
});

const getStoredToken = () => {
  const rawUserInfo = localStorage.getItem("userInfo");
  if (rawUserInfo) {
    try {
      const parsed = JSON.parse(rawUserInfo);
      if (parsed?.accessToken) return parsed.accessToken;
      if (parsed?.token) return parsed.token;
    } catch (error) {
      // ignore malformed userInfo and fall back below
    }
  }

  const rawToken = localStorage.getItem("token");
  if (rawToken) return rawToken;

  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    try {
      const parsedUser = JSON.parse(rawUser);
      if (parsedUser?.accessToken) return parsedUser.accessToken;
      if (parsedUser?.token) return parsedUser.token;
    } catch (error) {
      // ignore malformed user and continue
    }
  }

  return null;
};

//Interceptor thêm header Authorization
apiInstance.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

//Interceptor xử lý lỗi
apiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (window.location.href.includes("/login")) {
      return Promise.reject(error);
    }
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiInstance;

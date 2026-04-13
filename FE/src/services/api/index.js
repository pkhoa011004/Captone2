import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const apiInstance = axios.create({
  baseURL: API_URL,
});

//Interceptor thêm header Authorization
apiInstance.interceptors.request.use(
  (config) => {
    const tokenFromStorage = localStorage.getItem("token");
    let tokenFromLegacyUserInfo = null;

    try {
      const parseUserInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
      tokenFromLegacyUserInfo = parseUserInfo?.accessToken || null;
    } catch (_error) {
      tokenFromLegacyUserInfo = null;
    }

    const token = tokenFromStorage || tokenFromLegacyUserInfo;
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
      localStorage.removeItem("user");
      localStorage.removeItem("userInfo");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiInstance;

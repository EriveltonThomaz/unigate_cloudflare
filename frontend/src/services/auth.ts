import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Importante para enviar cookies
});

authApi.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    console.log(
      "Auth Interceptor - Request: Access Token from localStorage:",
      accessToken
    );
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log("Auth Interceptor - Request: Setting Authorization header.");
    }
    return config;
  },
  (error) => {
    console.error("Auth Interceptor - Request Error:", error);
    return Promise.reject(error);
  }
);

authApi.interceptors.response.use(
  (response) => {
    console.log(
      "Auth Interceptor - Response:",
      response.status,
      response.config.url
    );
    return response;
  },
  async (error) => {
    console.error(
      "Auth Interceptor - Response Error:",
      error.response?.status,
      error.config.url
    );
    const originalRequest = error.config;
    // Se o erro for 401 (Unauthorized) e não for uma tentativa de refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log(
        "Auth Interceptor - 401 Unauthorized. Attempting token refresh."
      );
      try {
        const refreshToken = Cookies.get("refreshToken");
        console.log(
          "Auth Interceptor - Refresh Token from cookie:",
          refreshToken
        );
        if (!refreshToken) {
          // Se não houver refresh token, redireciona para o login
          console.log(
            "Auth Interceptor - No refresh token found. Redirecting to login."
          );
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Tenta renovar o token
        const res = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = res.data;
        console.log(
          "Auth Interceptor - Token refreshed. New Access Token:",
          access
        );
        localStorage.setItem("accessToken", access);

        // Tenta a requisição original novamente com o novo token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return authApi(originalRequest);
      } catch (refreshError) {
        // Se a renovação falhar, redireciona para o login
        console.error(
          "Auth Interceptor - Token refresh failed. Redirecting to login.",
          refreshError
        );
        localStorage.removeItem("accessToken");
        Cookies.remove("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default authApi;

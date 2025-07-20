import axios from 'axios';
import Cookies from 'js-cookie';

// Cria uma instância do axios com configurações padrão
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    // Tenta obter o token do cookie primeiro, depois do localStorage
    const token = Cookies.get('access_token') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Se for erro 401 (não autorizado), limpa o token e redireciona para login
    if (error.response && error.response.status === 401) {
      // Verifica se não estamos já na página de login para evitar loop
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
// Recomendo importar seu tipo User de um local central, como 'src/lib/definitions.ts'
// Para este exemplo, vou usar 'any' como no seu original.
// import { User } from '@/lib/definitions'; 

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Passo 1: O AuthProvider agora aceita a propriedade 'user' vinda do servidor.
export function AuthProvider({ children, user: initialUser }: { children: ReactNode, user: any | null }) {
  
  // Passo 2: O estado é inicializado com os dados recebidos do servidor.
  const [user, setUser] = useState<any | null>(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!initialUser);
  
  // O 'loading' agora se refere principalmente a ações como login, não ao carregamento inicial da página.
  const [loading, setLoading] = useState<boolean>(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  // Passo 3: O 'useEffect' para carregar o usuário foi COMPLETAMENTE REMOVIDO.
  // Esta era a fonte do conflito e não é mais necessária.
  /*
  useEffect(() => {
    // ... TODO O CÓDIGO AQUI FOI DELETADO ...
  }, []);
  */

  // As funções de login e logout permanecem, pois são ações iniciadas pelo CLIENTE.
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Tentamos ambas as rotas possíveis para autenticação
      let response;
      try {
        console.log("Tentando login com URL:", `${API_URL}/token/`);
        response = await axios.post(`${API_URL}/token/`, { email, password });
      } catch (err) {
        console.log("Primeira tentativa falhou, tentando rota alternativa:", `${API_URL}/auth/token/`);
        response = await axios.post(`${API_URL}/auth/token/`, { email, password });
      }
      
      const { access, refresh } = response.data;

      Cookies.set('access_token', access, { expires: 1 / 24 });
      Cookies.set('refresh_token', refresh, { expires: 7 });
      localStorage.setItem('access_token', access);

      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      const userResponse = await axios.get(`${API_URL}/auth/me/`);
      setUser(userResponse.data);
      setIsAuthenticated(true);
      // Salva o id, email e role do usuário no localStorage
      localStorage.setItem('user_id', String(userResponse.data.id));
      localStorage.setItem('user_email', userResponse.data.email);
      localStorage.setItem('user_role', userResponse.data.role || 'user');
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Limpa tokens dos cookies
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    // Limpa tokens do localStorage (padronizado)
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Remove header de autorização do axios
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    // Redireciona para a página de login
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
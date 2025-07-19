
// src/contexts/SidebarContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

/**
 * Provedor de Contexto para gerenciar o estado da barra lateral (sidebar).
 * 
 * Permite que componentes filhos acessem e modifiquem o estado de abertura/fechamento
 * da barra lateral, facilitando a responsividade e a interação do usuário.
 */
export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

/**
 * Hook personalizado para consumir o SidebarContext.
 * 
 * @returns {SidebarContextType} O contexto da barra lateral.
 * @throws {Error} Se usado fora de um SidebarProvider.
 */
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

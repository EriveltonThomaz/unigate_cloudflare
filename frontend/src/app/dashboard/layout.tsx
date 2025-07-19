// src/app/dashboard/layout.tsx
import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import Sidebar from '@/components/Layout/Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { getUserProfile } from '@/services/admin.service';

/**
 * Layout unificado para todas as páginas do dashboard.
 * 
 * Esta estrutura garante uma experiência de usuário consistente, com um cabeçalho
 * e uma barra de navegação lateral persistentes em todas as seções do painel de controle.
 * 
 * @param {object} props - As propriedades do componente.
 * @param {React.ReactNode} props.children - O conteúdo da página específica que será renderizada.
 * @returns {JSX.Element} O layout da área de administração.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userProfile = await getUserProfile();
  const userRole = userProfile?.role || 'user'; // Default para 'user' se não encontrar

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        {/* Barra de Navegação Lateral */}
        <Sidebar userRole={userRole} />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Cabeçalho Superior */}
          <AdminHeader />

          {/* Área de Conteúdo Principal */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/40 p-4">
            {children} {/* As páginas (ex: dashboard, users) serão renderizadas aqui */}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
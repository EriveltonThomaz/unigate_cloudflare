import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import Sidebar from '@/components/Layout/Sidebar';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { getUserProfile } from '@/services/admin.service';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const userProfile = await getUserProfile();
  const userRole = userProfile?.role || 'user';

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
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// src/components/admin/AdminHeader.tsx
'use client';

import React from 'react';
import UserMenu from './UserMenu';
import { Button } from '@/components/ui/button';
import { Menu, ArrowLeft } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useRouter } from 'next/navigation';
import ThemeToggleTailwind from '@/components/ui/ThemeToggleTailwind';

/**
 * Componente de cabeçalho para a área de administração.
 * 
 * Este cabeçalho é uma parte estática do layout administrativo e serve como
 * um contêiner para outros componentes, como o menu do usuário.
 */
const AdminHeader = () => {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between bg-card text-card-foreground px-6 shadow-sm">
      {/* Botão de voltar */}
      <div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => window.history.back()}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Menu do Usuário */}
      <div className="flex items-center gap-4">
        <ThemeToggleTailwind />
        <UserMenu />
      </div>
    </header>
  );
};

export default AdminHeader;

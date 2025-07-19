
// src/components/admin/UserMenu.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Assumindo que o contexto de autenticação existe
import { CircleUser, Settings, LogOut } from 'lucide-react';
import ProfileForm from '@/components/admin/profile/ProfileForm';
import UserFormModal from '@/components/admin/users/UserFormModal';
import Image from "next/image";

/**
 * Menu dropdown interativo do usuário.
 * 
 * Como um Componente de Cliente, ele gerencia seu próprio estado (menu aberto/fechado)
 * e lida com eventos do usuário, como cliques.
 * Fornece as opções de "Editar Perfil" e "Deslogar".
 */
const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const router = useRouter();
  const { logout, user } = useAuth(); // user do contexto
  const menuRef = useRef<HTMLDivElement>(null);

  // Lógica para fechar o menu ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // O redirecionamento será tratado pelo AuthContext ou pelo middleware
      // Mas podemos forçar para garantir.
      router.push('/login');
    } catch (error) {
      console.error('Falha ao fazer logout:', error);
      // Adicionar feedback para o usuário aqui, se necessário
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center">
        {user && (
          <span className="mr-3 text-sm font-medium">
            {user.first_name && user.last_name 
              ? `${user.first_name} ${user.last_name}` 
              : user.name || user.email}
          </span>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          {user && user.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.first_name || user.email} width={32} height={32} className="rounded-full" />
          ) : (
            <Image src="/images/iconeuniatende.png" alt="Avatar padrão" width={32} height={32} className="rounded-full" style={{ height: 'auto' }} />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 z-20 border border-border">
          <button 
            onClick={() => { setIsProfileModalOpen(true); setIsOpen(false); }}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Settings className="mr-2 h-4 w-4" />
            Editar Perfil
          </button>
        </div>
      )}

      {isProfileModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setIsProfileModalOpen(false)}>&times;</button>
            <UserFormModal 
              user={user} 
              onClose={() => setIsProfileModalOpen(false)} 
              onSave={() => setIsProfileModalOpen(false)} 
              title="Editar Perfil" 
              editableRole={false}
              isProfileEdit={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

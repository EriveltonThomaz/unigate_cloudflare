// src/app/admin/users/page.tsx
import React, { Suspense } from 'react';
import { getUsers } from '@/services/admin.service';
import UserPageClient from '@/components/admin/users/UserPageClient';
import { UserTableSkeleton } from '@/components/admin/users/UserTable';

/**
 * Página de Gerenciamento de Usuários.
 * 
 * Este é um Server Component que atua como ponto de entrada.
 * Ele busca a lista inicial de usuários e passa para o componente cliente
 * que gerencia a interatividade (modal, botões, etc.).
 * O uso de Suspense garante que um esqueleto de carregamento seja mostrado
 * enquanto os dados estão sendo buscados no servidor.
 */
export default async function AdminUsersPage() {
  // A busca de dados ocorre no servidor, antes da página ser enviada ao cliente.
  const initialUsers = await getUsers();

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<UserTableSkeleton />}>
        <UserPageClient initialUsers={initialUsers} />
      </Suspense>
    </div>
  );
}
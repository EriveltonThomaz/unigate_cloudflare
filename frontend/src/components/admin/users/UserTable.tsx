
// src/components/admin/users/UserTable.tsx
'use client';

import React from 'react';
import { User } from '@/lib/definitions';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from "next/image";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void; 
}

/**
 * Tabela para exibir a lista de usuários com ações.
 */
const UserTable = ({ users, onEdit, onDelete }: UserTableProps) => {
  return (
    <div className="overflow-x-auto rounded-lg bg-card dark:bg-gray-800 shadow-md">
      <table className="min-w-full divide-y divide-border dark:divide-gray-700">
        <thead className="bg-muted/50 dark:bg-gray-700/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-300">Nome</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-300">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground dark:text-gray-300">Cargo</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-gray-700 bg-card dark:bg-gray-800">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                    {user.avatarUrl ? (
                      <Image src={user.avatarUrl} alt={user.name} width={40} height={40} />
                    ) : (
                      <Image src="/images/iconeuniatende.png" alt="Avatar padrão" width={40} height={40} />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-foreground">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <Badge variant={user.isActive ? 'default' : 'destructive'}>{user.isActive ? 'Ativo' : 'Inativo'}</Badge>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{user.role}</td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <Button variant="ghost" size="icon" onClick={() => onEdit(user)} className="text-primary hover:text-primary-foreground mr-1">
                  <Edit className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(user.id)} className="text-destructive hover:text-destructive-foreground">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;

/**
 * Componente de esqueleto para a tabela de usuários.
 */
export const UserTableSkeleton = () => (
    <div className="overflow-x-auto rounded-lg bg-card dark:bg-gray-800 shadow-md">
        <div className="flex items-center justify-between p-4">
            <div className="h-10 w-1/4 rounded bg-muted dark:bg-gray-700 animate-pulse"></div>
            <div className="h-10 w-32 rounded bg-muted dark:bg-gray-700 animate-pulse"></div>
        </div>
        <div className="w-full h-96 rounded-b-lg bg-muted dark:bg-gray-700 animate-pulse"></div>
    </div>
);

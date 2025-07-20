// src/components/admin/users/UserPageClient.tsx
'use client';

import React, { useState } from 'react';
import { User } from '@/lib/definitions';
import { deleteUser } from '@/app/admin/users/actions';
import UserTable from './UserTable';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users, Shield, UserCheck, UserX, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import UserFormModal from './UserFormModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import UserDomainPermissionFormModal from './UserDomainPermissionFormModal';
import { useEffect } from 'react';
import { getUserDomainPermissions } from '@/services/admin.client';
import { deleteUserDomainPermission } from '@/services/admin.client';
import { getUserById } from '@/services/admin.client';

interface UserPageClientProps {
  initialUsers: User[];
}

/**
 * Componente de Cliente para a página de Gerenciamento de Usuários.
 * 
 * Gerencia todo o estado e interatividade da página, incluindo:
 * - A lista de usuários (que pode ser atualizada após adições/edições/exclusões).
 * - A visibilidade do modal de formulário.
 * - O usuário que está sendo editado atualmente.
 * - A visibilidade e o usuário do modal de confirmação de exclusão.
 */
const UserPageClient = ({ initialUsers }: UserPageClientProps) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [editingPermission, setEditingPermission] = useState<any | null>(null);
  const [deletingPermission, setDeletingPermission] = useState<any | null>(null);
  const [isDeletePermissionModalOpen, setIsDeletePermissionModalOpen] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>(() => ({}));

  // Estatísticas dos usuários
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const memberUsers = users.filter(u => u.role === 'user').length;

  // Buscar permissões ao montar e ao salvar/excluir
  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setIsLoadingPermissions(true);
    try {
      const data = await getUserDomainPermissions();
      setPermissions(data);
    } catch (e) {
      setPermissions([]);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  // Atualizar permissões ao salvar/excluir
  const handlePermissionSaved = () => {
    setIsPermissionModalOpen(false);
    fetchPermissions();
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const handleEditUser = async (user: User) => {
    // Buscar usuário atualizado do backend
    const freshUser = await getUserById(user.id);
    setEditingUser(freshUser);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      } catch (error) {
        // Erro silencioso
        // Adicionar feedback de erro para o usuário
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleEditPermission = (perm: any) => {
    setEditingPermission(perm);
    setIsPermissionModalOpen(true);
  };
  const handleDeletePermission = (perm: any) => {
    setDeletingPermission(perm);
    setIsDeletePermissionModalOpen(true);
  };
  const handleConfirmDeletePermission = async () => {
    if (deletingPermission) {
      try {
        await deleteUserDomainPermission(deletingPermission.id);
        fetchPermissions();
        setIsDeletePermissionModalOpen(false);
        setDeletingPermission(null);
      } catch (error) {
        alert('Erro ao excluir permissão.');
      }
    }
  };
  const handleCloseDeletePermissionModal = () => {
    setIsDeletePermissionModalOpen(false);
    setDeletingPermission(null);
  };

  // Função para atualizar a lista de usuários após uma operação de CRUD
  const onUserSaved = (savedUser: User) => {
    if (editingUser) {
      setUsers(users.map(u => u.id === savedUser.id ? savedUser : u));
    } else {
      setUsers([savedUser, ...users]);
    }
    handleCloseFormModal();
  };

  const handleUserSaved = async (savedUser: User) => {
    setIsFormModalOpen(false);

    // Atualizar a lista de usuários
    try {
      // Recarregar a lista completa de usuários para garantir que esteja atualizada
      const { getUsers } = await import('@/services/admin.client');
      const updatedUsers = await getUsers();

      // Se for um novo usuário, buscar os dados completos do usuário recém-criado
      if (!editingUser) {
        const { getUserById } = await import('@/services/admin.client');
        // Encontrar o usuário recém-adicionado na lista atualizada
        const newUser = updatedUsers.find(u => u.email === savedUser.email);
        if (newUser) {
          // Buscar dados completos do usuário, incluindo permissões
          const completeUserData = await getUserById(newUser.id);
          // Substituir o usuário na lista com os dados completos
          setUsers(updatedUsers.map(u => u.id === newUser.id ? completeUserData : u));
        } else {
          setUsers(updatedUsers);
        }
      } else {
        setUsers(updatedUsers);
      }
    } catch (error) {
      // Erro silencioso
    }

    fetchPermissions(); // Atualiza a tabela de permissões
  };

  // Função para alternar expandir/recolher grupo
  const toggleUserGroup = (user: string) => {
    setExpandedUsers(prev => ({ ...prev, [user]: !prev[user] }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">Gerencie os usuários da plataforma</p>
          </div>
        </div>
        <Button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="mr-2 h-5 w-5" />
          Adicionar Usuário
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Administradores</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{adminUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <UserX className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Inativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers - activeUsers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <UserTable users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />
      </div>

      {isFormModalOpen && (
        <UserFormModal
          user={editingUser}
          onClose={handleCloseFormModal}
          onSave={handleUserSaved}
        />
      )}

      {isDeleteModalOpen && userToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          itemType="usuário"
          itemName={userToDelete.name}
        />
      )}

      {isPermissionModalOpen && (
        <UserDomainPermissionFormModal
          isOpen={isPermissionModalOpen}
          onClose={() => {
            setIsPermissionModalOpen(false);
            setEditingPermission(null);
          }}
          onSave={handlePermissionSaved}
          initialData={editingPermission}
        />
      )}

      {isDeletePermissionModalOpen && deletingPermission && (
        <DeleteConfirmationModal
          isOpen={isDeletePermissionModalOpen}
          onClose={handleCloseDeletePermissionModal}
          onConfirm={handleConfirmDeletePermission}
          itemType="permissão"
          itemName={`${deletingPermission.user_name || deletingPermission.user} / ${deletingPermission.domain_name || deletingPermission.domain}`}
        />
      )}

      {/* Quadro de permissões */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 mt-8">
        <h2 className="text-xl font-bold mb-2 dark:text-white">Permissões de Usuário por Domínio</h2>
        {isLoadingPermissions ? (
          <div className="dark:text-gray-300">Carregando permissões...</div>
        ) : permissions.length === 0 ? (
          <div className="dark:text-gray-300">Nenhuma permissão cadastrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border dark:divide-gray-700 text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left dark:text-gray-300">Usuário</th>
                  <th className="px-4 py-2 text-left dark:text-gray-300">Domínio</th>
                  <th className="px-4 py-2 text-left dark:text-gray-300">Registro A/AAAA permitido</th>
                  <th className="px-4 py-2 text-left dark:text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Agrupamento por usuário com expand/collapse */}
                {Object.entries(
                  permissions.reduce((acc, perm) => {
                    const userKey = perm.user_name || perm.user;
                    if (!acc[userKey]) acc[userKey] = [];
                    acc[userKey].push(perm);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map(([user, perms]) => {
                  const isExpanded = expandedUsers[user] === true; // default: collapsed
                  return (
                    <React.Fragment key={user}>
                      <tr className="bg-muted/50 dark:bg-gray-700/50 cursor-pointer" onClick={() => toggleUserGroup(user)}>
                        <td className="px-4 py-2 font-bold flex items-center gap-1 dark:text-white" colSpan={4}>
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          {user}
                        </td>
                      </tr>
                      {isExpanded && perms.map((perm) => (
                        <tr key={perm.id} className="dark:bg-gray-800">
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 dark:text-gray-300">{perm.domain_name || perm.domain}</td>
                          <td className="px-4 py-2 dark:text-gray-300">{perm.allowed_a_record_name || perm.allowed_a_record}</td>
                          <td className="px-4 py-2 text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEditPermission(perm)} className="text-primary hover:text-primary-foreground mr-1">
                              <Edit className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeletePermission(perm)} className="text-destructive hover:text-destructive-foreground">
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPageClient;
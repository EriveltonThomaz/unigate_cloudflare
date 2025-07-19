"use client";

import React, { useState, useEffect } from 'react';
import type { Tenant } from '@/lib/definitions';
import TenantTable from './TenantTable';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import TenantFormModal from './TenantFormModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { deleteTenant } from '@/app/dashboard/tenants/actions';
import { syncDomainsWithCloudflare } from '@/services/admin.client';
import { Edit, Trash2, Loader2, Users, Building2, Globe, UserCheck } from 'lucide-react';
import ManageTenantManagersButton from './ManageTenantManagersButton';
import { getTenantsClient } from '@/services/admin.client';

interface TenantPageClientProps {
  initialTenants: Tenant[];
  userRole: string;
}

const TenantPageClient = ({ initialTenants, userRole, permissions = [] }: TenantPageClientProps & { permissions?: any[] }) => {
  const [tenants, setTenants] = useState<any[]>(initialTenants);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Função para filtrar tenants conforme permissões do usuário
  const filterTenants = (allTenants: any[]) => {
    if (userRole === 'admin') return allTenants;
    const allowedTenantIds = Array.from(new Set((permissions || []).map((p: any) => String(p.tenant))));
    return allTenants.filter(t => allowedTenantIds.includes(String(t.id)));
  };

  // Atualiza tenants sempre que initialTenants mudar (SSR -> CSR hydration)
  useEffect(() => {
    setTenants(filterTenants(initialTenants));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTenants]);

  useEffect(() => {
    let cancelled = false;
    const syncAllTenants = async () => {
      setSyncing(true);
      for (const tenant of tenants) {
        try {
          await syncDomainsWithCloudflare(tenant.id);
        } catch (e) {
          // Silencia erro para não travar o dashboard
        }
      }
      // Após sincronizar, busca os tenants atualizados via client
      try {
        const updatedTenants = await getTenantsClient();
        if (!cancelled) setTenants(updatedTenants); // Removido filtro extra
      } catch (e) {
        // Silencia erro
      }
      setSyncing(false);
    };
    if (tenants.length > 0) {
      syncAllTenants();
    }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddTenant = () => {
    setEditingTenant(null);
    setIsFormModalOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingTenant(null);
  };

  const handleDeleteTenant = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setTenantToDelete(tenant);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (tenantToDelete) {
      try {
        await deleteTenant(tenantToDelete.id);
        setTenants(tenants.filter(t => t.id !== tenantToDelete.id));
        setIsDeleteModalOpen(false);
        setTenantToDelete(null);
      } catch (error) {
        console.error('Falha ao excluir cliente:', error);
        // Adicionar feedback de erro para o usuário
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTenantToDelete(null);
  };

  const onTenantSaved = async (savedTenant: Tenant) => {
    const updatedTenants = await getTenantsClient();
    setTenants(updatedTenants); // Removido filtro extra
    handleCloseFormModal();
  };

  const handleSyncDomains = async (tenantId: string) => {
    try {
      await syncDomainsWithCloudflare(tenantId);
      // Atualiza a lista de tenants após sincronizar
      window.location.reload();
    } catch (error) {
      alert('Erro ao sincronizar domínios com a Cloudflare.');
    }
  };

  // Estatísticas
  const totalTenants = tenants.length;
  const totalDomains = tenants.reduce((acc, t) => acc + (Array.isArray(t.domains) ? t.domains.length : 0), 0);
  // Exemplo: clientes ativos (todos, pois não há campo isActive)
  const activeTenants = totalTenants;

  return (
    <div>
      {syncing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-40">
          <Loader2 className="animate-spin w-16 h-16 text-green-600 mb-4" />
          <span className="text-lg text-white font-semibold">Sincronizando domínios com a Cloudflare...</span>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Building2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Clientes</h1>
            <p className="text-muted-foreground">Gerencie os clientes da plataforma</p>
          </div>
        </div>
        {userRole === 'admin' && (
          <Button onClick={handleAddTenant} className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="mr-2 h-5 w-5" />
            Adicionar Cliente
          </Button>
        )}
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total de Clientes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTenants}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total de Domínios</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDomains}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Clientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeTenants}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {tenants.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            Nenhum cliente disponível para você.
          </div>
        ) : (
          <TenantTable tenants={tenants} onEdit={handleEditTenant} onDelete={handleDeleteTenant} userRole={userRole} />
        )}
      </div>

      {isFormModalOpen && (
        <TenantFormModal 
          tenant={editingTenant}
          onClose={handleCloseFormModal}
          onSave={onTenantSaved}
        />
      )}

      {isDeleteModalOpen && tenantToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          itemType="cliente"
          itemName={tenantToDelete.name}
        />
      )}
    </div>
  );
};

export default TenantPageClient;

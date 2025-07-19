import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tenant, User, TenantManager } from '@/lib/definitions';
import { getTenantManagersAction, addTenantManagerAction, removeTenantManagerAction, getUsersAction } from '@/app/dashboard/tenants/actions';
import { toast } from 'sonner';

interface ManageTenantManagersModalProps {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
}

const ManageTenantManagersModal = ({ tenant, isOpen, onClose }: ManageTenantManagersModalProps) => {
  const [managers, setManagers] = useState<TenantManager[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [managersResult, usersResult] = await Promise.all([
            getTenantManagersAction(tenant.id),
            getUsersAction(),
          ]);

          if (managersResult.success && managersResult.managers) {
            setManagers(managersResult.managers);
          } else {
            toast.error(managersResult.error || 'Erro ao carregar gerentes.');
          }

          if (usersResult.success && usersResult.users) {
            setAllUsers(usersResult.users);
          } else {
            toast.error(usersResult.error || 'Erro ao carregar usuários.');
          }
        } catch (error) {
          console.error('Erro ao carregar gerentes ou usuários:', error);
          toast.error('Erro ao carregar dados.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, tenant.id]);

  const handleAddManager = async () => {
    if (!selectedUserId) {
      toast.warning('Selecione um usuário para adicionar.');
      return;
    }
    try {
      const result = await addTenantManagerAction(tenant.id, selectedUserId);
      if (result.success) {
        const updatedManagersResult = await getTenantManagersAction(tenant.id);
        if (updatedManagersResult.success && updatedManagersResult.managers) {
          setManagers(updatedManagersResult.managers);
          setSelectedUserId('');
          toast.success('Gerente adicionado com sucesso!');
        } else {
          toast.error(updatedManagersResult.error || 'Erro ao recarregar gerentes.');
        }
      } else {
        toast.error(result.error || 'Erro ao adicionar gerente.');
      }
    } catch (error) {
      console.error('Erro ao adicionar gerente:', error);
      toast.error('Erro ao adicionar gerente.');
    }
  };

  const handleRemoveManager = async (userId: string) => {
    try {
      const result = await removeTenantManagerAction(tenant.id, userId);
      if (result.success) {
        const updatedManagersResult = await getTenantManagersAction(tenant.id);
        if (updatedManagersResult.success && updatedManagersResult.managers) {
          setManagers(updatedManagersResult.managers);
          toast.success('Gerente removido com sucesso!');
        } else {
          toast.error(updatedManagersResult.error || 'Erro ao recarregar gerentes.');
        }
      } else {
        toast.error(result.error || 'Erro ao remover gerente.');
      }
    } catch (error) {
      console.error('Erro ao remover gerente:', error);
      toast.error('Erro ao remover gerente.');
    }
  };

  const availableUsers = allUsers.filter(user => 
    !managers.some(manager => manager.id === user.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 text-foreground dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-white">Gerenciar Gerentes para {tenant.name}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <div className="grid gap-4 py-4">
            <div>
              <h3 className="mb-2 text-lg font-medium">Gerentes Atuais</h3>
              {managers.length === 0 ? (
                <p className="text-muted-foreground">Nenhum gerente atribuído ainda.</p>
              ) : (
                <ul className="space-y-2">
                  {managers.map(manager => (
                    <li key={manager.id} className="flex items-center justify-between rounded-md bg-muted dark:bg-gray-700 p-2">
                      <span className="text-foreground dark:text-white">{manager.full_name} ({manager.email})</span>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveManager(manager.id)}>
                        Remover
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <h3 className="mb-2 text-lg font-medium">Adicionar Novo Gerente</h3>
              <div className="flex items-end gap-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="user-select">Usuário</Label>
                  <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                    <SelectTrigger id="user-select">
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddManager} disabled={!selectedUserId || availableUsers.length === 0}>
                  Adicionar
                </Button>
              </div>
              {availableUsers.length === 0 && (
                <p className="mt-2 text-sm text-muted-foreground">Todos os usuários disponíveis já são gerentes ou não há usuários para adicionar.</p>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageTenantManagersModal;

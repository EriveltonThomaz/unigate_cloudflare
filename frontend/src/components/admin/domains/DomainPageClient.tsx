
// src/components/admin/domains/DomainPageClient.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Domain } from '@/lib/definitions';
import { deleteDomain } from '@/app/admin/domains/actions';
import { getDomainUniqueVisitors } from '@/services/admin.client';
import { Button } from '@/components/ui/button';
import { PlusCircle, Database, Globe, UserCheck, Activity } from 'lucide-react';
import DomainFormModal from './DomainFormModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';
import { getDomainsByTenantId, getTenantById, getUserById } from '@/services/admin.client';

interface DomainPageClientProps {
  tenantId: string;
  userRole: string;
  permissions?: any[]; // Adicionado para receber permissões do usuário
}

/**
 * Componente de Cliente para a página de Gerenciamento de Domínios.
 * 
 * Gerencia o estado da lista de domínios e a visibilidade do modal de formulário.
 */
const DomainPageClient = ({ tenantId, userRole, permissions: initialPermissions = [] }: DomainPageClientProps) => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [uniqueVisitors, setUniqueVisitors] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<{ name: string; email: string } | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState<Domain | null>(null);
  const [search, setSearch] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  // Remover: const actionMenuRef = useRef<HTMLDivElement>(null);
  const [isGerente, setIsGerente] = useState(false);
  const [permissions, setPermissions] = useState<any[]>(initialPermissions);
  // Debug: log domains e permissions
  useEffect(() => {
    if (!loading) {
      console.log('[DomainPageClient] domains:', domains.map(d => ({ id: d.id, name: d.name })));
      console.log('[DomainPageClient] permissions:', permissions.map(p => ({ domain: p.domain, domain_name: p.domain_name })));
    }
  }, [domains, permissions, loading]);

  // Busca perfil do usuário no client-side se permissions vier vazio
  useEffect(() => {
    if (permissions.length === 0) {
      fetch('/admin/profile/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
        .then(res => res.json())
        .then(profile => {
          if (profile && Array.isArray(profile.permissions)) {
            setPermissions(profile.permissions);
          }
        });
    }
  }, []);

  const filteredDomains = domains
    .filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
    .filter(d => {
      if (userRole === 'admin' || isGerente) return true;
      // Debug: log comparação
      const match = permissions.some(p => String(p.domain) === String(d.id));
      if (!match) {
        console.log(`[DomainPageClient] Usuário NÃO tem permissão para domínio:`, d.id, d.name);
      } else {
        console.log(`[DomainPageClient] Usuário TEM permissão para domínio:`, d.id, d.name);
      }
      return match;
    });
  const [tenantError, setTenantError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getDomainsByTenantId(tenantId)
      .then(async (domains) => {
        setDomains(domains);
        // Buscar visitantes únicos reais para cada domínio
        const visitors: Record<string, number> = {};
        await Promise.all(domains.map(async (d) => {
          try {
            if (d.cloudflare_zone_id) {
              visitors[d.id] = await getDomainUniqueVisitors(d.id);
            } else {
              visitors[d.id] = null;
            }
          } catch {
            visitors[d.id] = null;
          }
        }));
        setUniqueVisitors(visitors);
      })
      .finally(() => setLoading(false));
    getTenantById(tenantId)
      .then(t => {
        setTenant({ name: t.name, email: t.cloudflare_email });
        setTenantError(null);
        // Checa se o usuário é gerente deste tenant
        if (userRole === 'admin' || (t.managers && Array.isArray(t.managers) && t.managers.some((m: any) => m.email === (typeof window !== 'undefined' ? window.localStorage.getItem('user_email') : '')))) {
          setIsGerente(true);
        } else {
          setIsGerente(false);
        }
      })
      .catch((err) => {
        if (err?.message?.toLowerCase().includes('permissão')) {
          setTenantError('Você não tem permissão para acessar este cliente.');
        } else {
          setTenantError(null);
        }
        setTenant(null);
        setIsGerente(false);
      });
  }, [tenantId]);

  // Fecha o menu de ações ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Fecha o menu se clicar em qualquer lugar fora de um menu aberto
      // Só não fecha se clicar no botão do menu (⋮)
      const target = event.target as HTMLElement;
      if (!target.closest('[data-action-menu]')) {
        setActionMenuOpen(null);
      }
    }
    if (actionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [actionMenuOpen]);

  const handleAddDomain = () => {
    setActionMenuOpen(null);
    setEditingDomain(null);
    setIsFormModalOpen(true);
  };

  const handleEditDomain = (domain: Domain) => {
    setActionMenuOpen(null); // Fecha o menu de ações antes de abrir o modal
    setEditingDomain(domain);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingDomain(null);
  };

  const handleDeleteDomain = (domainId: string) => {
    const domain = domains.find(d => d.id === domainId);
    if (domain) {
      setActionMenuOpen(null); // Fecha o menu de ações antes de abrir o modal
      setDomainToDelete(domain);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (domainToDelete) {
      try {
        await deleteDomain(domainToDelete.id);
        setDomains(domains.filter(d => d.id !== domainToDelete.id));
        setIsDeleteModalOpen(false);
        setDomainToDelete(null);
      } catch (error) {
        console.error('Falha ao excluir domínio:', error);
        // Adicionar feedback de erro para o usuário
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDomainToDelete(null);
  };

  const onDomainSaved = (savedDomain: Domain) => {
    if (editingDomain) {
      setDomains(domains.map(d => d.id === savedDomain.id ? savedDomain : d));
    } else {
      setDomains([savedDomain, ...domains]);
    }
    handleCloseFormModal();
  };

  // Estatísticas
  const totalDomains = domains.length;
  const activeDomains = domains.filter(d => d.status === 'active').length;
  const totalVisitors = Object.values(uniqueVisitors).reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0);

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="mb-2 text-xs text-muted-foreground">Página inicial do cliente</div>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {loading ? 'Carregando cliente...' : tenantError ? tenantError : tenant ? `${tenant.name}${tenant.email ? ' (' + tenant.email + ')' : ''}` : 'Cliente não encontrado'}
          </h1>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Total de Domínios</p>
              <p className="text-2xl font-bold text-foreground">{totalDomains}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Domínios Ativos</p>
              <p className="text-2xl font-bold text-foreground">{activeDomains}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Visitantes Únicos</p>
              <p className="text-2xl font-bold text-foreground">{totalVisitors}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="ml-auto flex items-center gap-2">
          <input
            type="text"
            placeholder="Pesquisar por nome de domínio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-input bg-background rounded px-3 py-1 text-foreground"
          />
          <Button variant="outline">Buscar</Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDomains.map(domain => (
          <div key={domain.id} className="bg-card rounded-lg shadow p-4 flex flex-col gap-2 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-lg text-foreground">{domain.name}</div>
                <div className="text-sm text-muted-foreground">Status: <span className={domain.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>✓ {domain.status === 'active' ? 'Ativo' : domain.status}</span></div>
                <div className="text-sm text-muted-foreground">Visitantes únicos: <span className="font-semibold text-foreground">{uniqueVisitors[domain.id] !== undefined && uniqueVisitors[domain.id] !== null ? uniqueVisitors[domain.id] : '-'}</span></div>
                <div className="text-sm text-muted-foreground">Plano: Free</div>
              </div>
              <div
                className="relative inline-block text-left"
                data-action-menu={actionMenuOpen === domain.id ? 'open' : undefined}
              >
                <button
                  className="px-2 py-1 rounded hover:bg-muted text-foreground"
                  onClick={() => setActionMenuOpen(domain.id === actionMenuOpen ? null : domain.id)}
                  data-action-menu
                >
                  ⋮
                </button>
                {actionMenuOpen === domain.id && (
                  <div
                    className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-popover shadow-lg ring-1 ring-border focus:outline-none z-10"
                    data-action-menu
                  >
                    <div className="py-1">
                      <a href={`/admin/domains/${domain.id}/dnsrecords`} className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted">
                        Configurar DNS
                      </a>
                      <button className="block w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10" onClick={e => { e.stopPropagation(); handleDeleteDomain(domain.id); }}>
                        Remover da Cloudflare
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Modais permanecem iguais, mas título do modal de DNS será ajustado no DomainFormModal */}
      {isFormModalOpen && (
        <DomainFormModal
          domain={editingDomain}
          onClose={handleCloseFormModal}
          onSave={onDomainSaved}
          userRole={userRole}
          tenantId={tenantId}
          modalTitle="Registros DNS"
          hideTenantSelect
        />
      )}
      {isDeleteModalOpen && domainToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          itemType="domínio"
          itemName={domainToDelete.name}
        />
      )}
    </div>
  );
};

export default DomainPageClient;

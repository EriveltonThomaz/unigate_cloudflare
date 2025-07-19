
// src/components/admin/domains/DomainTable.tsx
'use client';

import React from 'react';
import type { Domain } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface DomainTableProps {
  domains: Domain[];
  onEdit: (domain: Domain) => void;
  onDelete: (domainId: string) => void;
  actionMenuOpen: string | null;
  setActionMenuOpen: (id: string | null) => void;
  actionMenuRef: React.RefObject<HTMLDivElement>;
}

/**
 * Tabela para exibir a lista de domínios.
 */
const DomainTable = ({ domains, onEdit, onDelete, actionMenuOpen, setActionMenuOpen, actionMenuRef }: DomainTableProps) => {
  return (
    <div className="overflow-x-auto rounded-lg bg-card shadow-md">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Domínio</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Visitantes únicos</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Plano</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {domains.map((domain) => (
            <tr key={domain.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">{domain.name}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                <span className={domain.status === 'active' ? 'text-green-600' : 'text-gray-400'}>
                  ✓ {domain.status === 'active' ? 'Ativo' : domain.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                {'-'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">Free</td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <div
                  className="relative inline-block text-left"
                  ref={actionMenuRef}
                  style={{overflow: 'visible', zIndex: 1000, maxWidth: '200px'}}
                >
                  <button
                    className="px-2 py-1 rounded hover:bg-muted"
                    onClick={() => setActionMenuOpen(domain.id === actionMenuOpen ? null : domain.id)}
                  >
                    ⋮
                  </button>
                  {actionMenuOpen === domain.id && (
                    <div
                      className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-30"
                      style={{overflow: 'visible', zIndex: 30, maxWidth: '200px'}}
                    >
                      <div className="py-1">
                        <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100" onClick={() => onEdit(domain)}>
                          Configurar DNS
                        </button>
                        <button className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-100" onClick={() => onDelete(domain.id)}>
                          Remover da Cloudflare
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DomainTable;

/**
 * Componente de esqueleto para a tabela de domínios.
 */
export const DomainTableSkeleton = () => (
    <div className="overflow-x-auto rounded-lg bg-card shadow-md">
        <div className="flex items-center justify-between p-4">
            <div className="h-10 w-1/4 rounded bg-muted animate-pulse"></div>
            <div className="h-10 w-32 rounded bg-muted animate-pulse"></div>
        </div>
        <div className="w-full h-96 rounded-b-lg bg-muted animate-pulse"></div>
    </div>
);

"use client";

import React from 'react';
import Link from 'next/link';
import { Tenant } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import ManageTenantManagersButton from './ManageTenantManagersButton';

interface TenantTableProps {
  tenants: Tenant[];
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenantId: string) => void;
  userRole: string;
}

const TenantTable = ({ tenants, onEdit, onDelete, userRole }: TenantTableProps) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nome do Cliente
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email Cloudflare
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Domínios
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Criado Em
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {tenants.map((tenant) => (
            <tr key={tenant.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                <Link href={`/dashboard/tenants/${tenant.id}/domains`} className="text-blue-600 hover:underline">
                  {tenant.name}
                </Link>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                {tenant.cloudflare_email}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                {Array.isArray(tenant.domains)
                  ? `${tenant.domains.length} domínio${tenant.domains.length === 1 ? '' : 's'}`
                  : '0 domínios'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                {tenant.createdAt && !isNaN(Date.parse(tenant.createdAt))
                  ? new Date(tenant.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  : 'Data não disponível'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <ManageTenantManagersButton tenant={tenant} userRole={userRole} />
                {userRole === 'admin' && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(tenant)} className="text-primary hover:text-primary-foreground">
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(tenant.id)} className="text-destructive hover:text-destructive-foreground">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TenantTable;

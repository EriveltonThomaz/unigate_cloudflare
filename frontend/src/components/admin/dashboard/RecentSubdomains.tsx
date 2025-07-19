// src/components/admin/dashboard/RecentSubdomains.tsx
import React from 'react';
import Link from 'next/link';
import { getRecentSubdomains } from '@/services/admin.service';
import { Badge } from '@/components/ui/badge'; // Supondo um componente de Badge para UI

/**
 * Server Component assíncrono que busca e exibe a lista de subdomínios recentes.
 */
export async function RecentSubdomains() {
  const recentSubdomains: any[] = await getRecentSubdomains(); // Assuming RecentSubdomain type is removed

  return (
    <div className="rounded-lg bg-card p-4 shadow-md">
      <h2 className="mb-4 text-lg font-semibold">Subdomínios Recentes</h2>
      {recentSubdomains.length === 0 ? (
        <p className="text-muted-foreground">Nenhum subdomínio recente encontrado.</p>
      ) : (
        <div className="flow-root">
          <ul role="list" className="-my-4 divide-y divide-border">
            {recentSubdomains.map((subdomain) => {
              // Corrige a exibição para evitar duplicação do domínio
              let displayName = subdomain.name;
              let fullUrl = '';
              if (displayName.endsWith('.' + subdomain.domain_name)) {
                // Já está completo
                fullUrl = `https://${displayName}`;
              } else {
                fullUrl = `https://${displayName}.${subdomain.domain_name}`;
                displayName = `${displayName}.${subdomain.domain_name}`;
              }
              return (
                <li key={subdomain.id} className="flex items-center space-x-4 py-4">
                  <div className="min-w-0 flex-1">
                    <Link href={fullUrl} className="text-sm font-medium text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      {displayName}
                    </Link>
                    <p className="text-sm text-muted-foreground">Tipo: {subdomain.record_type}</p>
                  </div>
                  <Badge variant="secondary">{subdomain.record_type}</Badge>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Componente de esqueleto para a lista de subdomínios recentes.
 */
export const RecentSubdomainsSkeleton = () => (
  <div className="rounded-lg bg-card p-4 shadow-md">
    <div className="flow-root">
      <ul role="list" className="-my-4 animate-pulse divide-y divide-border">
        {[...Array(5)].map((_, i) => (
          <li key={i} className="flex items-center space-x-4 py-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 h-4 w-3/4 rounded bg-muted"></div>
              <div className="h-4 w-1/2 rounded bg-muted-foreground"></div>
            </div>
            <div className="h-6 w-16 rounded-full bg-muted"></div>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
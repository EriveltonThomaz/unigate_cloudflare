// src/app/admin/domains/page.tsx
import React, { Suspense } from 'react';
import { getDomains, getUserProfile } from '@/services/admin.service';
import DomainPageClient from '@/components/admin/domains/DomainPageClient';
import { DomainTableSkeleton } from '@/components/admin/domains/DomainTable';

/**
 * Página de Gerenciamento de Domínios.
 * 
 * Server Component que busca a lista inicial de domínios e renderiza o 
 * componente cliente responsável pela interatividade da página, 
 * utilizando Suspense para um carregamento progressivo.
 */
export default async function AdminDomainsPage() {
  const [initialDomains, userProfile] = await Promise.all([
    getDomains(),
    getUserProfile(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<DomainTableSkeleton />}>
        <DomainPageClient initialDomains={initialDomains} userRole={userProfile.role} />
      </Suspense>
    </div>
  );
}
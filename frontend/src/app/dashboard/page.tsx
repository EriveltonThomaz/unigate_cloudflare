// src/app/admin/dashboard/page.tsx
import React, { Suspense } from 'react';

// CORREÇÃO: Garante que todos os componentes são importados usando a sintaxe de
// importação nomeada (com chaves), que corresponde a como eles são exportados.
import { StatsCards, StatsCardsSkeleton } from '@/components/admin/dashboard/StatsCards';
import { RecentSubdomains, RecentSubdomainsSkeleton } from '@/components/admin/dashboard/RecentSubdomains';

/**
 * Página principal do Dashboard de Administração.
 * * Esta página funciona como um orquestrador, utilizando o padrão de Server Components
 * e Suspense para carregar e exibir diferentes widgets de dados de forma assíncrona.
 * Isso resulta em um carregamento percebido mais rápido para o usuário.
 */
export default function AdminDashboardPage() {
  return (
    // Removido 'container mx-auto' para permitir que o layout principal controle a largura,
    // adicionando padding para manter o espaçamento.
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground">
        Dashboard
      </h1>
      
      {/* Seção de Estatísticas Principais */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        {/* @ts-expect-error Async Server Component é uma feature do React/Next.js que o TypeScript ainda está alcançando. */}
        <StatsCards />
      </Suspense>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Seção de Subdomínios Recentes */}
        <div className="lg:col-span-2">
          <Suspense fallback={<RecentSubdomainsSkeleton />}>
            {/* @ts-expect-error Async Server Component */}
            <RecentSubdomains />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
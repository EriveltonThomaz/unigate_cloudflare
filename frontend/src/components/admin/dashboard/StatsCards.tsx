// src/components/admin/dashboard/StatsCards.tsx
import React from 'react';
import { Users, Globe, Key } from 'lucide-react';
import { getDashboardStats, getUserProfile } from '@/services/admin.service'; // Import getUserProfile
import { DashboardStats as DashboardStatsType } from '@/lib/definitions'; // Import from definitions

/**
 * Interface para os dados de estatísticas esperados da API.
 */
interface DashboardStats {
  totalTenants: number;
  totalDomains: number;
  totalUsers: number;
}

/**
 * Props para o componente StatCard.
 */
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
}

/**
 * Componente de Card de Estatística individual e reutilizável.
 */
const StatCard = ({ title, value, icon: Icon }: StatCardProps) => (
  <div className="rounded-lg bg-card p-6 shadow-md">
    <div className="flex items-center">
      <div className="rounded-full bg-primary/10 p-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  </div>
);

/**
 * Server Component assíncrono que busca e exibe os cards de estatísticas.
 * Este componente é executado no servidor.
 */
export async function StatsCards() {
  // Busca os dados diretamente no servidor.
  // Esta chamada só acontece no lado do servidor, nunca no navegador.
  const stats: DashboardStatsType = await getDashboardStats();
  const userProfile = await getUserProfile(); // Fetch user profile

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard title="Total de Clientes" value={stats.totalTenants} icon={Users} />
      <StatCard title="Domínios Gerenciados" value={stats.totalDomains} icon={Globe} />
      {userProfile.role === 'admin' && ( // Conditionally render for admin
        <StatCard title="Usuários na Plataforma" value={stats.totalUsers} icon={Key} />
      )}
    </div>
  );
}

/**
 * Componente de esqueleto (skeleton) para os cards de estatísticas.
 * É exibido via React.Suspense enquanto os dados reais estão sendo carregados.
 */
export const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="rounded-lg bg-card p-6 shadow-md">
        <div className="flex animate-pulse items-center">
          <div className="rounded-full bg-muted p-3">
            <div className="h-6 w-6 rounded-full bg-muted-foreground/30"></div>
          </div>
          <div className="ml-4 flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted"></div>
            <div className="h-6 w-1/2 rounded bg-muted-foreground/30"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);
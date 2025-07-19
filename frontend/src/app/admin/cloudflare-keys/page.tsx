// src/app/admin/cloudflare-keys/page.tsx
import React, { Suspense } from 'react';
import { getCloudflareKeys } from '@/services/admin.service';
import CloudflareKeysPageClient from '@/components/admin/cloudflare-keys/CloudflareKeysPageClient';
import { CloudflareKeysTableSkeleton } from '@/components/admin/cloudflare-keys/CloudflareKeysTable';

/**
 * Página de Gerenciamento de Chaves da API Cloudflare.
 * 
 * Server Component que busca os dados iniciais e delega a interatividade
 * para um componente cliente, com Suspense para o carregamento.
 */
export default async function AdminCloudflareKeysPage() {
  const initialKeys = await getCloudflareKeys();

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<CloudflareKeysTableSkeleton />}>
        <CloudflareKeysPageClient initialKeys={initialKeys} />
      </Suspense>
    </div>
  );
}
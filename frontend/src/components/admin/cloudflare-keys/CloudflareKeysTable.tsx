
// src/components/admin/cloudflare-keys/CloudflareKeysTable.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { CloudflareKey } from '@/lib/definitions';

interface CloudflareKeysTableProps {
  keys: CloudflareKey[];
  onEdit: (key: CloudflareKey) => void;
  onDelete: (keyId: string) => void;
}

/**
 * Tabela para exibir as chaves da API Cloudflare.
 */
const CloudflareKeysTable = ({ keys, onEdit, onDelete }: CloudflareKeysTableProps) => {
  const maskApiKey = (key: string | undefined) => {
    if (typeof key === 'string' && key.length > 4) {
      return `••••••••${key.slice(-4)}`;
    }
    return '••••••••'; // Retorna uma máscara padrão se a chave for inválida ou muito curta
  };

  return (
    <div className="overflow-x-auto rounded-lg bg-card shadow-md">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Email Associado</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Chave API</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Cliente</th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {keys.map((key) => (
            <tr key={key.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">{key.email}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground font-mono">{maskApiKey(key.apiKey)}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">{key.tenantName}</td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <Button variant="ghost" size="sm" onClick={() => onEdit(key)} className="mr-2">
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(key.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CloudflareKeysTable;

/**
 * Componente de esqueleto para a tabela de chaves.
 */
export const CloudflareKeysTableSkeleton = () => (
    <div className="overflow-x-auto rounded-lg bg-card shadow-md">
        <div className="flex items-center justify-between p-4">
            <div className="h-10 w-1/4 rounded bg-muted animate-pulse"></div>
            <div className="h-10 w-32 rounded bg-muted animate-pulse"></div>
        </div>
        <div className="w-full h-96 rounded-b-lg bg-muted animate-pulse"></div>
    </div>
);

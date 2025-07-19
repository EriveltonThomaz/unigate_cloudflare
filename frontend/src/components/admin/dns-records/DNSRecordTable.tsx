import React from 'react';
import { DNSRecord } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface DNSRecordTableProps {
  dnsRecords: DNSRecord[];
  onEdit: (record: DNSRecord) => void;
  onDelete: (recordId: string) => void;
  userRole: string;
}

/**
 * Componente de tabela para exibir registros DNS.
 * 
 * Implementa as restrições de permissões:
 * - Usuários comuns podem apenas listar registros A e AAAA
 * - Usuários comuns podem gerenciar (criar, editar, excluir) registros CNAME
 * - Administradores podem gerenciar todos os tipos de registros
 */
const DNSRecordTable = ({ dnsRecords, onEdit, onDelete, userRole }: DNSRecordTableProps) => {
  const canManageRecord = (record: DNSRecord) => {
    if (userRole === 'admin') return true;
    return record.recordType === 'CNAME';
  };

  const canViewRecord = (record: DNSRecord) => {
    if (userRole === 'admin') return true;
    return ['A', 'AAAA', 'CNAME'].includes(record.recordType);
  };

  const filteredRecords = dnsRecords.filter(canViewRecord);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
              Nome
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
              Conteúdo
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
              Domínio
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
              TTL
            </th>
            <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
              Proxied
            </th>
            <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {filteredRecords.map((record) => (
            <tr key={record.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                {record.name}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  record.recordType === 'CNAME' ? 'bg-blue-100 text-blue-800' :
                  record.recordType === 'A' ? 'bg-green-100 text-green-800' :
                  record.recordType === 'AAAA' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {record.recordType}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                {record.content}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                {record.domainName}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                {record.ttl}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  record.proxied ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {record.proxied ? 'Sim' : 'Não'}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                {canManageRecord(record) && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(record)} aria-label="Editar registro DNS" className="mr-1">
                      <Edit className="h-5 w-5 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(record.id)} aria-label="Excluir registro DNS">
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredRecords.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          Nenhum registro DNS encontrado.
        </div>
      )}
    </div>
  );
};

export default DNSRecordTable;

export const DNSRecordTableSkeleton = () => (
  <div className="overflow-hidden rounded-lg border border-border bg-card">
    <div className="animate-pulse">
      <div className="bg-muted/50 px-6 py-3">
        <div className="h-4 w-24 bg-muted rounded"></div>
      </div>
      <div className="divide-y divide-border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex space-x-4">
              <div className="h-4 w-32 bg-muted rounded"></div>
              <div className="h-4 w-16 bg-muted rounded"></div>
              <div className="h-4 w-48 bg-muted rounded"></div>
              <div className="h-4 w-24 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
); 
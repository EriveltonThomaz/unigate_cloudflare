"use client";
import React, { useEffect, useState } from 'react';
import { getSubdomainsByDomainId } from '@/services/admin.client';
import { UserTableSkeleton } from '@/components/admin/users/UserTable';
import { Button } from '@/components/ui/button';
import { Search, Edit2, Trash2, PlusCircle } from 'lucide-react';

export default function DomainSubdomainsPage({ params }: { params: { tenantId: string, domainId: string } }) {
  const { tenantId, domainId } = params;
  const [subdomains, setSubdomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddSubdomainModalOpen, setIsAddSubdomainModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtro de busca
  const filteredSubdomains = subdomains.filter(subdomain =>
    subdomain.name.toLowerCase().includes(search.toLowerCase()) ||
    subdomain.content.toLowerCase().includes(search.toLowerCase())
  );
  // Paginação
  const totalPages = Math.ceil(filteredSubdomains.length / pageSize);
  const paginatedSubdomains = filteredSubdomains.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Badge para tipo de registro
  const typeBadge = (type: string) => {
    const map: Record<string, string> = {
      CNAME: 'bg-green-200 text-green-800',
      A: 'bg-blue-100 text-blue-800',
      AAAA: 'bg-blue-200 text-blue-900',
      MX: 'bg-yellow-100 text-yellow-800',
      TXT: 'bg-gray-100 text-gray-700',
    };
    const badge = map[type?.toUpperCase()] || 'bg-gray-100 text-gray-700';
    return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>{type}</span>;
  };

  useEffect(() => {
    setLoading(true);
    getSubdomainsByDomainId(domainId)
      .then(data => setSubdomains(data))
      .finally(() => setLoading(false));
  }, [domainId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2 flex-wrap">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsAddSubdomainModalOpen(true)}
            className="rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 shadow-md transition flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Adicionar Subdomínio CNAME
          </button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar subdomínio ou valor..."
              className="w-full rounded-full border border-gray-300 px-4 py-2 pl-10 focus:ring-2 focus:ring-green-500 bg-white/80"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
      {loading ? (
        <UserTableSkeleton />
      ) : (
        <div className="bg-card p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Lista de Subdomínios</h2>
          {paginatedSubdomains.length === 0 ? (
            <p>Nenhum subdomínio encontrado para este domínio.</p>
          ) : (
            <table className="min-w-full divide-y divide-border text-sm md:text-base">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Nome</th>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Valor</th>
                  <th className="px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubdomains.map(subdomain => (
                  <tr key={subdomain.id} className="border-b">
                    <td className="px-4 py-2">{subdomain.name}</td>
                    <td className="px-4 py-2">{typeBadge(subdomain.record_type)}</td>
                    <td className="px-4 py-2">{subdomain.content}</td>
                    <td className="px-4 py-2 flex flex-wrap gap-2 items-center">
                      {/* Futuramente: editar/excluir */}
                      <button
                        className="text-yellow-600 hover:bg-yellow-50 rounded-full p-2 transition"
                        title="Editar Subdomínio"
                        disabled
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        className="text-red-600 hover:bg-red-50 rounded-full p-2 transition"
                        title="Excluir Subdomínio"
                        disabled
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-full px-4 py-2 bg-green-100 text-green-800 font-semibold disabled:opacity-50"
              >Anterior</button>
              <span className="px-2 py-2 text-gray-700">Página {currentPage} de {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full px-4 py-2 bg-green-100 text-green-800 font-semibold disabled:opacity-50"
              >Próxima</button>
            </div>
          )}
        </div>
      )}
      {/* Placeholder for Add Subdomain Modal */}
      {isAddSubdomainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Adicionar Novo Subdomínio CNAME</h2>
            <p>Formulário de adição de subdomínio virá aqui.</p>
            <Button onClick={() => setIsAddSubdomainModalOpen(false)} className="mt-4">Fechar</Button>
          </div>
        </div>
      )}
    </div>
  );
}

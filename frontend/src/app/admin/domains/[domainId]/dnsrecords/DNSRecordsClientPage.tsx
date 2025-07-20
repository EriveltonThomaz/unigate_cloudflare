"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getDomainById } from '@/services/admin.client';
import { getCustomDNSRecords } from '@/services/admin.client';
import { getUserDomainPermissionByUserAndDomain } from '@/services/admin.client';
import { useAuth } from '@/contexts/AuthContext';
// Importando api.js em vez de api.ts
import api from '@/services/api.js';
import DeleteConfirmationModal from '@/components/Dashboard/Domains/DeleteConfirmationModal';
import DNSRecordFormModal from '@/components/admin/dns-records/DNSRecordFormModal';
import { formatDNSRecords } from '@/components/admin/dns-records/DNSRecordUtils';
import { Button } from '@/components/ui/button';
import { PlusCircle, Database, Globe, Shield, Activity, Edit, Trash2 } from 'lucide-react';

// Tipo local para resposta do backend
interface LocalDNSRecord {
  id: number;
  domain: number;
  name: string;
  record_type: string;
  content: string;
  proxied: boolean;
  cloudflare_record_id?: string;
}

interface DNSRecordsClientPageProps {
  userRole: string;
}

// Função para converter DNSRecord local para DNSRecord do sistema
const convertToSystemDNSRecord = (record: LocalDNSRecord) => ({
  id: String(record.id),
  name: record.name,
  recordType: record.record_type,
  content: record.content,
  ttl: 3600, // valor padrão
  proxied: record.proxied,
  domainId: String(record.domain),
  domainName: '', // será preenchido pelo modal
  createdAt: new Date().toISOString(),
});

export default function DNSRecordsClientPage({ userRole }: DNSRecordsClientPageProps) {
  const { domainId } = useParams();
  const { user } = useAuth();
  const [dnsRecords, setDnsRecords] = useState<Array<any>>([]); // Permite registros flexíveis vindos do backend
  const [domainName, setDomainName] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LocalDNSRecord | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<LocalDNSRecord | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'A' | 'CNAME'>('ALL');
  const [allowedARecord, setAllowedARecord] = useState<any | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Estatísticas dos registros DNS
  const totalRecords = dnsRecords.length;
  const proxiedRecords = dnsRecords.filter(r => r.proxied).length;
  const cnameRecords = dnsRecords.filter(r => r.record_type === 'CNAME' || r.recordType === 'CNAME').length;
  const aRecords = dnsRecords.filter(r => r.record_type === 'A' || r.recordType === 'A').length;

  const fetchDNSRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      let records: any[] = [];
      if (userRole === 'admin') {
        const response = await api.get(`/admin/domains/${domainId}/dns-records/`);
        records = response.data.map((record: LocalDNSRecord) => ({
          id: String(record.id),
          name: record.name,
          recordType: record.record_type,
          content: record.content,
          ttl: 3600, // valor padrão
          proxied: record.proxied,
          domainId: String(domainId),
          domainName: '',
          createdAt: '',
        }));
      } else {
        records = await getCustomDNSRecords(domainId as string);
      }
      // Formatar os registros DNS para exibir apenas o subdomínio
      const formattedRecords = formatDNSRecords(records, domainName);
      setDnsRecords(formattedRecords);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao carregar registros DNS.');
    } finally {
      setLoading(false);
    }
  };

  // Buscar allowed_a_record para usuário comum
  useEffect(() => {
    if (userRole !== 'admin' && user && domainId) {
      getUserDomainPermissionByUserAndDomain(Number(user.id), Number(domainId))
        .then(perm => {
          setAllowedARecord(perm && perm.allowed_a_record ? perm.allowed_a_record : null);
        })
        .catch(() => setAllowedARecord(null));
    }
  }, [userRole, user, domainId]);

  useEffect(() => {
    if (domainId) {
      getDomainById(domainId as string)
        .then(domain => {
          setDomainName(domain.name);
        })
        .catch(err => {
          setError(err.message || 'Erro ao buscar nome do domínio.');
          setLoading(false);
        });
      fetchDNSRecords();
    }
  }, [domainId]);

  const handleAddClick = () => {
    setEditingRecord(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (record: LocalDNSRecord) => {
    setEditingRecord(record);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (record: LocalDNSRecord) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    setEditingRecord(undefined);
    fetchDNSRecords();
  };

  const handleFormCancel = () => {
    setIsFormModalOpen(false);
    setEditingRecord(undefined);
  };

  const handleDeleteConfirm = async () => {
    if (recordToDelete) {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/dnsrecords/${recordToDelete.id}/`);
        setShowDeleteModal(false);
        setRecordToDelete(undefined);
        fetchDNSRecords();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Erro ao excluir registro DNS.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <div className="text-center p-4 text-foreground">Carregando registros DNS...</div>;
  if (error) return <div className="text-center p-4 text-destructive">Erro: {error}</div>;

  // Filtro visual
  let filteredRecords: Array<any> = [];
  filteredRecords = dnsRecords.filter(record => {
    if (filterType === 'ALL') return true;
    // Verificar tanto record_type quanto recordType (dependendo de onde vem o registro)
    const recordType = record.record_type || record.recordType;
    return recordType === filterType;
  });

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Registros DNS</h1>
            <p className="text-muted-foreground">Domínio: {domainName}</p>
          </div>
        </div>
        <Button onClick={handleAddClick} className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
          <PlusCircle className="mr-2 h-5 w-5" />
          Adicionar Registro DNS
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Total de Registros</p>
              <p className="text-2xl font-bold text-foreground">{totalRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Protegidos</p>
              <p className="text-2xl font-bold text-foreground">{proxiedRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Registros CNAME</p>
              <p className="text-2xl font-bold text-foreground">{cnameRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Registros A</p>
              <p className="text-2xl font-bold text-foreground">{aRecords}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-foreground">Filtrar:</span>
        <button onClick={() => setFilterType('ALL')} className={`px-2 py-1 rounded ${filterType === 'ALL' ? 'bg-green-200 dark:bg-green-800' : 'bg-muted hover:bg-muted/80'}`}>Todos</button>
        <button onClick={() => setFilterType('A')} className={`px-2 py-1 rounded ${filterType === 'A' ? 'bg-green-200 dark:bg-green-800' : 'bg-muted hover:bg-muted/80'}`}>A</button>
        <button onClick={() => setFilterType('CNAME')} className={`px-2 py-1 rounded ${filterType === 'CNAME' ? 'bg-green-200 dark:bg-green-800' : 'bg-muted hover:bg-muted/80'}`}>CNAME</button>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-border">
        <table className="min-w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Nome</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Tipo</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Conteúdo</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Proxied</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 px-4 text-center text-muted-foreground">
                  Nenhum registro DNS encontrado.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-muted/50">
                  <td className="py-3 px-4 text-sm font-medium text-foreground">
                    {(record.record_type === 'CNAME' || record.recordType === 'CNAME') && 
                     record.name && domainName && record.name.endsWith(domainName)
                      ? record.name.substring(0, record.name.length - domainName.length - 1)
                      : record.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      (record.record_type === 'CNAME' || record.recordType === 'CNAME') ? 'bg-blue-100 text-blue-800' :
                      (record.record_type === 'A' || record.recordType === 'A') ? 'bg-green-100 text-green-800' :
                      (record.record_type === 'AAAA' || record.recordType === 'AAAA') ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.record_type || record.recordType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{record.content}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      record.proxied ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-muted text-muted-foreground'
                    }`}>
                      {record.proxied ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(record)}
                        className="p-2 rounded hover:bg-muted focus:outline-none"
                        aria-label="Editar registro DNS"
                      >
                        <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(record)}
                        className="p-2 rounded hover:bg-muted focus:outline-none"
                        aria-label="Excluir registro DNS"
                      >
                        <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFormModalOpen && (
        <DNSRecordFormModal
          record={editingRecord ? convertToSystemDNSRecord(editingRecord) : null}
          onClose={handleFormCancel}
          onSave={handleFormSuccess}
          userRole={userRole}
          domainId={domainId as string}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={recordToDelete?.name || 'este registro DNS'}
      />
    </div>
  );
}

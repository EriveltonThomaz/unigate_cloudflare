"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getDomainById } from '@/services/admin.client';
import { getCustomDNSRecords } from '@/services/admin.client';
import { getUserDomainPermissionByUserAndDomain } from '@/services/admin.client';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
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

  if (loading) return <div className="text-center p-4">Carregando registros DNS...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;

  // Filtro visual
  let filteredRecords: Array<any> = [];
  filteredRecords = dnsRecords.filter(record => {
    if (filterType === 'ALL') return true;
    // Verificar tanto record_type quanto recordType (dependendo de onde vem o registro)
    const recordType = record.record_type || record.recordType;
    return recordType === filterType;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Database className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Registros DNS</h1>
            <p className="text-muted-foreground">Domínio: {domainName}</p>
          </div>
        </div>
        <Button onClick={handleAddClick} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="mr-2 h-5 w-5" />
          Adicionar Registro DNS
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total de Registros</p>
              <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Protegidos</p>
              <p className="text-2xl font-bold text-gray-900">{proxiedRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Registros CNAME</p>
              <p className="text-2xl font-bold text-gray-900">{cnameRecords}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Registros A</p>
              <p className="text-2xl font-bold text-gray-900">{aRecords}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">Filtrar:</span>
        <button onClick={() => setFilterType('ALL')} className={`px-2 py-1 rounded ${filterType === 'ALL' ? 'bg-green-200' : 'bg-gray-100'}`}>Todos</button>
        <button onClick={() => setFilterType('A')} className={`px-2 py-1 rounded ${filterType === 'A' ? 'bg-green-200' : 'bg-gray-100'}`}>A</button>
        <button onClick={() => setFilterType('CNAME')} className={`px-2 py-1 rounded ${filterType === 'CNAME' ? 'bg-green-200' : 'bg-gray-100'}`}>CNAME</button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Nome</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Tipo</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Conteúdo</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Proxied</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 px-4 text-center text-gray-500">
                  Nenhum registro DNS encontrado.
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {(record.record_type === 'CNAME' || record.recordType === 'CNAME') && 
                     record.name && domainName && record.name.endsWith(domainName)
                      ? record.name.substring(0, record.name.length - domainName.length - 1)
                      : record.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      (record.record_type === 'CNAME' || record.recordType === 'CNAME') ? 'bg-blue-100 text-blue-800' :
                      (record.record_type === 'A' || record.recordType === 'A') ? 'bg-green-100 text-green-800' :
                      (record.record_type === 'AAAA' || record.recordType === 'AAAA') ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {record.record_type || record.recordType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{record.content}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      record.proxied ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {record.proxied ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(record)}
                        className="p-2 rounded hover:bg-gray-100 focus:outline-none"
                        aria-label="Editar registro DNS"
                      >
                        <Edit className="h-5 w-5 text-green-600" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(record)}
                        className="p-2 rounded hover:bg-gray-100 focus:outline-none"
                        aria-label="Excluir registro DNS"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
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

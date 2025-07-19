'use client';

import React, { useState } from 'react';
import { DNSRecord } from '@/lib/definitions';
import { deleteDNSRecord } from '@/app/dashboard/dns-records/actions';
import DNSRecordTable from './DNSRecordTable';
import { Button } from '@/components/ui/button';
import { PlusCircle, Globe, Database, Shield, Activity } from 'lucide-react';
import DNSRecordFormModal from './DNSRecordFormModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

interface DNSRecordPageClientProps {
  initialDNSRecords: DNSRecord[];
  userRole: string;
  domainId: string;
}

/**
 * Componente de Cliente para a página de Gerenciamento de Registros DNS.
 * 
 * Gerencia o estado da lista de registros DNS e a visibilidade do modal de formulário.
 */
const DNSRecordPageClient = ({ initialDNSRecords, userRole, domainId }: DNSRecordPageClientProps) => {
  const [dnsRecords, setDNSRecords] = useState<DNSRecord[]>(initialDNSRecords);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DNSRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<DNSRecord | null>(null);

  // Estatísticas dos registros DNS
  const totalRecords = dnsRecords.length;
  const proxiedRecords = dnsRecords.filter(r => r.proxied).length;
  const cnameRecords = dnsRecords.filter(r => r.recordType === 'CNAME').length;
  const aRecords = dnsRecords.filter(r => r.recordType === 'A').length;

  const handleAddRecord = () => {
    setEditingRecord(null);
    setIsFormModalOpen(true);
  };

  const handleEditRecord = (record: DNSRecord) => {
    setEditingRecord(record);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingRecord(null);
  };

  const handleDeleteRecord = (recordId: string) => {
    const record = dnsRecords.find(r => r.id === recordId);
    if (record) {
      setRecordToDelete(record);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (recordToDelete) {
      try {
        await deleteDNSRecord(domainId, recordToDelete.id);
        setDNSRecords(dnsRecords.filter(r => r.id !== recordToDelete.id));
        setIsDeleteModalOpen(false);
        setRecordToDelete(null);
      } catch (error) {
        console.error('Falha ao excluir registro DNS:', error);
        // Adicionar feedback de erro para o usuário
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setRecordToDelete(null);
  };

  const onRecordSaved = async (savedRecord: DNSRecord) => {
    // Atualizar a lista localmente
    if (editingRecord) {
      setDNSRecords(dnsRecords.map(r => r.id === savedRecord.id ? savedRecord : r));
    } else {
      setDNSRecords([savedRecord, ...dnsRecords]);
    }
    handleCloseFormModal();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Database className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Database className="h-6 w-6 text-green-600 mr-1" /> Gerenciar Registros DNS
            </h1>
            <p className="text-muted-foreground">Configure os registros DNS do domínio</p>
          </div>
        </div>
        <Button onClick={handleAddRecord} className="bg-green-600 hover:bg-green-700">
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

      <div className="bg-white rounded-lg shadow-sm border">
        <DNSRecordTable 
          dnsRecords={dnsRecords} 
          onEdit={handleEditRecord} 
          onDelete={handleDeleteRecord}
          userRole={userRole}
        />
      </div>

      {isFormModalOpen && (
        <DNSRecordFormModal 
          record={editingRecord}
          onClose={handleCloseFormModal}
          onSave={onRecordSaved}
          userRole={userRole}
          domainId={domainId}
        />
      )}

      {isDeleteModalOpen && recordToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          itemType="registro DNS"
          itemName={recordToDelete.name}
        />
      )}
    </div>
  );
};

export default DNSRecordPageClient; 
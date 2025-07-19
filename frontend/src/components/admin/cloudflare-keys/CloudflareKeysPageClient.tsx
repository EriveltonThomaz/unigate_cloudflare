
// src/components/admin/cloudflare-keys/CloudflareKeysPageClient.tsx
'use client';

import React, { useState } from 'react';
import { CloudflareKey } from '@/app/admin/cloudflare-keys/actions';
import { deleteCloudflareKey } from '@/app/admin/cloudflare-keys/actions';
import CloudflareKeysTable from './CloudflareKeysTable';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import CloudflareKeyFormModal from './CloudflareKeyFormModal';
import DeleteConfirmationModal from '@/components/ui/DeleteConfirmationModal';

interface CloudflareKeysPageClientProps {
  initialKeys: CloudflareKey[];
}

/**
 * Componente de Cliente para a página de Chaves Cloudflare.
 */
const CloudflareKeysPageClient = ({ initialKeys }: CloudflareKeysPageClientProps) => {
  const [keys, setKeys] = useState<CloudflareKey[]>(initialKeys);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<CloudflareKey | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<CloudflareKey | null>(null);

  const handleAddKey = () => {
    setEditingKey(null);
    setIsFormModalOpen(true);
  };

  const handleEditKey = (key: CloudflareKey) => {
    setEditingKey(key);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingKey(null);
  };

  const handleDeleteKey = (keyId: string) => {
    const key = keys.find(k => k.id === keyId);
    if (key) {
      setKeyToDelete(key);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (keyToDelete) {
      try {
        await deleteCloudflareKey(keyToDelete.id);
        setKeys(keys.filter(k => k.id !== keyToDelete.id));
        setIsDeleteModalOpen(false);
        setKeyToDelete(null);
      } catch (error) {
        console.error('Falha ao excluir chave Cloudflare:', error);
        // Adicionar feedback de erro para o usuário
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setKeyToDelete(null);
  };

  const onKeySaved = (savedKey: CloudflareKey) => {
    if (editingKey) {
      setKeys(keys.map(k => k.id === savedKey.id ? savedKey : k));
    } else {
      setKeys([savedKey, ...keys]);
    }
    handleCloseFormModal();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Chaves da API Cloudflare</h1>
        <Button onClick={handleAddKey}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Adicionar Chave
        </Button>
      </div>

      <div className="mt-6">
        <CloudflareKeysTable keys={keys} onEdit={handleEditKey} onDelete={handleDeleteKey} />
      </div>

      {isFormModalOpen && (
        <CloudflareKeyFormModal 
          apiKey={editingKey}
          onClose={handleCloseFormModal}
          onSave={onKeySaved}
        />
      )}

      {isDeleteModalOpen && keyToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          itemType="chave Cloudflare"
          itemName={keyToDelete.email}
        />
      )}
    </div>
  );
};

export default CloudflareKeysPageClient;

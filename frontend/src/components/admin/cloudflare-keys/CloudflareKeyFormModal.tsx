
// src/components/admin/cloudflare-keys/CloudflareKeyFormModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CloudflareKey, Tenant } from '@/app/admin/cloudflare-keys/actions';
import { saveCloudflareKey } from '@/app/admin/cloudflare-keys/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { getTenants } from '@/app/admin/cloudflare-keys/actions';

interface CloudflareKeyFormModalProps {
  apiKey: CloudflareKey | null;
  onClose: () => void;
  onSave: (key: CloudflareKey) => void;
}

/**
 * Modal com formulário para adicionar ou editar uma chave da API Cloudflare.
 */
const CloudflareKeyFormModal = ({ apiKey, onClose, onSave }: CloudflareKeyFormModalProps) => {
  const [formData, setFormData] = useState({
    email: apiKey?.email || '',
    apiKey: '', // A chave nunca é pré-preenchida por segurança
    tenantId: apiKey?.tenantId || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]); // Estado para armazenar os tenants

  // Carregar tenants ao montar o componente
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const fetchedTenants = await getTenants();
        setTenants(fetchedTenants);
      } catch (error) {
        console.error('Failed to fetch tenants:', error);
      }
    };
    fetchTenants();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTenantChange = (value: string) => {
    setFormData(prev => ({ ...prev, tenantId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Se for edição e a chave não for alterada, não envie a chave em branco
      const dataToSave = { ...apiKey, ...formData };
      if (apiKey && !formData.apiKey) {
        delete (dataToSave as any).apiKey;
      }
      const savedKey = await saveCloudflareKey(dataToSave);
      onSave(savedKey);
    } catch (error) {
      console.error('Failed to save Cloudflare key:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl border border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{apiKey ? 'Editar Chave' : 'Adicionar Chave'}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email da Conta Cloudflare</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="apiKey">Chave da API</Label>
            <Input id="apiKey" name="apiKey" type="password" onChange={handleInputChange} placeholder={apiKey ? 'Deixe em branco para não alterar' : ''} />
          </div>
          <div>
            <Label htmlFor="tenantId">Cliente (Tenant)</Label>
            <Select onValueChange={handleTenantChange} value={formData.tenantId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map(tenant => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CloudflareKeyFormModal;

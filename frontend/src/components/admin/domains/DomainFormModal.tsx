import React, { useState, useEffect } from 'react';
import { Domain, Tenant, User } from '@/lib/definitions';
import { saveDomain, getTenantsAction } from '@/app/admin/domains/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface DomainFormModalProps {
  domain: Domain | null;
  onClose: () => void;
  onSave: (savedDomain: Domain) => void;
  userRole: string;
  tenantId: string;
  modalTitle?: string;
  hideTenantSelect?: boolean;
}

/**
 * Modal com formulário para criar ou editar um domínio.
 */
const DomainFormModal = ({ domain, onClose, onSave, userRole, tenantId, modalTitle = 'Editar Domínio', hideTenantSelect = false }: DomainFormModalProps) => {
  const [formData, setFormData] = useState({
    name: domain?.name || '',
    tenantId: domain?.tenantId || tenantId || '',
    record_type: 'CNAME', // Default para CNAME
    content: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    if (hideTenantSelect) {
      setFormData(prev => ({ ...prev, tenantId }));
    }
    const fetchTenants = async () => {
      try {
        const result = await getTenantsAction();
        if (result.success && result.tenants) {
          setTenants(result.tenants);
        } else {
          toast.error(result.error || 'Erro ao carregar clientes.');
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        toast.error('Erro ao carregar clientes.');
      }
    };
    fetchTenants();
  }, [tenantId, hideTenantSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        tenantId: formData.tenantId || tenantId,
      };
      // Se não for admin, garantir que record_type seja CNAME
      if (userRole !== 'admin') {
        payload.record_type = 'CNAME';
      }
      // Use payload para criar/editar domínio
      const result = await saveDomain(payload);
      if (result.success && result.domain) {
        onSave(result.domain);
        toast.success('Domínio salvo com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao salvar domínio.');
      }
    } catch (error) {
      console.error('Falha ao salvar domínio:', error);
      toast.error('Erro ao salvar domínio.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{modalTitle}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Domínio</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500"
            />
          </div>

          {userRole === 'admin' && (
            <div>
              <Label htmlFor="record_type">Tipo de Registro</Label>
              <Select onValueChange={(value) => handleSelectChange('record_type', value)} value={formData.record_type}>
                <SelectTrigger id="record_type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="AAAA">AAAA</SelectItem>
                  <SelectItem value="CNAME">CNAME</SelectItem>
                  <SelectItem value="MX">MX</SelectItem>
                  <SelectItem value="TXT">TXT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(userRole !== 'admin' || formData.record_type === 'CNAME') && (
            <div>
              <Label htmlFor="content">Conteúdo (para CNAME)</Label>
              <Input id="content" name="content" value={formData.content} onChange={handleInputChange} placeholder="destino.exemplo.com" />
            </div>
          )}

          {!hideTenantSelect && (
            <div>
              <Label htmlFor="tenantId">Cliente (Tenant)</Label>
              <Select onValueChange={(value) => handleSelectChange('tenantId', value)} value={formData.tenantId}>
                <SelectTrigger id="tenantId">
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
          )}

          <div className="flex justify-end gap-2 mt-6">
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

export default DomainFormModal;
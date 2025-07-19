'use client';

import React, { useState, useEffect } from 'react';
import { DNSRecord } from '@/lib/definitions';
import { createDNSRecord, updateDNSRecord } from '@/app/dashboard/dns-records/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getA_AAAARecords } from '@/services/admin.client';
import { getUserDomainPermissionByUserAndDomain } from '@/services/admin.client';
import { useAuth } from '@/contexts/AuthContext';

interface DNSRecordFormModalProps {
  record?: DNSRecord | null;
  onClose: () => void;
  onSave: (record: DNSRecord) => void;
  userRole: string;
  domainId: string;
}

const TTL_OPTIONS = [
  { label: 'Auto', value: 1 }, // Cloudflare uses 1 for automatic TTL
  { label: '1 minuto', value: 60 },
  { label: '2 minutos', value: 120 },
  { label: '5 minutos', value: 300 },
  { label: '10 minutos', value: 600 },
  { label: '15 minutos', value: 900 },
  { label: '30 minutos', value: 1800 },
  { label: '1 hora', value: 3600 },
  { label: '2 horas', value: 7200 },
  { label: '5 horas', value: 18000 },
  { label: '12 horas', value: 43200 },
  { label: '1 dia', value: 86400 },
];

/**
 * Modal com formulário para criar ou editar um registro DNS.
 * 
 * Implementa as restrições de permissões:
 * - Usuários comuns só podem criar/editar registros CNAME
 * - Administradores podem criar/editar todos os tipos de registros
 */
const DNSRecordFormModal = ({ record, onClose, onSave, userRole, domainId }: DNSRecordFormModalProps) => {
  const [formData, setFormData] = useState({
    name: record?.name || '',
    record_type: record?.recordType || 'CNAME',
    content: record?.content || '',
    ttl: record?.ttl || 1,
    proxied: record?.proxied || false,
    domain: record?.domainId || '',
    priority: record?.priority || undefined, // Adicionado
  });
  const [isSaving, setIsSaving] = useState(false);
  const [domains, setDomains] = useState<any[]>([]);
  const [aAaaaRecords, setAAaaaRecords] = useState<any[]>([]);
  const { user } = useAuth();
  const [allowedARecord, setAllowedARecord] = useState<any | null>(null);
  const [loadingAllowed, setLoadingAllowed] = useState(false);
  const [domainName, setDomainName] = useState('');

  // Carregar registros A/AAAA quando tipo for CNAME
  useEffect(() => {
    if (formData.record_type === 'CNAME') {
      getA_AAAARecords(domainId).then(setAAaaaRecords).catch(() => setAAaaaRecords([]));
    }
  }, [formData.record_type, domainId]);

  // Buscar allowed_a_record para usuário comum
  useEffect(() => {
    if (userRole !== 'admin' && user && domainId) {
      setLoadingAllowed(true);
      getUserDomainPermissionByUserAndDomain(Number(user.id), Number(domainId))
        .then(perm => {
          if (perm && perm.allowed_a_record) {
            // Buscar o registro A/AAAA pelo ID na lista de registros do domínio
            getA_AAAARecords(domainId).then(records => {
              const found = records.find(r => String(r.id) === String(perm.allowed_a_record));
              setAllowedARecord(found || null);
            }).catch(() => setAllowedARecord(null));
          } else {
            setAllowedARecord(null);
          }
        })
        .catch(() => setAllowedARecord(null))
        .finally(() => setLoadingAllowed(false));
    }
  }, [userRole, user, domainId]);

  // Buscar nome do domínio para montar o FQDN
  useEffect(() => {
    if (domainId) {
      import('@/services/admin.client').then(mod => {
        mod.getDomainById(domainId).then(domain => {
          setDomainName(domain.name);
        });
      });
    }
  }, [domainId]);

  // Preencher automaticamente o content para usuário comum
  useEffect(() => {
    if (
      userRole !== 'admin' &&
      allowedARecord &&
      domainName &&
      formData.record_type === 'CNAME' &&
      !formData.content
    ) {
      setFormData(prev => ({ ...prev, content: allowedARecord.name }));
    }
  }, [userRole, allowedARecord, domainName, formData.record_type, formData.content]);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        // Aqui você precisaria implementar a função getDomains no actions
        // Por enquanto, vamos usar um array vazio
        setDomains([]);
      } catch (error) {
        console.error('Erro ao carregar domínios:', error);
        toast.error('Erro ao carregar domínios.');
      }
    };
    fetchDomains();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Validação extra para tipos
    if (formData.record_type === 'A' && !/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.content)) {
      toast.error('O conteúdo do registro A deve ser um endereço IPv4 válido.');
      setIsSaving(false);
      return;
    }
    if (formData.record_type === 'AAAA' && !/^([a-fA-F0-9:]+)$/.test(formData.content)) {
      toast.error('O conteúdo do registro AAAA deve ser um endereço IPv6 válido.');
      setIsSaving(false);
      return;
    }
    if (formData.record_type === 'MX' && (!formData.priority || isNaN(formData.priority))) {
      toast.error('Prioridade é obrigatória para registros MX.');
      setIsSaving(false);
      return;
    }
    // CNAME: garantir que não seja domínio completo
    if (formData.record_type === 'CNAME' && formData.name.includes('.')) {
      toast.error('O campo Nome para CNAME deve ser apenas o subdomínio (ex: www, api, @), não o domínio completo.');
      setIsSaving(false);
      return;
    }
    const payload: any = {
      name: formData.name,
      record_type: formData.record_type,
      content: formData.content,
      ttl: formData.ttl,
      proxied: formData.proxied,
    };
    if (formData.record_type === 'MX') {
      payload.priority = formData.priority;
    }
    try {
      let result;
      if (record) {
        result = await updateDNSRecord(domainId, {
          id: record.id,
          name: formData.name,
          recordType: formData.record_type,
          content: formData.content,
          ttl: formData.ttl,
          proxied: formData.proxied,
          domainId: domainId
        });
      } else {
        result = await createDNSRecord(domainId, {
          name: formData.name,
          record_type: formData.record_type,
          content: formData.content,
          ttl: formData.ttl,
          proxied: formData.proxied
        });
      }

      if (result.success && result.record) {
        onSave(result.record);
        toast.success(record ? 'Registro DNS atualizado com sucesso!' : 'Registro DNS criado com sucesso!');
        onClose();
      } else {
        toast.error(result.error || 'Erro ao salvar registro DNS.');
      }
    } catch (error) {
      console.error('Falha ao salvar registro DNS:', error);
      toast.error('Erro ao salvar registro DNS.');
    } finally {
      setIsSaving(false);
    }
  };

  const recordTypes = userRole === 'admin' 
    ? ['A', 'AAAA', 'CNAME', 'MX', 'TXT']
    : ['CNAME']; // Usuários comuns só podem criar CNAME

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border">
        <h2 className="mb-4 text-xl font-semibold">
          {record ? 'Editar Registro DNS' : 'Criar Registro DNS'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Nome (sempre obrigatório) */}
          <div>
            <Label htmlFor="record_type">Tipo</Label>
            <select
              id="record_type"
              name="record_type"
              value={formData.record_type}
              onChange={e => setFormData({ ...formData, record_type: e.target.value })}
              required
              className="w-full border rounded px-2 py-1"
              disabled={userRole !== 'admin'}
            >
              {recordTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={e => {
                // Impede pontos para CNAME
                if (formData.record_type === 'CNAME' && e.target.value.includes('.')) return;
                setFormData({ ...formData, name: e.target.value });
              }}
              placeholder={formData.record_type === 'CNAME' ? 'Ex: www, api, @ (sem domínio)' : 'Ex: @, www, subdominio'}
              required
            />
          </div>
          {formData.record_type === 'MX' && (
            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Input
                id="priority"
                name="priority"
                type="number"
                value={formData.priority || ''}
                onChange={e => setFormData({ ...formData, priority: Number(e.target.value) })}
                placeholder="Ex: 10"
                required
              />
            </div>
          )}
          <div>
            <Label htmlFor="content">
              {formData.record_type === 'A' ? 'Endereço IPv4' : formData.record_type === 'AAAA' ? 'Endereço IPv6' : 'Conteúdo'}
            </Label>
            {formData.record_type === 'CNAME' ? (
              userRole === 'admin' ? (
                <select
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  required
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">{aAaaaRecords.length === 0 ? 'Nenhum destino disponível' : 'Selecione um destino'}</option>
                  {aAaaaRecords.map((rec) => (
                    <option key={rec.id} value={rec.name}>{rec.name} ({rec.record_type})</option>
                  ))}
                </select>
              ) : (
                <select
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  required
                  className="w-full border rounded px-2 py-1"
                  disabled={loadingAllowed || !allowedARecord}
                >
                  {loadingAllowed ? (
                    <option value="">Carregando permissão...</option>
                  ) : !allowedARecord ? (
                    <option value="">Você não tem permissão para criar CNAME neste domínio</option>
                  ) : (
                    <option value={allowedARecord.name}>{allowedARecord.name} ({allowedARecord.content})</option>
                  )}
                </select>
              )
            ) : (
              <Input
                id="content"
                name="content"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder={formData.record_type === 'A' ? 'Ex: 192.0.2.1' : formData.record_type === 'AAAA' ? 'Ex: 2001:db8::1' : ''}
                required
              />
            )}
          </div>

          {/* TTL */}
          <div>
            <Label htmlFor="ttl">TTL (Time To Live)</Label>
            <select
              id="ttl"
              name="ttl"
              value={formData.ttl}
              onChange={e => setFormData({ ...formData, ttl: Number(e.target.value) })}
              required
              className="w-full border rounded px-2 py-1"
            >
              {TTL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Proxied */}
          <div className="flex items-center space-x-2">
            <input
              id="proxied"
              type="checkbox"
              checked={formData.proxied}
              onChange={(e) => setFormData(prev => ({ ...prev, proxied: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="proxied">Proxied (Cloudflare)</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : (record ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DNSRecordFormModal; 
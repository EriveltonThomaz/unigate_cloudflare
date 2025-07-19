import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { getUsers, getDomainsClient, getA_AAAARecords, saveUserDomainPermission } from '@/services/admin.client';
import { toast } from 'sonner';

interface UserDomainPermissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: any | null; // Aceita nulo ou um objeto de permissão
}

const UserDomainPermissionFormModal = ({ isOpen, onClose, onSave, initialData }: UserDomainPermissionFormModalProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [aAaaaRecords, setAAaaaRecords] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    userId: '',
    domainId: '',
    allowed_a_record: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Efeito para carregar dados iniciais (usuários e domínios)
  useEffect(() => {
    getUsers().then(setUsers).catch(() => setUsers([]));
    getDomainsClient().then(setDomains).catch(() => setDomains([]));
  }, []);

  // Efeito para resetar e preencher o formulário quando o modal abre ou os dados de edição mudam
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          userId: String(initialData.user || ''),
          domainId: String(initialData.domain || ''),
          allowed_a_record: String(initialData.allowed_a_record || ''),
        });
      } else {
        // Limpa o formulário para uma nova permissão
        setFormData({ userId: '', domainId: '', allowed_a_record: '' });
      }
    }
  }, [isOpen, initialData]);

  // Efeito para buscar registros A/AAAA quando o domínio muda
  useEffect(() => {
    if (formData.domainId) {
      getA_AAAARecords(formData.domainId)
        .then(records => {
          setAAaaaRecords(records);
          // Se o registro permitido anteriormente não estiver na nova lista, limpa a seleção
          const currentRecordExists = records.some(r => String(r.id) === formData.allowed_a_record);
          if (!currentRecordExists) {
            setFormData(prev => ({ ...prev, allowed_a_record: '' }));
          }
        })
        .catch(() => setAAaaaRecords([]));
    } else {
      setAAaaaRecords([]);
    }
  }, [formData.domainId]);

  // Fechar ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Fechar ao clicar fora - TEMPORARIAMENTE DESABILITADO PARA TESTE
  // useEffect(() => {
  //   const handleClick = (e: MouseEvent) => {
  //     const target = e.target as HTMLElement;
  //     
  //     // Verifica se o clique foi em algum elemento do Select ou Portal
  //     const isSelectElement = 
  //       target.closest('[data-radix-popper-content-wrapper]') ||
  //       target.closest('[data-portal]') ||
  //       target.closest('[role="listbox"]') ||
  //       target.closest('.select-dropdown') ||
  //       target.closest('[data-radix-select-content]') ||
  //       target.closest('[data-radix-select-viewport]') ||
  //       target.closest('[data-radix-select-item]') ||
  //       target.closest('[data-radix-select-trigger]') ||
  //       target.closest('[data-radix-select-separator]') ||
  //       target.closest('[data-radix-select-label]') ||
  //       target.closest('[data-radix-select-group]') ||
  //       target.closest('[data-radix-select-arrow]') ||
  //       target.closest('[data-radix-select-icon]') ||
  //       target.closest('[data-radix-select-indicator]') ||
  //       target.closest('[data-radix-select-item-text]') ||
  //       target.closest('[data-radix-select-item-indicator]') ||
  //       target.closest('[data-radix-select-scroll-up-button]') ||
  //       target.closest('[data-radix-select-scroll-down-button]') ||
  //       target.closest('[data-radix-select-value]') ||
  //       // Verifica se está dentro de um portal do Radix
  //       target.closest('[data-radix-portal]') ||
  //       // Verifica se está dentro de qualquer elemento com data-radix
  //       target.closest('[data-radix-*]') ||
  //       // Verifica se está dentro de um elemento com role="option"
  //       target.closest('[role="option"]') ||
  //       // Verifica se está dentro de um elemento com role="listbox"
  //       target.closest('[role="listbox"]') ||
  //       // Verifica se está dentro de um elemento com role="combobox"
  //       target.closest('[role="combobox"]');

  //     // Se clicar fora do modal e não for em dropdown do Select
  //     if (
  //       modalRef.current &&
  //       !modalRef.current.contains(target) &&
  //       !isSelectElement
  //     ) {
  //       onClose();
  //     }
  //   };
  //   document.addEventListener('mousedown', handleClick);
  //   return () => document.removeEventListener('mousedown', handleClick);
  // }, [onClose]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.domainId || !formData.allowed_a_record) {
      toast.error('Todos os campos são obrigatórios.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        id: initialData?.id, // Envia o ID se estiver editando
        user: Number(formData.userId),
        domain: Number(formData.domainId),
        allowed_a_record: Number(formData.allowed_a_record),
      };
      await saveUserDomainPermission(payload);
      toast.success('Permissão salva com sucesso!');
      onSave(); // Notifica o pai para atualizar a lista
      // Não fecha o modal, permitindo adicionar mais permissões
      // Limpa o formulário para a próxima entrada, exceto se estiver editando
      if (!initialData) {
        setFormData({ userId: '', domainId: '', allowed_a_record: '' });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar permissão.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl border border-border" ref={modalRef}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">{initialData ? 'Editar' : 'Adicionar'} Permissão</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="userId">Usuário</Label>
            <Select
              value={formData.userId}
              onValueChange={value => setFormData(prev => ({ ...prev, userId: value, domainId: '', allowed_a_record: '' }))}
              required
              disabled={!!initialData} // Desabilita se estiver editando
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.filter(u => u.role === 'user').map(user => (
                  <SelectItem key={user.id} value={String(user.id)}>{user.name} ({user.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="domainId">Domínio</Label>
            <Select
              value={formData.domainId}
              onValueChange={value => setFormData(prev => ({ ...prev, domainId: value, allowed_a_record: '' }))}
              required
              disabled={!!initialData} // Desabilita se estiver editando
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o domínio" />
              </SelectTrigger>
              <SelectContent>
                {domains.map(domain => (
                  <SelectItem key={domain.id} value={String(domain.id)}>{domain.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="allowed_a_record">Registro A/AAAA Permitido</Label>
            <Select
              value={formData.allowed_a_record}
              onValueChange={value => setFormData(prev => ({ ...prev, allowed_a_record: value }))}
              required
              disabled={!formData.domainId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o registro" />
              </SelectTrigger>
              <SelectContent>
                {aAaaaRecords.length > 0 ? (
                  aAaaaRecords.map(record => (
                    <SelectItem key={record.id} value={String(record.id)}>{record.name} ({record.content})</SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>Nenhum registro disponível</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Fechar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Permissão'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDomainPermissionFormModal; 
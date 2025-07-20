// src/components/admin/users/UserFormModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/lib/definitions';
import { saveUser } from '@/app/admin/users/actions';
import { updateProfile } from '@/app/profile/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { getTenantsClient, getDomainsClient, getA_AAAARecords, getDomainsByTenantId, isUserManagerOfAnyTenant } from '@/services/admin.client';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface UserFormModalProps {
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
  title?: string;
  editableRole?: boolean;
  isProfileEdit?: boolean;
}

/**
 * Modal com formulário para criar ou editar um usuário.
 */
const UserFormModal = ({ user, onClose, onSave, title = user ? 'Editar Usuário' : 'Adicionar Usuário', editableRole = true, isProfileEdit = false }: UserFormModalProps) => {
  const { user: currentUser } = useAuth(); // Usuário logado
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'user',
    password: '',
    confirmPassword: '',
    is_active: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [aAaaaOptions, setAAaaaOptions] = useState<{ [domainId: string]: any[] }>({});
  const [domainsByPerm, setDomainsByPerm] = useState<{ [idx: number]: any[] }>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [isUserManager, setIsUserManager] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Carregar lista de tenants
    getTenantsClient().then(setTenants).catch(() => {});
    getDomainsClient().then(setDomains).catch(() => {});
    
    // Preencher formulário com dados do usuário se estiver editando
    if (user) {
      const emailFallback = (user as any).email || (user as any).Email || (user as any).username || '';
      const formDataToSet = {
        first_name: (user as any).first_name || (user.name ? user.name.split(' ')[0] : ''),
        last_name: (user as any).last_name || (user.name ? user.name.split(' ').slice(1).join(' ') : ''),
        email: emailFallback,
        role: user.role,
        password: '',
        confirmPassword: '',
        is_active: user.isActive,
      };
      setFormData(formDataToSet);
      
      // Verificar se o usuário é gerente de algum tenant
      const checkIfUserIsManager = async () => {
        const isManager = await isUserManagerOfAnyTenant(user.id);
        setIsUserManager(isManager);
        
        // Só carrega permissões se o usuário for gerente
        if (isManager && Array.isArray((user as any).permissions)) {
          const mappedPerms = (user as any).permissions.map((perm: any) => ({
            tenantId: perm.tenant ? String(perm.tenant) : '',
            domainId: perm.domain ? String(perm.domain) : '',
            allowedARecords: perm.allowed_a_record !== null && perm.allowed_a_record !== undefined ? [String(perm.allowed_a_record)] : [],
          }));
          setPermissions(mappedPerms);
          
          // Carregar domínios e registros para cada permissão existente
          mappedPerms.forEach(async (perm, idx) => {
            if (perm.tenantId) {
              const domains = await getDomainsByTenantId(perm.tenantId);
              setDomainsByPerm(prev => ({ ...prev, [idx]: domains }));
            }
            if (perm.domainId) {
              const records = await getA_AAAARecords(perm.domainId);
              setAAaaaOptions(prev => ({ ...prev, [perm.domainId]: records }));
            }
          });
        } else {
          setPermissions([]);
        }
      };
      
      checkIfUserIsManager();
      setAvatarPreview(user.avatarUrl || null);
    } else {
      setPermissions([]);
      setIsUserManager(false);
    }
    // eslint-disable-next-line
  }, [user]);

  // Fechar ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleTenantChange = (tenantId: string, checked: boolean) => {
    if (checked) {
      setSelectedTenants(prev => [...prev, tenantId]);
    } else {
      setSelectedTenants(prev => prev.filter(id => id !== tenantId));
    }
  };

  // Função para adicionar nova permissão
  const addPermission = () => {
    // Evita adicionar permissão duplicada (mesmo tenant, domínio e registro)
    if (permissions.some(perm => !perm.tenantId && !perm.domainId && (!perm.allowedARecords || perm.allowedARecords.length === 0))) {
      toast.error('Preencha a permissão anterior antes de adicionar outra.');
      return;
    }
    setPermissions(prev => [...prev, { tenantId: '', domainId: '', allowedARecords: [] }]);
  };
  // Função para remover permissão
  const removePermission = (idx: number) => {
    setPermissions(prev => prev.filter((_, i) => i !== idx));
  };
  // Função para atualizar permissão
  const updatePermission = async (idx: number, field: string, value: any) => {
    // Verifica duplicidade ao selecionar tenant, domínio e registro
    let newPerm = { ...permissions[idx], [field]: value };
    if (field === 'tenantId') {
      newPerm = { ...newPerm, domainId: '', allowedARecords: [] };
    }
    if (field === 'domainId') {
      newPerm = { ...newPerm, allowedARecords: [] };
    }
    // Se todos preenchidos, verifica duplicidade
    if (newPerm.tenantId && newPerm.domainId && newPerm.allowedARecords[0]) {
      const isDuplicate = permissions.some((perm, i) =>
        i !== idx &&
        perm.tenantId === newPerm.tenantId &&
        perm.domainId === newPerm.domainId &&
        perm.allowedARecords[0] === newPerm.allowedARecords[0]
      );
      if (isDuplicate) {
        toast.error('Permissão já existe para este domínio e registro.');
        return;
      }
    }
    setPermissions(prev => prev.map((perm, i) => (i === idx ? newPerm : perm)));
    if (field === 'tenantId' && value) {
      // Buscar domínios do cliente selecionado
      const domains = await getDomainsByTenantId(value);
      setDomainsByPerm(prev => ({ ...prev, [idx]: domains }));
    }
    if (field === 'domainId' && value) {
      getA_AAAARecords(value).then(records => {
        setAAaaaOptions(prev => ({ ...prev, [value]: records }));
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(user?.avatarUrl || null);
    }
  };
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('Nome e sobrenome são obrigatórios.');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Email é obrigatório.');
      return;
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Email inválido.');
      return;
    }
    
    if (!user && !formData.password) {
      toast.error('Senha é obrigatória para novos usuários.');
      return;
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    
    // Validação de permissões para usuários existentes que são gerentes
    const isAdmin = currentUser?.role === 'admin';
    if (user && isAdmin && isUserManager && formData.role === 'user' && permissions.length === 0) {
      toast.warning('Recomendamos adicionar pelo menos uma permissão de domínio para este usuário. Você poderá adicionar mais permissões através do gerenciamento de clientes.');
    }

    setIsSaving(true);
    try {
      const form = new FormData();
      form.append('first_name', formData.first_name.trim());
      form.append('last_name', formData.last_name.trim());
      form.append('email', formData.email.trim());
      form.append('role', formData.role); // Sempre inclua o campo role
      if (formData.password) form.append('password', formData.password);
      if (avatarFile) {
        form.append('avatar', avatarFile);
      } else if (avatarPreview === null) {
        form.append('avatar', ''); // Para remover avatar
      }
      // Sempre enviar is_active para garantir que o usuário não seja desativado acidentalmente
      form.append('is_active', String(formData.is_active));
      
      // Apenas enviar permissões para usuários existentes (não para novos)
      // e apenas se for admin editando E o usuário for gerente de algum cliente
      const isAdmin = currentUser?.role === 'admin';
      if (user && isAdmin && isUserManager && permissions.length > 0) {
        const validPermissions = permissions
          .filter(perm => perm.tenantId && perm.domainId && perm.allowedARecords[0])
          .map(perm => ({
            tenant: perm.tenantId,
            domain: perm.domainId,
            allowed_a_record: perm.allowedARecords[0],
          }));
          
        form.append('permissions_input', JSON.stringify(validPermissions));
      }
      
      if (user) form.append('id', user.id);
      
      // Se for edição de perfil, use a action específica para atualizar o perfil
      let result;
      if (isProfileEdit) {
        result = await updateProfile(form);
      } else {
        result = await saveUser(form, true);
      }
      
      if (result && result.success) {
        toast.success('Usuário salvo com sucesso!');
        // Passar o usuário salvo para o callback onSave
        if (user) {
          onSave(user);
        } else if (result.user) {
          // Se for um novo usuário, passar o usuário retornado pela API
          onSave(result.user);
        }
        onClose();
      } else if (result && result.error) {
        // Mensagens de erro mais amigáveis
        if (result.error.includes('email') && result.error.includes('existe')) {
          toast.error('Este email já está sendo usado por outro usuário. Por favor, use um email diferente.');
        } else if (result.error.includes('permissão')) {
          toast.error('Erro nas permissões: ' + result.error);
        } else {
          toast.error(result.error);
        }
      } else if (result) {
        toast.success('Usuário salvo com sucesso!');
        if (user) {
          onSave(user);
        } else if (result.user) {
          // Se for um novo usuário, passar o usuário retornado pela API
          onSave(result.user);
        }
        onClose();
      } else {
        toast.error('Não foi possível salvar o usuário. Verifique os dados e tente novamente.');
      }
    } catch (error: any) {
      
      // Mensagens de erro mais amigáveis
      if (error?.message?.includes('localStorage')) {
        toast.error('Erro de ambiente: Recarregue a página e tente novamente.');
      } else if (error?.response?.data?.email) {
        toast.error('Este email já está sendo usado por outro usuário.');
      } else if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
        toast.error('Sua sessão expirou. Por favor, faça login novamente.');
      } else {
        toast.error('Ocorreu um erro ao salvar o usuário. Por favor, tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Função utilitária para checar se há permissões incompletas
  const hasIncompletePermissions = permissions.some(
    perm => !perm.tenantId || !perm.domainId || !perm.allowedARecords[0]
  );
  
  // Verificar se o usuário atual é admin
  const isCurrentUserAdmin = currentUser?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div ref={modalRef} className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-card dark:bg-gray-800 shadow-xl border border-border dark:border-gray-700 overflow-x-auto">
        {/* Header fixo */}
        <div className="flex items-center justify-between p-6 border-b border-border dark:border-gray-700 bg-card dark:bg-gray-800 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-foreground dark:text-white dark:text-white">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* Conteúdo scrollável */}
        <div className="overflow-y-auto p-6 flex-1">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Campo de upload de foto de perfil */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="Avatar" width={80} height={80} className="object-cover w-full h-full" />
                ) : (
                  <Image src="/images/iconeuniatende.png" alt="Avatar padrão" width={80} height={80} className="object-cover w-full h-full" />
                )}
                {avatarPreview && (
                  <button type="button" onClick={handleRemoveAvatar} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-xs">×</button>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Nome *</Label>
                <Input 
                  id="first_name" 
                  name="first_name" 
                  value={formData.first_name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="last_name">Sobrenome *</Label>
                <Input 
                  id="last_name" 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            {/* Campos de senha: para user comum sempre exibe campo de senha nova */}
            {user && user.role === 'user' && (
              <>
                <div>
                  <Label htmlFor="newPassword">Nova Senha (deixe em branco para manter a atual)</Label>
                  <Input 
                    id="newPassword" 
                    name="password" 
                    type="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    placeholder="Nova senha (opcional)" 
                  />
                </div>
                {formData.password && (
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password" 
                      value={formData.confirmPassword} 
                      onChange={handleInputChange} 
                      placeholder="Confirme a nova senha" 
                    />
                  </div>
                )}
              </>
            )}
            {/* Para novo user, exibe senha obrigatória */}
            {!user && (
              <>
                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    required={!user}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    value={formData.confirmPassword} 
                    onChange={handleInputChange} 
                    required={!user}
                  />
                </div>
              </>
            )}
            {/* Exibe campos de cargo e ativo para todos os usuários */}
            <>
                <div>
                  <Label htmlFor="role">Cargo *</Label>
                  <Select onValueChange={handleRoleChange} value={formData.role} disabled={!editableRole}>
                    <SelectTrigger className="w-full" disabled={!editableRole}>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="user">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_active">Usuário Ativo</Label>
                </div>
                {/* Seção de permissões - apenas para usuários existentes, que são gerentes e quando admin está logado */}
                {user && isCurrentUserAdmin && isUserManager && (
                  <div className="mt-6">
                    <h3 className="font-bold mb-2">Permissões de Domínio</h3>
                    
                    {/* Lista visual das permissões atuais */}
                    {permissions.length > 0 && (
                      <div className="mb-2">
                        <h4 className="font-semibold">Permissões atuais:</h4>
                        <ul className="text-sm">
                          {permissions.map((perm, idx) => (
                            <li key={idx}>
                              Cliente: {tenants.find(t => t.id === perm.tenantId)?.name || perm.tenantId} |
                              Domínio: {domains.find(d => d.id === perm.domainId)?.name || perm.domainId} |
                              Registro: {(aAaaaOptions[perm.domainId] || []).find(r => String(r.id) === perm.allowedARecords[0])?.name || perm.allowedARecords[0]}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Interface de edição de permissões */}
                    <>
                      {permissions.map((perm, idx) => (
                        <div key={idx} className="flex gap-2 mb-2 items-end">
                          <div className="flex-1">
                            <Label>Cliente</Label>
                            <Select
                              value={perm.tenantId}
                              onValueChange={v => updatePermission(idx, 'tenantId', v)}
                            >
                              <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                              <SelectContent>
                                {tenants.map(t => (
                                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <Label>Domínio</Label>
                            <Select
                              value={perm.domainId}
                              onValueChange={v => updatePermission(idx, 'domainId', v)}
                              disabled={!perm.tenantId || (domainsByPerm[idx]?.length || 0) === 0}
                            >
                              <SelectTrigger><SelectValue placeholder="Selecione o domínio" /></SelectTrigger>
                              <SelectContent>
                                {(domainsByPerm[idx]?.length || 0) === 0 ? (
                                  <SelectItem value="none" disabled>Nenhum domínio disponível</SelectItem>
                                ) : (
                                  domainsByPerm[idx].map((d: any) => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <Label>Registros A/AAAA</Label>
                            <Select
                              value={perm.allowedARecords[0] || ''}
                              onValueChange={v => updatePermission(idx, 'allowedARecords', [v])}
                              disabled={!perm.domainId}
                            >
                              <SelectTrigger><SelectValue placeholder="Selecione o registro" /></SelectTrigger>
                              <SelectContent>
                                {(aAaaaOptions[perm.domainId] || []).map(r => (
                                  <SelectItem key={r.id} value={String(r.id)}>{r.name} ({r.content})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="button" variant="destructive" onClick={() => removePermission(idx)}>-</Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={addPermission} className="mt-2">+ Adicionar Permissão</Button>
                    </>
                  </div>
                )}
                
                {/* Mensagem para usuários existentes que não são gerentes */}
                {user && isCurrentUserAdmin && !isUserManager && (
                  <div className="mt-6">
                    <h3 className="font-bold mb-2">Permissões de Domínio</h3>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            <strong>Permissões desativadas.</strong> Este usuário não é gerente de nenhum cliente. Vá para a seção de Clientes e adicione-o como gerente de um cliente para habilitar permissões.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Mensagem para novos usuários quando admin está logado */}
                {!user && isCurrentUserAdmin && (
                  <div className="mt-6">
                    <h3 className="font-bold mb-2">Permissões de Domínio</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700">
                            <strong>Permissões desativadas para novos usuários.</strong> Após criar o usuário, vá para a seção de Clientes e adicione-o como gerente de um cliente para conceder permissões.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Aviso de que o usuário precisa ser gerente para ter permissões */}
                {formData.role === 'user' && (
                  <div className="mt-2">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            <strong>Importante:</strong> Para que este usuário tenha acesso a domínios, ele precisa ser adicionado como gerente de um cliente na seção de Clientes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </>
            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || (user && isCurrentUserAdmin && isUserManager && hasIncompletePermissions)} className="bg-green-600 hover:bg-green-700">
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
// src/services/admin.service.ts

/**
 * Recomendações de Arquitetura:
 * 1. Mova todas as interfaces abaixo para um arquivo central de tipos,
 * como `src/lib/definitions.ts` ou `src/types/index.ts`.
 * 2. Importe os tipos desse arquivo central aqui e em qualquer outro
 * lugar que precisar deles. Isso evita importações circulares e organiza o projeto.
 */

// src/services/admin.service.ts
import 'server-only';
import { cookies } from 'next/headers';
import { DashboardStats, Tenant, TenantManager, User, Domain, CloudflareKey, RecentSubdomain, DNSRecord } from '@/lib/definitions';

// --- MAPEADORES DE DADOS ---

const mapToUser = (data: any): User => ({
  id: String(data.id),
  name: data.full_name || `${data.first_name} ${data.last_name}`.trim() || data.email,
  email: data.email,
  role: data.role,
  isActive: data.is_active,
  createdAt: data.date_joined,
});

const mapToDomain = (data: any): Domain => ({
  id: String(data.id),
  name: data.name,
  tenantId: String(data.tenant),
  tenantName: data.tenant_name,
  status: data.status,
  proxied: data.proxied,
  createdAt: data.created_at,
});

const mapToCloudflareKey = (data: any): CloudflareKey => ({
  id: String(data.id),
  email: data.email,
  apiKey: data.api_key,
  tenantId: String(data.tenant),
  tenantName: data.tenant_name,
  createdAt: data.created_at,
});

const mapToTenant = (data: any): Tenant => ({
    id: String(data.id),
    name: data.name,
    createdAt: data.created_at,
    ownerEmail: data.owner_email,
    cloudflare_email: data.cloudflare_email, // Adicionado
    managers: data.managers || [],
});

const mapToDNSRecord = (data: any): DNSRecord => ({
  id: String(data.id),
  name: data.name,
  recordType: data.record_type,
  content: data.content,
  ttl: data.ttl,
  proxied: data.proxied,
  domainId: String(data.domain),
  domainName: data.domain_name,
  createdAt: data.created_at,
});

const mapToRecentSubdomain = (data: any): RecentSubdomain => ({
  id: String(data.id),
  name: data.name,
  recordType: data.record_type,
  content: data.content,
  domainName: data.domain_name,
  tenantName: data.tenant_name,
  createdAt: data.created_at,
});

// --- HELPER CENTRALIZADO PARA CHAMADAS DE API ---

const api = async (endpoint: string, options: RequestInit = {}) => {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const baseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error('A variável de ambiente API_URL não está definida.');
  }

  const headers = new Headers({
    'Authorization': `Bearer ${accessToken}`,
    ...options.headers,
  });

  // Adiciona Content-Type apenas se não for FormData
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
    cache: options.cache || 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `Erro na comunicação com a API (status: ${response.status})`;
    if (response.status === 403) {
      errorMessage = "Você não tem permissão para executar essa ação.";
    }
    try {
      const errorJson = JSON.parse(errorBody);
      if (errorJson.detail) errorMessage = errorJson.detail;
    } catch (e) {
      if (errorBody) errorMessage = errorBody;
    }
    // Tratamento de token inválido/expirado
    if (
      response.status === 401 ||
      errorMessage.toLowerCase().includes('token')
    ) {
      if (typeof window !== 'undefined') {
        // Limpa tokens do localStorage/cookies se necessário (padronizado)
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        document.cookie = 'access_token=; Max-Age=0; path=/;';
        document.cookie = 'refresh_token=; Max-Age=0; path=/;';
        window.location.href = '/login';
      }
      // No server, apenas lance o erro normalmente
    }
    // Erro silencioso
    throw new Error(errorMessage);
  }

  if (response.status === 204) return;

  return response.json();
};

// --- FUNÇÕES DE SERVIÇO ---

// GET
export const getDashboardStats = (): Promise<DashboardStats> => {
  return api('/admin/dashboard-stats/');
};

export const getRecentTenants = async (): Promise<Tenant[]> => {
  const data = await api('/admin/recent-tenants/');
  return data.map(mapToTenant);
};

export const getTenants = async (): Promise<Tenant[]> => {
  const data = await api('/admin/tenants/');
  return data.map(mapToTenant);
};

export const getUsers = async (): Promise<User[]> => {
  const data = await api('/admin/users/');
  return data.map(mapToUser);
};

export const getDomains = async (): Promise<Domain[]> => {
  const data = await api('/admin/domains/');
  return data.map(mapToDomain);
};

export const getDomainsByTenantId = async (tenantId: string): Promise<Domain[]> => {
  const data = await api(`/admin/tenants/${tenantId}/domains/`);
  return data.map(mapToDomain);
};

export const getCloudflareKeys = async (): Promise<CloudflareKey[]> => {
  const data = await api('/admin/cloudflare-keys/');
  return data.map(mapToCloudflareKey);
};

export const getUserProfile = async (): Promise<User> => {
  const data = await api('/admin/profile/');
  return mapToUser(data);
};

export const getRecentSubdomains = async (): Promise<RecentSubdomain[]> => {
  const data = await api('/admin/recent-subdomains/');
  return data; // Assuming the API returns the data in the correct format
};

export const getSubdomainsByDomainId = async (domainId: string): Promise<RecentSubdomain[]> => {
  const data = await api(`/admin/domains/${domainId}/subdomains/`);
  return data.map(mapToRecentSubdomain);
};

// DNS Records functions
export const getDNSRecords = async (domainId?: string): Promise<DNSRecord[]> => {
  const endpoint = domainId ? `/admin/domains/${domainId}/dns-records/` : '/admin/dns-records/';
  const data = await api(endpoint);
  return data.map(mapToDNSRecord);
};

export const getDNSRecord = async (recordId: string): Promise<DNSRecord> => {
  const data = await api(`/admin/dns-records/${recordId}/`);
  return mapToDNSRecord(data);
};

export const createSubdomain = async (domainId: string, subdomainData: { name: string; content: string; }): Promise<RecentSubdomain> => {
  const savedData = await api(`/admin/domains/${domainId}/subdomains/create/`, {
    method: 'POST',
    body: JSON.stringify({
      name: subdomainData.name,
      content: subdomainData.content,
      record_type: 'CNAME', // Always CNAME for user-created subdomains
    }),
  });
  return mapToRecentSubdomain(savedData);
};

// MUTATIONS (CREATE, UPDATE, DELETE)

// NOVO: Funções para criar, atualizar e deletar Tenants
export const createTenant = async (tenantData: { name: string; cloudflare_api_key: string; cloudflare_email: string; }): Promise<Tenant> => {
  const savedData = await api('/admin/tenants/create/', {
    method: 'POST',
    body: JSON.stringify({
      name: tenantData.name,
      cloudflare_api_key: tenantData.cloudflare_api_key,
      cloudflare_email: tenantData.cloudflare_email,
    }),
  });
  return mapToTenant(savedData);
};

export const updateTenant = async (tenantData: Pick<Tenant, 'id' | 'name' | 'cloudflare_email'>): Promise<Tenant> => {
  const { id, ...data } = tenantData;
  const savedData = await api(`/admin/tenants/${id}/`, {
    method: 'PUT',
    body: JSON.stringify({
      name: data.name,
      cloudflare_email: data.cloudflare_email,
    }),
  });
  return mapToTenant(savedData);
};

export const deleteTenant = (tenantId: string): Promise<void> => {
  return api(`/admin/tenants/${tenantId}/`, { method: 'DELETE' });
};

// DNS Records mutations
export const createDNSRecord = async (recordData: { domain: string; name: string; record_type: string; content: string; ttl?: number; proxied?: boolean; }): Promise<DNSRecord> => {
  const savedData = await api('/admin/dns-records/', {
    method: 'POST',
    body: JSON.stringify(recordData),
  });
  return mapToDNSRecord(savedData);
};

export const updateDNSRecord = async (recordData: Partial<DNSRecord> & { id: string }): Promise<DNSRecord> => {
  const { id, ...data } = recordData;
  const savedData = await api(`/admin/dns-records/${id}/`, {
    method: 'PUT',
    body: JSON.stringify({
      name: data.name,
      record_type: data.recordType,
      content: data.content,
      ttl: data.ttl,
      proxied: data.proxied,
      domain: data.domainId,
    }),
  });
  return mapToDNSRecord(savedData);
};

export const deleteDNSRecord = (recordId: string): Promise<void> => {
  return api(`/admin/dns-records/${recordId}/`, { method: 'DELETE' });
};

// DNS Records Cloudflare (tempo real)
export const getCloudflareDNSRecords = async (domainId: string): Promise<DNSRecord[]> => {
  const data = await api(`/admin/domains/${domainId}/dns-records/cloudflare/`);
  return data.map(mapToDNSRecord);
};

export const createCloudflareDNSRecord = async (domainId: string, recordData: { name: string; record_type: string; content: string; ttl?: number; proxied?: boolean; }): Promise<DNSRecord> => {
  const savedData = await api(`/admin/domains/${domainId}/dns-records/cloudflare/`, {
    method: 'POST',
    body: JSON.stringify(recordData),
  });
  return mapToDNSRecord(savedData);
};

export const updateCloudflareDNSRecord = async (domainId: string, recordId: string, recordData: { name: string; record_type: string; content: string; ttl?: number; proxied?: boolean; }): Promise<DNSRecord> => {
  const savedData = await api(`/admin/domains/${domainId}/dns-records/cloudflare/${recordId}/`, {
    method: 'PUT',
    body: JSON.stringify(recordData),
  });
  return mapToDNSRecord(savedData);
};

export const deleteCloudflareDNSRecord = async (domainId: string, recordId: string): Promise<void> => {
  await api(`/admin/domains/${domainId}/dns-records/cloudflare/${recordId}/`, { method: 'DELETE' });
};

// Fim das novas funções

export const getCustomDNSRecords = async (domainId: string): Promise<DNSRecord[]> => {
  const data = await api(`/admin/domains/${domainId}/dnsrecords/custom/`);
  return data.map(mapToDNSRecord);
};

export const saveUser = async (userData: any, isFormData: boolean = false): Promise<User> => {
  let payload: any = {};
  let endpoint: string;
  let method: string;

  // Início do processo de salvamento do usuário

  if (isFormData) {
    const id = userData.get('id');
    const role = userData.get('role');
    
    // Verificação para determinar se é um usuário editando seu próprio perfil
    // Sempre use o endpoint de profile para usuários comuns editando a si mesmos
    let isUserEditingSelf = false;
    
    // Se estamos no UserMenu (edição de perfil), sempre use o endpoint de profile
    const isProfileEdit = userData.get('isProfileEdit') === 'true';
    
    // Se for edição de perfil, use sempre o endpoint de profile
    if (isProfileEdit) {
      endpoint = '/admin/profile/';
      method = 'PUT';
      
      // Remover o campo isProfileEdit para não enviá-lo ao backend
      userData.delete('isProfileEdit');
    } else {
      // Para admins ou criação de novos usuários
      endpoint = id ? `/admin/users/${id}/` : '/admin/users/';
      method = id ? 'PUT' : 'POST';
    }
    
    // Garantir que is_active seja true para usuários comuns
    if (role === 'user' && !userData.has('is_active')) {
      userData.append('is_active', 'true');
    }

    // Preparação do FormData para envio

    // FormData é enviado diretamente como body
    const savedData = await api(endpoint, {
      method,
      body: userData, // Envia o FormData diretamente
      // Não defina Content-Type, o navegador faz isso automaticamente para FormData
      headers: {},
    });
    return mapToUser(savedData);

  } else {
    // Se for um objeto JSON normal
    const { id, first_name, last_name, email, role, isActive, password, permissions } = userData;
    endpoint = id ? `/admin/users/${id}/` : '/admin/users/';
    method = id ? 'PUT' : 'POST';

    payload = {
      first_name: first_name || '',
      last_name: last_name || '',
      email: email || '',
      role: role || 'user',
      is_active: isActive !== undefined ? isActive : true,
      permissions_input: permissions || [],
    };
    if (password) payload.password = password;

    // Preparação do payload JSON

    const savedData = await api(endpoint, {
      method,
      body: JSON.stringify(payload),
    });
    return mapToUser(savedData);
  }
};

export const saveDomain = async (domainData: Partial<Domain>): Promise<Domain> => {
  const { id, ...data } = domainData;
  const endpoint = id ? `/admin/domains/${id}/` : '/admin/domains/';
  const method = id ? 'PUT' : 'POST';
  const savedData = await api(endpoint, {
    method,
    body: JSON.stringify({
      name: data.name, tenant: data.tenantId, proxied: data.proxied,
    }),
  });
  return mapToDomain(savedData);
};

export const saveCloudflareKey = async (keyData: Partial<CloudflareKey>): Promise<CloudflareKey> => {
  const { id, ...data } = keyData;
  const endpoint = id ? `/admin/cloudflare-keys/${id}/` : '/admin/cloudflare-keys/';
  const method = id ? 'PUT' : 'POST';
  const savedData = await api(endpoint, {
    method,
    body: JSON.stringify({
      email: data.email, api_key: data.apiKey, tenant: data.tenantId,
    }),
  });
  return mapToCloudflareKey(savedData);
};

export const updateUserProfile = async (userData: any): Promise<User> => {
  // Extrair apenas os campos necessários para atualizar o perfil
  const simpleData = {
    first_name: userData.get('first_name') || '',
    last_name: userData.get('last_name') || '',
    email: userData.get('email') || '',
  };
  
  // Se houver senha, adicione-a
  if (userData.get('password')) {
    simpleData['password'] = userData.get('password');
  }
  
  // Enviar como JSON em vez de FormData para evitar problemas de parsing no backend
  const savedData = await api('/admin/profile/', {
    method: 'PUT',
    body: JSON.stringify(simpleData),
    headers: {
      'Content-Type': 'application/json'
    },
  });
  return mapToUser(savedData);
};

export const deleteUser = (userId: string): Promise<void> => {
  return api(`/admin/users/${userId}/`, { method: 'DELETE' });
};

export const deleteDomain = (domainId: string): Promise<void> => {
  return api(`/admin/domains/${domainId}/`, { method: 'DELETE' });
};

export const deleteCloudflareKey = (keyId: string): Promise<void> => {
  return api(`/admin/cloudflare-keys/${keyId}/`, { method: 'DELETE' });
};

export const getTenantManagers = async (tenantId: string): Promise<TenantManager[]> => {
  const data = await api(`/admin/tenants/${tenantId}/managers/`);
  return data.map((manager: any) => ({ id: String(manager.id), name: manager.full_name, email: manager.email }));
};

export const addTenantManager = async (tenantId: string, userId: string): Promise<void> => {
  return api(`/admin/tenants/${tenantId}/managers/`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
};

export const removeTenantManager = async (tenantId: string, userId: string): Promise<void> => {
  return api(`/admin/tenants/${tenantId}/managers/${userId}/`, { method: 'DELETE' });
};
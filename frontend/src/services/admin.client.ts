// src/services/admin.client.ts
// Versão client-side do serviço admin para uso em componentes client

import { DashboardStats, Tenant, TenantManager, User, Domain, CloudflareKey, RecentSubdomain, DNSRecord } from '@/lib/definitions';
import Cookies from 'js-cookie';

// --- MAPEADORES DE DADOS ---

const mapToUser = (data: any): User => ({
  id: String(data.id),
  name: data.full_name || `${data.first_name} ${data.last_name}`.trim() || data.email,
  email: data.email,
  role: data.role,
  isActive: data.is_active,
  createdAt: data.date_joined,
  permissions: data.permissions || [], // Garante que permissions sempre está presente
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

const mapToTenant = (data: any): Tenant => ({
    id: String(data.id),
    name: data.name,
    createdAt: data.created_at,
    ownerEmail: data.owner_email,
    cloudflare_email: data.cloudflare_email,
    managers: data.managers || [],
    domains: data.domains || [],
});

const mapToCloudflareKey = (data: any): CloudflareKey => ({
    id: String(data.id),
    email: data.email,
    tenantId: String(data.tenant),
    tenantName: data.tenant_name,
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

const mapToDNSRecord = (data: any): DNSRecord => ({
    id: String(data.id),
    name: data.name,
    recordType: data.record_type,
    content: data.content,
    ttl: data.ttl,
    proxied: data.proxied,
    domainId: String(data.domain),
    domainName: data.domain_name || '',
    createdAt: data.created_at || '',
});

// --- FUNÇÕES DE API ---

// Função auxiliar para fazer requisições à API
const api = async (endpoint: string, options: RequestInit = {}) => {
    const accessToken = localStorage.getItem('access_token') || Cookies.get('access_token');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });
    
    if (!response.ok) {
        throw new Error(`Erro na comunicação com a API (status: ${response.status})`);
    }
    
    return response.json();
};

// --- FUNÇÕES DE DASHBOARD ---

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const data = await api('/admin/dashboard-stats/');
    return {
        totalTenants: data.totalTenants || 0,
        totalDomains: data.totalDomains || 0,
        totalUsers: data.totalUsers || 0,
    };
};

export const getRecentSubdomains = async (): Promise<RecentSubdomain[]> => {
    const data = await api('/admin/recent-subdomains/');
    return data.map(mapToRecentSubdomain);
};

// --- FUNÇÕES DE USUÁRIO ---

export const getUserProfile = async (): Promise<User> => {
    const data = await api('/admin/profile/');
    return mapToUser(data);
};

export const getUsers = async (): Promise<User[]> => {
    const data = await api('/admin/users/');
    return data.map(mapToUser);
};

export const getUserById = async (userId: string): Promise<User> => {
    const data = await api(`/admin/users/${userId}/`);
    return mapToUser(data);
};

export const deleteUserClient = async (userId: string): Promise<void> => {
    await api(`/admin/users/${userId}/`, { method: 'DELETE' });
};

// --- FUNÇÕES DE TENANT ---

export const getTenantsClient = async (): Promise<Tenant[]> => {
    const data = await api('/admin/tenants/');
    return data.map(mapToTenant);
};

export const getTenantById = async (tenantId: string): Promise<Tenant> => {
    const data = await api(`/admin/tenants/${tenantId}/`);
    return mapToTenant(data);
};

export const deleteTenantClient = async (tenantId: string): Promise<void> => {
    await api(`/admin/tenants/${tenantId}/`, { method: 'DELETE' });
};

export const getTenantManagersClient = async (tenantId: string): Promise<TenantManager[]> => {
    const data = await api(`/admin/tenants/${tenantId}/managers/`);
    return data;
};

export const addTenantManagerClient = async (tenantId: string, userId: string): Promise<void> => {
    await api(`/admin/tenants/${tenantId}/managers/`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
    });
};

export const removeTenantManagerClient = async (tenantId: string, userId: string): Promise<void> => {
    await api(`/admin/tenants/${tenantId}/managers/${userId}/`, {
        method: 'DELETE',
    });
};

// --- FUNÇÕES DE DOMÍNIO ---

export const getDomainsClient = async (): Promise<Domain[]> => {
    const data = await api('/admin/domains/');
    return data.map(mapToDomain);
};

export const getDomainsByTenantId = async (tenantId: string): Promise<Domain[]> => {
    const data = await api(`/admin/tenants/${tenantId}/domains/`);
    return data.map(mapToDomain);
};

export const getDomainById = async (domainId: string): Promise<Domain> => {
    const data = await api(`/admin/domains/${domainId}/`);
    return mapToDomain(data);
};

export const deleteDomainClient = async (domainId: string): Promise<void> => {
    await api(`/admin/domains/${domainId}/`, { method: 'DELETE' });
};

// Função para sincronizar domínios com a Cloudflare
export const syncDomainsWithCloudflare = async (tenantId: string): Promise<any> => {
    const response = await api(`/admin/tenants/${tenantId}/sync-domains/`, {
        method: 'POST'
    });
    return response;
};

// --- FUNÇÕES DE DNS RECORDS ---

export const getDNSRecords = async (domainId: string): Promise<DNSRecord[]> => {
    const data = await api(`/admin/domains/${domainId}/dns-records/`);
    return data.map(mapToDNSRecord);
};

export const getA_AAAARecords = async (domainId: string): Promise<DNSRecord[]> => {
    const data = await api(`/admin/domains/${domainId}/a-records/`);
    return data.map(mapToDNSRecord);
};

export const deleteDNSRecord = async (recordId: string): Promise<void> => {
    await api(`/admin/dns-records/${recordId}/`, { method: 'DELETE' });
};

// Função para obter registros DNS personalizados
export const getCustomDNSRecords = async (domainId: string): Promise<DNSRecord[]> => {
    const data = await api(`/admin/domains/${domainId}/dnsrecords/custom/`);
    return data.map(mapToDNSRecord);
};

// Função para obter estatísticas de visitantes únicos de um domínio
export const getDomainUniqueVisitors = async (domainId: string): Promise<any> => {
    try {
        const data = await api(`/admin/domains/${domainId}/analytics/`);
        return data;
    } catch (error) {
        // Em caso de erro, retorna dados vazios
        return { visitors: 0, pageviews: 0, data: [] };
    }
};

// --- FUNÇÕES DE CLOUDFLARE KEYS ---

export const getCloudflareKeys = async (): Promise<CloudflareKey[]> => {
    const data = await api('/admin/cloudflare-keys/');
    return data.map(mapToCloudflareKey);
};

export const deleteCloudflareKey = async (keyId: string): Promise<void> => {
    await api(`/admin/cloudflare-keys/${keyId}/`, { method: 'DELETE' });
};

// --- FUNÇÕES DE PERMISSÕES ---

export const getUserDomainPermissions = async (): Promise<any[]> => {
    const data = await api('/admin/user-domain-permissions/');
    return data;
};

export const deleteUserDomainPermission = async (permissionId: string): Promise<void> => {
    await api(`/admin/user-domain-permissions/${permissionId}/`, { method: 'DELETE' });
};

// Função para salvar permissão de domínio de usuário
export const saveUserDomainPermission = async (data: any): Promise<any> => {
    const { id, ...payload } = data;
    const endpoint = id ? `/admin/user-domain-permissions/${id}/` : '/admin/user-domain-permissions/';
    const method = id ? 'PUT' : 'POST';
    
    const response = await api(endpoint, {
        method,
        body: JSON.stringify(payload),
    });
    
    return response;
};

// Função para obter permissão de domínio de usuário por usuário e domínio
export const getUserDomainPermissionByUserAndDomain = async (userId: string, domainId: string): Promise<any> => {
    const data = await api(`/admin/user-domain-permissions/?user=${userId}&domain=${domainId}`);
    return data.length > 0 ? data[0] : null;
};

// --- FUNÇÕES DE VERIFICAÇÃO ---

// Verifica se um usuário é gerente de algum tenant
export const isUserManagerOfAnyTenant = async (userId: string): Promise<boolean> => {
    try {
        // Abordagem mais eficiente: buscar diretamente os tenants onde o usuário é gerente
        const response = await api(`/admin/users/${userId}/is-manager/`);
        const isManager = response.is_manager === true;
        return isManager;
    } catch (error) {
        // Em caso de erro, vamos tentar a abordagem alternativa
        try {
            const tenants = await getTenantsClient();
            
            // Verifica se o usuário é gerente de algum tenant
            for (const tenant of tenants) {
                const managers = await getTenantManagersClient(tenant.id);
                const isManager = managers.some(manager => String(manager.id) === String(userId));
                if (isManager) {
                    return true;
                }
            }
            
            return false;
        } catch (secondError) {
            return false;
        }
    }
};
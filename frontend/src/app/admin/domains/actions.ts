"use server";

import { deleteDomain as deleteDomainFromService, saveDomain as saveDomainFromService, getDomains, getTenants, getUsers } from "@/services/admin.service";
import { Domain, Tenant, User } from "@/lib/definitions";

export async function deleteDomain(domainId: string) {
  try {
    await deleteDomainFromService(domainId);
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao excluir domínio na Server Action:", error);
    return { success: false, error: error.message || "Falha ao excluir domínio." };
  }
}

export async function saveDomain(domainData: Partial<Domain>) {
  try {
    const savedDomain = await saveDomainFromService(domainData);
    return { success: true, domain: savedDomain };
  } catch (error: any) {
    console.error("Erro ao salvar domínio na Server Action:", error);
    return { success: false, error: error.message || "Falha ao salvar domínio." };
  }
}

export async function getDomainsAction(): Promise<{ success: boolean; domains?: Domain[]; error?: string }> {
  try {
    const domains = await getDomains();
    return { success: true, domains };
  } catch (error: any) {
    console.error("Erro ao buscar domínios na Server Action:", error);
    return { success: false, error: error.message || "Erro desconhecido." };
  }
}

export async function getTenantsAction(): Promise<{ success: boolean; tenants?: Tenant[]; error?: string }> {
  try {
    const tenants = await getTenants();
    return { success: true, tenants };
  } catch (error: any) {
    console.error("Erro ao buscar clientes na Server Action:", error);
    return { success: false, error: error.message || "Erro desconhecido." };
  }
}

export async function getUsersAction(): Promise<{ success: boolean; users?: User[]; error?: string }> {
  try {
    const users = await getUsers();
    return { success: true, users };
  } catch (error: any) {
    console.error("Erro ao buscar usuários na Server Action:", error);
    return { success: false, error: error.message || "Erro desconhecido." };
  }
}

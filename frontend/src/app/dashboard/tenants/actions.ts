"use server";

import { createTenant as createTenantService, updateTenant as updateTenantService, deleteTenant as deleteTenantService, getTenantManagers, addTenantManager, removeTenantManager, getUsers } from "@/services/admin.service";
import { Tenant, TenantManager, User } from "@/lib/definitions";

export async function createTenant(formData: { name: string; cloudflare_api_key: string; cloudflare_email: string }) {
  try {
    const newTenant = await createTenantService(formData);
    return { success: true, tenant: newTenant };
  } catch (error: any) {
    console.error("Erro ao criar cliente na Server Action:", error);
    return { success: false, error: error.message || "Erro desconhecido." };
  }
}

export async function updateTenant(id: string, formData: Partial<Tenant>) {
  try {
    const updatedTenant = await updateTenantService({ id, ...formData });
    return { success: true, tenant: updatedTenant };
  } catch (error: any) {
    console.error("Erro ao atualizar cliente na Server Action:", error);
    return { success: false, error: error.message || "Erro desconhecido." };
  }
}

export async function deleteTenant(id: string) {
  try {
    await deleteTenantService(id);
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao excluir cliente na Server Action:", error);
    return { success: false, error: error.message || "Erro desconhecido." };
  }
}

export async function getTenantManagersAction(tenantId: string): Promise<{ success: boolean; managers?: TenantManager[]; error?: string }> {
  try {
    const managers = await getTenantManagers(tenantId);
    return { success: true, managers };
  } catch (error: any) {
    console.error("Erro ao buscar gerentes do cliente na Server Action:", error);
    return { success: false, error: error.message || "Erro desconhecido." };
  }
}

export async function addTenantManagerAction(tenantId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await addTenantManager(tenantId, userId);
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao adicionar gerente do cliente na Server Action:", error);
    return { success: false, error: error.message || "Erro desconhecido." };
  }
}

export async function removeTenantManagerAction(tenantId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await removeTenantManager(tenantId, userId);
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao remover gerente do cliente na Server Action:", error);
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

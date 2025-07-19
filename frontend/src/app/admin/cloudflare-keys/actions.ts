"use server";

import { deleteCloudflareKey as deleteCloudflareKeyFromService, saveCloudflareKey as saveCloudflareKeyFromService, getTenants as getTenantsFromService } from "@/services/admin.service";

export interface CloudflareKey {
  id: string;
  email: string;
  apiKey?: string;
  tenantId: string;
  tenantName: string;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
  ownerEmail: string;
  cloudflare_email: string; // Adicionado para refletir o campo usado no formulário
  cloudflare_api_key?: string; // Adicionado para validação ao editar
  domains: Domain[]; // Adicionar a lista de domínios
}

export interface Domain {
  id: string;
  name: string;
  proxied: boolean;
}

export async function deleteCloudflareKey(keyId: string) {
  try {
    await deleteCloudflareKeyFromService(keyId);
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir chave Cloudflare na Server Action:", error);
    return { success: false, error: "Falha ao excluir chave Cloudflare." };
  }
}

export async function saveCloudflareKey(keyData: Partial<CloudflareKey>) {
  try {
    const savedKey = await saveCloudflareKeyFromService(keyData);
    return { success: true, key: savedKey };
  } catch (error) {
    console.error("Erro ao salvar chave Cloudflare na Server Action:", error);
    return { success: false, error: "Falha ao salvar chave Cloudflare." };
  }
}

export async function getTenants(): Promise<Tenant[]> {
  try {
    const tenants = await getTenantsFromService();
    return tenants;
  } catch (error) {
    console.error("Erro ao buscar tenants na Server Action:", error);
    throw error; // Re-throw para que o componente cliente possa lidar com o erro
  }
}

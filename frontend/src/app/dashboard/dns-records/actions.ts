"use server";

import { createCloudflareDNSRecord, updateCloudflareDNSRecord, deleteCloudflareDNSRecord } from "@/services/admin.service";
import { DNSRecord } from "@/lib/definitions";

export async function createDNSRecord(domainId: string, formData: { name: string; record_type: string; content: string; ttl?: number; proxied?: boolean }) {
  try {
    const payload = { ...formData, type: formData.record_type };
    const newRecord = await createCloudflareDNSRecord(domainId, payload);
    return { success: true, record: newRecord };
  } catch (error: any) {
    console.error("Erro ao criar registro DNS na Server Action:", error);
    return { success: false, error: error.message || "Erro desconhecido." };
  }
}

export async function updateDNSRecord(domainId: string, formData: Partial<DNSRecord> & { id: string }) {
  try {
    const updatedRecord = await updateCloudflareDNSRecord(domainId, formData.id, {
      name: formData.name!,
      record_type: formData.recordType!,
      content: formData.content!,
      ttl: formData.ttl,
      proxied: formData.proxied,
    });
    return { success: true, record: updatedRecord };
  } catch (error: any) {
    console.error("Erro ao atualizar registro DNS na Server Action:", error);
    return { success: false, error: error.message || "Erro desconhecido." };
  }
}

export async function deleteDNSRecord(domainId: string, recordId: string) {
  try {
    await deleteCloudflareDNSRecord(domainId, recordId);
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao excluir registro DNS na Server Action:", error);
    return { success: false, error: error.message || "Erro desconhecido." };
  }
} 
"use server";

import { deleteUser as deleteUserFromService, saveUser as saveUserFromService } from "@/services/admin.service";

export async function deleteUser(userId: string) {
  try {
    await deleteUserFromService(userId);
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir usuário na Server Action:", error);
    return { success: false, error: "Falha ao excluir usuário." };
  }
}

export async function saveUser(userData: any, isFormData: boolean = false) {
  try {
    const savedUser = await saveUserFromService(userData, isFormData);
    return { success: true, user: savedUser };
  } catch (error) {
    console.error("Erro ao salvar usuário na Server Action:", error);
    return { success: false, error: "Falha ao salvar usuário." };
  }
}
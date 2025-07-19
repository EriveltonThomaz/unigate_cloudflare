"use server";

import { updateUserProfile } from "@/services/admin.service";

export async function updateProfile(userData: FormData) {
  try {
    const savedUser = await updateUserProfile(userData);
    return { success: true, user: savedUser };
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Falha ao atualizar perfil." 
    };
  }
}
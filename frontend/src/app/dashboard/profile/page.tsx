import React, { Suspense } from 'react';
import ProfileForm from '@/components/admin/profile/ProfileForm';
import { getUserProfile } from '@/services/admin.service';
import { UserTableSkeleton } from '@/components/admin/users/UserTable'; // Reutilizando o esqueleto

/**
 * Página de Perfil do Usuário.
 * 
 * Este é um Server Component que busca os dados do perfil do usuário
 * e os passa para o componente cliente ProfileForm.
 */
export default async function UserProfilePage() {
  const initialUser = await getUserProfile();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-foreground">Meu Perfil</h1>
      <Suspense fallback={<UserTableSkeleton />}> {/* Usando um esqueleto genérico */}
        <ProfileForm initialUser={initialUser} />
      </Suspense>
    </div>
  );
} 
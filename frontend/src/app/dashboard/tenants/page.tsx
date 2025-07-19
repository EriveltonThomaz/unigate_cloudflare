import React, { Suspense } from 'react';
import { getTenants, getUserProfile } from '@/services/admin.service';
import TenantPageClient from '@/components/admin/tenants/TenantPageClient';
import { UserTableSkeleton } from '@/components/admin/users/UserTable';

export default async function AdminTenantsPage() {
  const [initialTenants, userProfile] = await Promise.all([
    getTenants(),
    getUserProfile(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<UserTableSkeleton />}> {/* Usando um esqueleto genérico */}
        <TenantPageClient initialTenants={initialTenants} userRole={userProfile.role} />
      </Suspense>
    </div>
  );
}

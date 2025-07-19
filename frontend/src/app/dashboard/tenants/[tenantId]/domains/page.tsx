import DomainPageClient from '@/components/admin/domains/DomainPageClient';
import { getUserProfile } from '@/services/admin.service';

export default async function TenantDomainsPage({ params }: { params: { tenantId: string } }) {
  const userProfile = await getUserProfile();
  return <DomainPageClient tenantId={params.tenantId} userRole={userProfile.role} permissions={userProfile.permissions || []} />;
}

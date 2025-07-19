import React from 'react';
import DNSRecordsClientPage from './DNSRecordsClientPage';
import { getUserProfile } from '@/services/admin.service';

export default async function DNSRecordsServerPage() {
  const userProfile = await getUserProfile();
  const userRole = userProfile?.role || 'user';

  return <DNSRecordsClientPage userRole={userRole} />;
}
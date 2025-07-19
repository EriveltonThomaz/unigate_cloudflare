import React from 'react';
import TenantForm from '@/components/admin/tenants/TenantForm';

export default function NewTenantPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-foreground">Novo Cliente</h1>
      <TenantForm />
    </div>
  );
}

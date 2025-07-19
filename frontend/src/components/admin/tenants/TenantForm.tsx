"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTenant } from '@/app/dashboard/tenants/actions';

const TenantForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    cloudflare_api_key: '',
    cloudflare_email: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const result = await createTenant(formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Cliente criado com sucesso!' });
        router.push('/admin/tenants'); // Redireciona para a lista de clientes
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao criar cliente.' });
      }
    } catch (error) {
      console.error('Falha ao criar cliente:', error);
      setMessage({ type: 'error', text: 'Erro inesperado ao criar cliente.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-lg bg-card p-6 shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Cliente</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="cloudflare_email">Email Cloudflare</Label>
          <Input
            id="cloudflare_email"
            name="cloudflare_email"
            type="email"
            value={formData.cloudflare_email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="cloudflare_api_key">Chave da API Cloudflare</Label>
          <Input
            id="cloudflare_api_key"
            name="cloudflare_api_key"
            type="password"
            value={formData.cloudflare_api_key}
            onChange={handleInputChange}
            required
          />
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Criando...' : 'Criar Cliente'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TenantForm;

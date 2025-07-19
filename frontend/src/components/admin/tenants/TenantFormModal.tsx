"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Tenant } from '@/app/admin/cloudflare-keys/actions'; // Reutilizando a interface Tenant
import { createTenant, updateTenant } from '@/app/dashboard/tenants/actions';

interface TenantFormModalProps {
  tenant: Tenant | null;
  onClose: () => void;
  onSave: (tenant: Tenant) => void;
}

const TenantFormModal = ({ tenant, onClose, onSave }: TenantFormModalProps) => {
  const [formData, setFormData] = useState({
    name: tenant?.name || '',
    cloudflare_api_key: '',
    cloudflare_email: tenant?.cloudflare_email || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cloudflareEmailValid, setCloudflareEmailValid] = useState<boolean | null>(null);
  const [cloudflareEmailError, setCloudflareEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        cloudflare_api_key: '', // Nunca pré-preencher a chave por segurança
        cloudflare_email: tenant.cloudflare_email || '',
      });
    }
  }, [tenant]);

  const originalEmail = tenant?.cloudflare_email || '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpa o erro se o e-mail voltar ao original
    if (name === 'cloudflare_email' && value === originalEmail) {
      setCloudflareEmailError(null);
      setCloudflareEmailValid(true);
    }
  };

  const validateEmail = (email: string) => {
    // Validação simples de e-mail
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  };

  const checkCloudflareEmail = async (email: string, apiKey: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(`${apiUrl}/cloudflare/validate-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email, api_key: apiKey })
      });
      const data = await res.json();
      setCloudflareEmailValid(data.valid === true);
      setCloudflareEmailError(data.valid ? null : (data.error || 'E-mail não encontrado ou inválido na Cloudflare.'));
      return data.valid === true;
    } catch (err) {
      setCloudflareEmailValid(false);
      setCloudflareEmailError('Erro ao validar e-mail na Cloudflare.');
      return false;
    }
  };

  const handleCloudflareEmailBlur = async () => {
    if (formData.cloudflare_email && formData.cloudflare_api_key) {
      await checkCloudflareEmail(formData.cloudflare_email, formData.cloudflare_api_key);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    if (!validateEmail(formData.cloudflare_email)) {
      setMessage({ type: 'error', text: 'E-mail inválido.' });
      setIsSaving(false);
      return;
    }

    // Só valida se o e-mail foi alterado em relação ao original
    if (formData.cloudflare_email !== originalEmail) {
      const apiKeyToValidate = formData.cloudflare_api_key || (tenant && tenant.cloudflare_api_key ? tenant.cloudflare_api_key : '');
      if (!apiKeyToValidate) {
        setMessage({ type: 'error', text: 'Email Cloudflare não é válido para a Chave da API Cloudflare cadastrada.' });
        setIsSaving(false);
        return;
      }
      const isValid = await checkCloudflareEmail(formData.cloudflare_email, apiKeyToValidate);
      if (!isValid) {
        setMessage({ type: 'error', text: cloudflareEmailError || 'E-mail não encontrado ou inválido na Cloudflare.' });
        setIsSaving(false);
        return;
      }
    }

    try {
      let result;
      if (tenant) {
        // Atualizar
        result = await updateTenant(tenant.id, formData);
      } else {
        // Criar
        result = await createTenant(formData);
      }

      if (result.success) {
        setMessage({ type: 'success', text: `Cliente ${tenant ? 'atualizado' : 'criado'} com sucesso!` });
        onSave(result.tenant); // Passa o tenant salvo de volta para a lista
        onClose();
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao salvar cliente.' });
      }
    } catch (error) {
      console.error('Falha ao salvar cliente:', error);
      setMessage({ type: 'error', text: 'Erro inesperado ao salvar cliente.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl border border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{tenant ? 'Editar Cliente' : 'Adicionar Cliente'}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              onBlur={handleCloudflareEmailBlur}
              required
            />
            {cloudflareEmailValid === false && cloudflareEmailError && (
              <div className="text-red-600 text-xs mt-1">{cloudflareEmailError}</div>
            )}
          </div>
          <div>
            <Label htmlFor="cloudflare_api_key">Chave da API Cloudflare</Label>
            <Input
              id="cloudflare_api_key"
              name="cloudflare_api_key"
              type="password"
              value={formData.cloudflare_api_key}
              onChange={handleInputChange}
              placeholder={tenant ? 'Deixe em branco para não alterar' : ''}
              required={!tenant} // Requerido apenas na criação
            />
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantFormModal;

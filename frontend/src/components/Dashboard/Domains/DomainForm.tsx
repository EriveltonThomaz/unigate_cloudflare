"use client";

import React, { useState, useEffect } from 'react';
import api from '@/services/api';

interface DomainFormProps {
  initialData?: { id?: number; name: string; tenant: number; cloudflare_zone_id?: string };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DomainForm({ initialData, onSuccess, onCancel }: DomainFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [tenant, setTenant] = useState(initialData?.tenant || 1); // Default tenant ID
  const [proxied, setProxied] = useState(initialData?.proxied || true); // Adicionado campo proxied
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTenant(initialData.tenant);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const method = initialData?.id ? 'put' : 'post';
    const url = initialData?.id ? `/domains/${initialData.id}/` : `/domains/`;

    try {
      await api[method](url, { name, tenant, proxied });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao salvar domínio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome do Domínio
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="tenant" className="block text-sm font-medium text-gray-700">
          ID do Tenant
        </label>
        <input
          type="number"
          id="tenant"
          value={tenant}
          onChange={(e) => setTenant(parseInt(e.target.value))}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

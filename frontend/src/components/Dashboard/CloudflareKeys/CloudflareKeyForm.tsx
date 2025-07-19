"use client";

import React, { useState, useEffect } from 'react';
import api from '@/services/api';

interface CloudflareKeyFormProps {
  initialData?: { id?: number; email: string; api_key: string; is_active: boolean };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CloudflareKeyForm({ initialData, onSuccess, onCancel }: CloudflareKeyFormProps) {
  const [email, setEmail] = useState(initialData?.email || '');
  const [api_key, setApiKey] = useState(initialData?.api_key || '');
  const [is_active, setIsActive] = useState(initialData?.is_active || true);
  const [name, setName] = useState(initialData?.name || ''); // Adicionado campo name
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setEmail(initialData.email);
      setApiKey(initialData.api_key);
      setIsActive(initialData.is_active);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const method = initialData?.id ? 'put' : 'post';
    const url = initialData?.id ? `/auth/cloudflare-keys/${initialData.id}/` : `/auth/cloudflare-keys/`;

    try {
      await api[method](url, { email, api_key, is_active, name });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao salvar chave da Cloudflare.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome da Chave
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
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email da Cloudflare
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="api_key" className="block text-sm font-medium text-gray-700">
          Chave da API Global
        </label>
        <input
          type="text"
          id="api_key"
          value={api_key}
          onChange={(e) => setApiKey(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={is_active}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
          Ativa
        </label>
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

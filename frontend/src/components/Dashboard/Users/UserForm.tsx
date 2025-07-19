"use client";

import React, { useState, useEffect } from 'react';
import api from '@/services/api';

interface UserFormProps {
  initialData?: { id?: number; email: string; first_name: string; last_name: string; role: string; is_active: boolean };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UserForm({ initialData, onSuccess, onCancel }: UserFormProps) {
  const [email, setEmail] = useState(initialData?.email || '');
  const [first_name, setFirstName] = useState(initialData?.first_name || '');
  const [last_name, setLastName] = useState(initialData?.last_name || '');
  const [role, setRole] = useState(initialData?.role || 'colaborador');
  const [is_active, setIsActive] = useState(initialData?.is_active || true);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setEmail(initialData.email);
      setFirstName(initialData.first_name);
      setLastName(initialData.last_name);
      setRole(initialData.role);
      setIsActive(initialData.is_active);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const method = initialData?.id ? 'put' : 'post';
    const url = initialData?.id ? `/auth/users/${initialData.id}/` : `/auth/users/`;

    try {
      const userData: any = { email, first_name, last_name, role, is_active };
      if (password) {
        userData.password = password;
      }

      await api[method](url, userData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao salvar usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
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
        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
          Nome
        </label>
        <input
          type="text"
          id="first_name"
          value={first_name}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
          Sobrenome
        </label>
        <input
          type="text"
          id="last_name"
          value={last_name}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="colaborador">Colaborador</option>
          <option value="administrador">Administrador</option>
        </select>
      </div>
      <div>
        <label htmlFor="is_active" className="block text-sm font-medium text-gray-700">
          Ativo
        </label>
        <input
          type="checkbox"
          id="is_active"
          checked={is_active}
          onChange={(e) => setIsActive(e.target.checked)}
          className="mt-1 rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Senha (deixe em branco para não alterar)
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

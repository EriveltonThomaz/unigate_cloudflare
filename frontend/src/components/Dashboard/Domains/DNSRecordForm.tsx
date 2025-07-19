"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { getA_AAAARecords } from '@/services/admin.client';
import { toast } from 'sonner';

interface DNSRecordFormProps {
  domainId: number;
  initialData?: { id?: number; name: string; record_type: string; content: string; proxied: boolean; ttl?: number; priority?: number };
  onSuccess: () => void;
  onCancel: () => void;
  userRole: string; // Adiciona a propriedade userRole
}

const TTL_OPTIONS = [
  { label: 'Auto', value: 1 }, // Cloudflare uses 1 for automatic TTL
  { label: '1 minuto', value: 60 },
  { label: '2 minutos', value: 120 },
  { label: '5 minutos', value: 300 },
  { label: '10 minutos', value: 600 },
  { label: '15 minutos', value: 900 },
  { label: '30 minutos', value: 1800 },
  { label: '1 hora', value: 3600 },
  { label: '2 horas', value: 7200 },
  { label: '5 horas', value: 18000 },
  { label: '12 horas', value: 43200 },
  { label: '1 dia', value: 86400 },
];

export default function DNSRecordForm({ domainId, initialData, onSuccess, onCancel, userRole }: DNSRecordFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [record_type, setRecordType] = useState(initialData?.record_type || (userRole !== 'admin' ? 'CNAME' : 'A'));
  const [content, setContent] = useState(initialData?.content || '');
  const [ttl, setTtl] = useState(initialData?.ttl || 1);
  const [proxied, setProxied] = useState(initialData?.proxied || false);
  const [priority, setPriority] = useState(initialData?.priority || undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aAaaaRecords, setAAaaaRecords] = useState<any[]>([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setRecordType(initialData.record_type);
      setContent(initialData.content);
      setTtl(initialData.ttl || 1);
      setProxied(initialData.proxied);
      setPriority(initialData.priority || undefined);
    }
  }, [initialData]);

  useEffect(() => {
    if (record_type === 'CNAME') {
      const fetchAAaaaRecords = async () => {
        try {
          const records = await getA_AAAARecords(String(domainId));
          setAAaaaRecords(records);
        } catch (err) {
          console.error('Erro ao buscar registros A/AAAA:', err);
          toast.error('Erro ao carregar registros A/AAAA para CNAME.');
        }
      };
      fetchAAaaaRecords();
    }
  }, [record_type, domainId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validação do conteúdo com base no tipo de registro
    if (record_type === 'A' && !/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(content)) {
      setError('Conteúdo inválido para registro A. Deve ser um endereço IPv4 válido.');
      setLoading(false);
      return;
    }
    if (record_type === 'AAAA' && !/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(content)) {
      setError('Conteúdo inválido para registro AAAA. Deve ser um endereço IPv6 válido.');
      setLoading(false);
      return;
    }
    if (record_type === 'CNAME' && !content) {
      setError('Destino é obrigatório para registro CNAME.');
      setLoading(false);
      return;
    }
    if (record_type === 'MX') {
      if (!content) {
        setError('Servidor de email é obrigatório para registro MX.');
        setLoading(false);
        return;
      }
      if (priority === undefined || isNaN(priority) || priority < 0 || priority > 65535) {
        setError('Prioridade é obrigatória e deve ser um número entre 0 e 65535 para registro MX.');
        setLoading(false);
        return;
      }
    }
    if (record_type === 'TXT' && !content) {
      setError('Conteúdo é obrigatório para registro TXT.');
      setLoading(false);
      return;
    }

    const payload: any = {
      name,
      record_type,
      content,
      ttl,
      proxied: ['A', 'AAAA', 'CNAME'].includes(record_type) ? proxied : false, // Proxied apenas para A, AAAA, CNAME
    };

    if (record_type === 'MX') {
      payload.priority = priority;
    }

    const method = initialData?.id ? 'put' : 'post';
    const url = initialData?.id ? `/dnsrecords/${initialData.id}/` : `/dnsrecords/`;

    try {
      await api[method](url, { domain: domainId, ...payload });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao salvar registro DNS.');
    } finally {
      setLoading(false);
    }
  };

  const availableRecordTypes = userRole === 'admin'
    ? ['A', 'AAAA', 'CNAME', 'MX', 'TXT']
    : ['CNAME'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome (ex: {record_type === 'A' || record_type === 'AAAA' || record_type === 'TXT' ? '@ para raiz, www' : 'www, @'})
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
        <label htmlFor="record_type" className="block text-sm font-medium text-gray-700">
          Tipo de Registro
        </label>
        <select
          id="record_type"
          value={record_type}
          onChange={(e) => {
            setRecordType(e.target.value);
            setContent(''); // Limpa o conteúdo ao mudar o tipo
            setProxied(false); // Reseta proxied
            setPriority(undefined); // Reseta prioridade
          }}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {availableRecordTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Campo Conteúdo / Destino / Servidor de Email */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          {record_type === 'A' ? 'Endereço IPv4' :
           record_type === 'AAAA' ? 'Endereço IPv6' :
           record_type === 'CNAME' ? 'Destino' :
           record_type === 'MX' ? 'Servidor de email' :
           'Conteúdo'}
        </label>
        {record_type === 'CNAME' ? (
          <select
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Selecione um destino</option>
            {aAaaaRecords.map((record) => (
              <option key={record.id} value={record.name}>
                {record.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={record_type === 'A' ? 'Ex: 192.0.2.1' :
                         record_type === 'AAAA' ? 'Ex: 2001:db8::1' :
                         record_type === 'MX' ? 'Ex: mx1.example.com' :
                         ''}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        )}
      </div>

      {/* Campo Prioridade para MX */}
      {record_type === 'MX' && (
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Prioridade (0-65535)
          </label>
          <input
            type="number"
            id="priority"
            value={priority === undefined ? '' : priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            min="0"
            max="65535"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      )}

      {/* TTL */}
      <div>
        <label htmlFor="ttl" className="block text-sm font-medium text-gray-700">
          TTL (Time To Live)
        </label>
        <select
          id="ttl"
          value={ttl}
          onChange={(e) => setTtl(Number(e.target.value))}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {TTL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Proxied (apenas para A, AAAA, CNAME) */}
      {['A', 'AAAA', 'CNAME'].includes(record_type) && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="proxied"
            checked={proxied}
            onChange={(e) => setProxied(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="proxied" className="ml-2 block text-sm text-gray-900">
            Proxied (Cloudflare)
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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


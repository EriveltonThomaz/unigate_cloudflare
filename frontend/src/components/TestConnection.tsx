'use client';

import React, { useState } from 'react';

const TestConnection = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testando...');
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      console.log('API_URL:', API_URL);
      
      // Teste 1: Stats
      const statsResponse = await fetch(`${API_URL}/auth/stats/`);
      if (!statsResponse.ok) {
        throw new Error(`Stats failed: ${statsResponse.status}`);
      }
      const statsData = await statsResponse.json();
      
      // Teste 2: Login
      const loginResponse = await fetch(`${API_URL}/auth/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'temtudonaweb.td@gmail.com',
          password: 'admin123'
        })
      });
      
      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        throw new Error(`Login failed: ${loginResponse.status} - ${errorText}`);
      }
      
      const loginData = await loginResponse.json();
      
      // Teste 3: Users
      const usersResponse = await fetch(`${API_URL}/admin/users/`, {
        headers: {
          'Authorization': `Bearer ${loginData.access}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!usersResponse.ok) {
        const errorText = await usersResponse.text();
        throw new Error(`Users failed: ${usersResponse.status} - ${errorText}`);
      }
      
      const usersData = await usersResponse.json();
      
      setResult(`✅ Sucesso!
API URL: ${API_URL}
Stats: OK
Login: Token recebido
Users: ${usersData.length} usuários encontrados`);
      
    } catch (error: any) {
      console.error('Erro:', error);
      setResult(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Teste de Conexão API</h2>
      <button 
        onClick={testAPI} 
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Testando...' : 'Testar Conexão'}
      </button>
      <pre className="mt-4 p-2 bg-gray-100 rounded whitespace-pre-wrap">
        {result}
      </pre>
    </div>
  );
};

export default TestConnection;
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DemoSimplePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [deviceType, setDeviceType] = useState('');
  
  // Evita problemas de hidratação
  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType('Mobile');
      } else if (width < 1024) {
        setDeviceType('Tablet');
      } else {
        setDeviceType('Desktop');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Demonstração de Melhorias de UI
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Esta página demonstra as melhorias de UI implementadas no projeto.
          </p>
          
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <Button variant="outline">
                Voltar para Home
              </Button>
            </Link>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Dispositivo: {deviceType}
              </span>
              
              <Button 
                variant="outline"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Tema Escuro */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Tema Escuro
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              O tema escuro foi implementado usando next-themes e Tailwind CSS.
              Clique no botão "Tema Escuro/Claro" no topo da página para alternar.
            </p>
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Tema atual:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {theme === 'dark' ? 'Escuro' : 'Claro'}
              </span>
            </div>
          </div>
          
          {/* Card 2: Responsividade */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Responsividade
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              A interface se adapta a diferentes tamanhos de tela.
              Redimensione a janela do navegador para ver a mudança.
            </p>
            <div className="space-y-2">
              <div className="flex items-center p-2 rounded bg-gray-100 dark:bg-gray-700">
                <span className="w-20 text-gray-700 dark:text-gray-300">Mobile:</span>
                <span className={deviceType === 'Mobile' ? 'text-green-500 font-medium' : 'text-gray-500'}>
                  {deviceType === 'Mobile' ? '✓ Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex items-center p-2 rounded bg-gray-100 dark:bg-gray-700">
                <span className="w-20 text-gray-700 dark:text-gray-300">Tablet:</span>
                <span className={deviceType === 'Tablet' ? 'text-green-500 font-medium' : 'text-gray-500'}>
                  {deviceType === 'Tablet' ? '✓ Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex items-center p-2 rounded bg-gray-100 dark:bg-gray-700">
                <span className="w-20 text-gray-700 dark:text-gray-300">Desktop:</span>
                <span className={deviceType === 'Desktop' ? 'text-green-500 font-medium' : 'text-gray-500'}>
                  {deviceType === 'Desktop' ? '✓ Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Card 3: Tratamento de Erros */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Tratamento de Erros
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Implementamos componentes para tratar erros de forma elegante:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
              <li>ErrorBoundary: Captura erros em componentes React</li>
              <li>ConnectionError: Exibe mensagem quando não há conexão com o servidor</li>
              <li>RetryConnection: Tenta reconectar automaticamente</li>
            </ul>
          </div>
          
          {/* Card 4: Loading States */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Loading States
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Implementamos skeletons para melhorar a experiência durante o carregamento:
            </p>
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          
          {/* Card 5: Acessibilidade */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Acessibilidade
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Melhoramos a acessibilidade com:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
              <li>SkipLink: Permite pular para o conteúdo principal (pressione Tab)</li>
              <li>Contraste adequado entre texto e fundo</li>
              <li>Foco visível em elementos interativos</li>
              <li>Textos alternativos para imagens</li>
            </ul>
          </div>
          
          {/* Card 6: Feedback de Ações */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Feedback de Ações
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Implementamos um sistema de toast para notificações:
            </p>
            <div className="p-4 bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 mb-2">
              Operação realizada com sucesso!
            </div>
            <div className="p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300">
              Ocorreu um erro ao processar a solicitação.
            </div>
          </div>
        </div>
        
        <div className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Resumo das Melhorias
          </h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Tema Escuro</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alternância entre temas claro e escuro</p>
              </div>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Responsividade</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Adaptação a diferentes tamanhos de tela</p>
              </div>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Tratamento de Erros</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">ErrorBoundary, ConnectionError, RetryConnection</p>
              </div>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Loading States</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">TableSkeleton, CardSkeleton, FormSkeleton</p>
              </div>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Acessibilidade</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">SkipLink, contraste adequado, foco visível</p>
              </div>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Feedback de Ações</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sistema de toast para notificações</p>
              </div>
            </li>
          </ul>
        </div>
        
        <footer className="mt-12 text-center text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} UniGate - Todos os direitos reservados</p>
        </footer>
      </div>
    </div>
  );
}
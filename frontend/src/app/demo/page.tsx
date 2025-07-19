'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Info,
    AlertTriangle,
    Moon,
    Sun,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggleTailwind from '@/components/ui/ThemeToggleTailwind';
import ErrorBoundaryTailwind from '@/components/ui/ErrorBoundaryTailwind';

// Componente que simula um erro para testar o ErrorBoundary
const ErrorComponent = () => {
    const [shouldError, setShouldError] = useState(false);

    if (shouldError) {
        throw new Error("Este é um erro simulado para testar o ErrorBoundary");
    }

    return (
        <Button
            variant="destructive"
            onClick={() => setShouldError(true)}
        >
            Simular Erro
        </Button>
    );
};

// Componente de ConnectionError com Tailwind
const ConnectionErrorTailwind = ({ message = 'Não foi possível conectar ao servidor', onRetry }) => {
    return (
        <div className="p-8 max-w-md mx-auto my-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
            <div className="text-red-500 dark:text-red-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a3 3 0 010-5.656m-6.364 0a3 3 0 010 5.656m3.536 3.536a9 9 0 010-12.728" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
            </div>

            <h3 className="text-xl font-semibold mb-2 dark:text-white">Erro de Conexão</h3>

            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

            <Button onClick={onRetry} className="flex items-center justify-center">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
            </Button>

            <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                Se o problema persistir, entre em contato com o suporte técnico.
            </p>
        </div>
    );
};

// Componente de TableSkeleton com Tailwind
const TableSkeletonTailwind = ({ rows = 3, columns = 4 }) => {
    return (
        <div className="w-full overflow-hidden rounded-lg shadow-md bg-white dark:bg-gray-800">
            <div className="animate-pulse">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex p-4">
                        {Array.from({ length: columns }).map((_, i) => (
                            <div key={`header-${i}`} className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded mr-2"></div>
                        ))}
                    </div>
                </div>
                <div>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <div key={`row-${rowIndex}`} className="flex p-4 border-b border-gray-100 dark:border-gray-800">
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <div key={`cell-${rowIndex}-${colIndex}`} className="flex-1 h-5 bg-gray-100 dark:bg-gray-700 rounded mr-2"></div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Componente de CardSkeleton com Tailwind
const CardSkeletonTailwind = () => {
    return (
        <div className="w-full rounded-lg shadow-md bg-white dark:bg-gray-800 p-4">
            <div className="animate-pulse">
                <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-4"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
            </div>
        </div>
    );
};

// Componente de FormSkeleton com Tailwind
const FormSkeletonTailwind = ({ fields = 3 }) => {
    return (
        <div className="w-full max-w-md mx-auto">
            <div className="animate-pulse">
                {Array.from({ length: fields }).map((_, i) => (
                    <div key={`field-${i}`} className="mb-4">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"></div>
                    </div>
                ))}
                <div className="flex justify-end mt-6">
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
            </div>
        </div>
    );
};

// Toast simples com Tailwind
const Toast = ({ message, type, onClose }) => {
    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const icons = {
        success: <CheckCircle className="h-5 w-5" />,
        error: <AlertCircle className="h-5 w-5" />,
        warning: <AlertTriangle className="h-5 w-5" />,
        info: <Info className="h-5 w-5" />
    };

    return (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 rounded-lg shadow-lg px-4 py-3 text-white flex items-center ${bgColors[type]}`}>
            <div className="mr-2">
                {icons[type]}
            </div>
            <div>{message}</div>
            <button onClick={onClose} className="ml-4 text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

// Componente principal da página de demonstração
export default function DemoPage() {
    const { theme, setTheme } = useTheme();
    const router = useRouter();

    const [loading, setLoading] = useState({
        table: true,
        card: true,
        form: true
    });

    const [showConnectionError, setShowConnectionError] = useState(false);
    const [toast, setToast] = useState(null);
    const [deviceType, setDeviceType] = useState('');

    // Detecta o tipo de dispositivo
    useEffect(() => {
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

    // Simula o carregamento dos componentes
    useEffect(() => {
        const timers = [
            setTimeout(() => setLoading(prev => ({ ...prev, table: false })), 3000),
            setTimeout(() => setLoading(prev => ({ ...prev, card: false })), 5000),
            setTimeout(() => setLoading(prev => ({ ...prev, form: false })), 7000)
        ];

        return () => timers.forEach(timer => clearTimeout(timer));
    }, []);

    // Função para mostrar toast
    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Skip Link para acessibilidade */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:p-4 focus:bg-blue-600 focus:text-white focus:z-50"
            >
                Pular para o conteúdo principal
            </a>

            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <Button variant="ghost" onClick={() => router.push('/')} className="mr-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Demonstração de Componentes</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Dispositivo: {deviceType}
                        </span>
                        <ThemeToggleTailwind />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="prose dark:prose-invert max-w-none mb-8">
                    <p className="text-lg">
                        Esta página demonstra os componentes e melhorias de UI implementados no projeto.
                        Você pode interagir com os componentes para ver como eles funcionam.
                    </p>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 mb-8"></div>

                {/* Seção 1: Tratamento de Erros */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">1. Tratamento de Erros</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">ErrorBoundary</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Captura erros em componentes React e exibe uma mensagem amigável.
                            </p>

                            <ErrorBoundaryTailwind>
                                <ErrorComponent />
                            </ErrorBoundaryTailwind>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">ConnectionError</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Exibe uma mensagem quando não é possível conectar ao servidor.
                            </p>

                            <Button
                                onClick={() => setShowConnectionError(!showConnectionError)}
                            >
                                {showConnectionError ? 'Esconder' : 'Mostrar'} Erro de Conexão
                            </Button>

                            {showConnectionError && (
                                <div className="mt-4">
                                    <ConnectionErrorTailwind
                                        message="Este é um exemplo de erro de conexão"
                                        onRetry={() => setShowConnectionError(false)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Seção 2: Loading States */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">2. Loading States (Skeletons)</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">TableSkeleton</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Exibe um esqueleto de tabela durante o carregamento.
                            </p>

                            <Button
                                onClick={() => setLoading(prev => ({ ...prev, table: true }))}
                                className="mb-4"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Recarregar
                            </Button>

                            {loading.table ? (
                                <TableSkeletonTailwind rows={3} columns={3} />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">João Silva</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">joao@exemplo.com</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">Ativo</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Maria Santos</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">maria@exemplo.com</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">Inativo</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Pedro Oliveira</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">pedro@exemplo.com</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">Ativo</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">CardSkeleton</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Exibe um esqueleto de card durante o carregamento.
                            </p>

                            <Button
                                onClick={() => setLoading(prev => ({ ...prev, card: true }))}
                                className="mb-4"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Recarregar
                            </Button>

                            {loading.card ? (
                                <CardSkeletonTailwind />
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                                <span>JS</span>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Título do Card</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Subtítulo do Card</p>
                                            </div>
                                        </div>
                                        <Button size="sm">Ação</Button>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Este é um exemplo de conteúdo de card que seria exibido após o carregamento.
                                            O CardSkeleton é exibido enquanto este conteúdo está sendo carregado.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">FormSkeleton</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Exibe um esqueleto de formulário durante o carregamento.
                            </p>

                            <Button
                                onClick={() => setLoading(prev => ({ ...prev, form: true }))}
                                className="mb-4"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Recarregar
                            </Button>

                            {loading.form ? (
                                <FormSkeletonTailwind fields={3} />
                            ) : (
                                <form className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Nome
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Mensagem
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button>Enviar</Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </section>

                {/* Seção 3: Feedback de Ações */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">3. Feedback de Ações (Toast)</h2>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Sistema de Toast</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Exibe notificações temporárias para feedback de ações.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => showToast('Operação realizada com sucesso!', 'success')}
                            >
                                Toast de Sucesso
                            </Button>

                            <Button
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => showToast('Ocorreu um erro ao processar a solicitação.', 'error')}
                            >
                                Toast de Erro
                            </Button>

                            <Button
                                className="bg-blue-500 hover:bg-blue-600"
                                onClick={() => showToast('Esta é uma mensagem informativa.', 'info')}
                            >
                                Toast Informativo
                            </Button>

                            <Button
                                className="bg-yellow-500 hover:bg-yellow-600"
                                onClick={() => showToast('Atenção! Esta ação pode ter consequências.', 'warning')}
                            >
                                Toast de Alerta
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Seção 4: Tema e Responsividade */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">4. Tema e Responsividade</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Tema Escuro</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Alterne entre os temas claro e escuro.
                            </p>

                            <div className="flex items-center space-x-4">
                                <span className="text-gray-700 dark:text-gray-300">Tema atual: {theme === 'dark' ? 'Escuro' : 'Claro'}</span>
                                <Button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="flex items-center"
                                >
                                    {theme === 'dark' ? (
                                        <>
                                            <Sun className="mr-2 h-4 w-4" />
                                            Tema Claro
                                        </>
                                    ) : (
                                        <>
                                            <Moon className="mr-2 h-4 w-4" />
                                            Tema Escuro
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Responsividade</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                A interface se adapta a diferentes tamanhos de tela.
                            </p>

                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center">
                                    <span className="w-24 text-gray-700 dark:text-gray-300">Mobile:</span>
                                    <span className={`ml-2 ${deviceType === 'Mobile' ? 'text-green-500 font-medium' : 'text-gray-500'}`}>
                                        {deviceType === 'Mobile' ? '✓ Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-24 text-gray-700 dark:text-gray-300">Tablet:</span>
                                    <span className={`ml-2 ${deviceType === 'Tablet' ? 'text-green-500 font-medium' : 'text-gray-500'}`}>
                                        {deviceType === 'Tablet' ? '✓ Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-24 text-gray-700 dark:text-gray-300">Desktop:</span>
                                    <span className={`ml-2 ${deviceType === 'Desktop' ? 'text-green-500 font-medium' : 'text-gray-500'}`}>
                                        {deviceType === 'Desktop' ? '✓ Ativo' : 'Inativo'}
                                    </span>
                                </div>
                            </div>

                            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                Redimensione a janela do navegador para ver a mudança.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Resumo das Melhorias */}
                <section className="mt-12">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Resumo das Melhorias</h2>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            <li className="p-4 flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Tratamento de Erros</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">ErrorBoundary, ConnectionError, RetryConnection</p>
                                </div>
                            </li>
                            <li className="p-4 flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Loading States</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">TableSkeleton, CardSkeleton, FormSkeleton</p>
                                </div>
                            </li>
                            <li className="p-4 flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Responsividade</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Adaptação a diferentes tamanhos de tela</p>
                                </div>
                            </li>
                            <li className="p-4 flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Tema Escuro</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Alternância entre temas claro e escuro</p>
                                </div>
                            </li>
                            <li className="p-4 flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Acessibilidade</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">SkipLink para navegação por teclado</p>
                                </div>
                            </li>
                            <li className="p-4 flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Feedback de Ações</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">Sistema de toast para notificações</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 shadow-inner mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                        © {new Date().getFullYear()} UniGate - Demonstração de Componentes
                    </p>
                </div>
            </footer>

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
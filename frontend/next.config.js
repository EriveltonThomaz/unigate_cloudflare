/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Para Next.js 14.2.30, configuração de origens permitidas para desenvolvimento
  experimental: {
    allowedDevOrigins: [
      "https://cloudflare.unigate.com.br",
      "http://192.168.34.19:3000", 
      "http://localhost:3000", 
      "http://192.168.34.65:3000",
      "http://127.0.0.1:3000",
      "192.168.34.65"
    ],
  },
  // Adiciona suporte para exportação standalone
  output: 'standalone',
  // Configurações de CORS para desenvolvimento
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  // Configuração para garantir que o tema escuro funcione corretamente
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

module.exports = nextConfig;

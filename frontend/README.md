# Frontend - UNIATENDE TECHNOLOGY

## Visão Geral

O frontend do sistema UNIATENDE TECHNOLOGY é desenvolvido em Next.js 14 com TypeScript, oferecendo uma interface moderna e responsiva para gerenciamento de domínios e subdomínios via Cloudflare.

## Arquitetura

### Tecnologias
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Framework de estilização
- **Radix UI**: Componentes acessíveis
- **Lucide React**: Ícones modernos
- **Sonner**: Notificações toast

### Estrutura do Projeto

```
frontend/src/
├── app/                    # App Router (Next.js 14)
│   ├── dashboard/         # Páginas do dashboard
│   ├── admin/            # Páginas de administração
│   ├── login/            # Página de login
│   └── layout.tsx        # Layout principal
├── components/            # Componentes React
│   ├── admin/            # Componentes de administração
│   ├── ui/               # Componentes de UI
│   └── Layout/           # Componentes de layout
├── contexts/             # Contextos React
├── lib/                  # Utilitários e definições
├── services/             # Serviços de API
└── styles/               # Estilos globais
```

## Componentes Principais

### Server Components
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return <DashboardClient stats={stats} />;
}
```

### Client Components
```typescript
// components/admin/DNSRecordPageClient.tsx
'use client';

const DNSRecordPageClient = ({ initialDNSRecords, userRole }) => {
  const [records, setRecords] = useState(initialDNSRecords);
  // Lógica de estado e interatividade
};
```

## Sistema de Permissões

### Controle de Acesso por Role
```typescript
// Verificação de permissões
const canManageRecord = (record: DNSRecord) => {
  if (userRole === 'admin') return true;
  return record.recordType === 'CNAME';
};

const canViewRecord = (record: DNSRecord) => {
  if (userRole === 'admin') return true;
  return ['A', 'AAAA', 'CNAME'].includes(record.recordType);
};
```

### Permissões por Tipo de Registro DNS

| Tipo | Admin | Member |
|------|-------|--------|
| A    | ✅ CRUD | 👁️ Apenas visualização |
| AAAA | ✅ CRUD | 👁️ Apenas visualização |
| CNAME| ✅ CRUD | ✅ CRUD |
| MX   | ✅ CRUD | ❌ Sem acesso |
| TXT  | ✅ CRUD | ❌ Sem acesso |

## Páginas Principais

### Página Inicial
- Design moderno com gradientes suaves
- Estatísticas em tempo real
- Acesso direto ao painel

### Dashboard
- Visão geral do sistema
- Estatísticas principais
- Subdomínios recentes
- Navegação rápida

### Gerenciamento de Clientes
- Lista de clientes (tenants)
- Criação e edição de clientes
- Gerenciamento de gerentes
- Visualização de domínios

### Gerenciamento de DNS Records
- Lista de registros DNS
- Filtros por tipo e domínio
- Criação e edição com validações
- Exclusão com confirmação

## Componentes de UI

### Tabelas
```typescript
// components/admin/dns-records/DNSRecordTable.tsx
const DNSRecordTable = ({ dnsRecords, onEdit, onDelete, userRole }) => {
  const filteredRecords = dnsRecords.filter(canViewRecord);
  
  return (
    <table className="w-full">
      {/* Cabeçalho e linhas */}
    </table>
  );
};
```

### Modais
```typescript
// components/admin/dns-records/DNSRecordFormModal.tsx
const DNSRecordFormModal = ({ record, onClose, onSave, userRole }) => {
  const recordTypes = userRole === 'admin' 
    ? ['A', 'AAAA', 'CNAME', 'MX', 'TXT']
    : ['CNAME'];
    
  return (
    <div className="fixed inset-0 z-50">
      {/* Formulário com validações */}
    </div>
  );
};
```

### Formulários
```typescript
// Validação de formulários
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (userRole !== 'admin' && formData.record_type !== 'CNAME') {
    toast.error('Usuários comuns só podem criar registros CNAME');
    return;
  }
  
  // Envio do formulário
};
```

## Serviços de API

### Configuração Base
```typescript
// services/admin.service.ts
const api = async (endpoint: string, options: RequestInit = {}) => {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  return response.json();
};
```

### Funções de Serviço
```typescript
// Buscar dados
export const getDNSRecords = async (domainId?: string): Promise<DNSRecord[]> => {
  const endpoint = domainId ? `/admin/domains/${domainId}/dns-records/` : '/admin/dns-records/';
  const data = await api(endpoint);
  return data.map(mapToDNSRecord);
};

// Criar registro
export const createDNSRecord = async (recordData: CreateDNSRecordData): Promise<DNSRecord> => {
  const savedData = await api('/admin/dns-records/', {
    method: 'POST',
    body: JSON.stringify(recordData),
  });
  return mapToDNSRecord(savedData);
};

// Atualizar registro
export const updateDNSRecord = async (recordData: UpdateDNSRecordData): Promise<DNSRecord> => {
  const { id, ...data } = recordData;
  const savedData = await api(`/admin/dns-records/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapToDNSRecord(savedData);
};

// Excluir registro
export const deleteDNSRecord = (recordId: string): Promise<void> => {
  return api(`/admin/dns-records/${recordId}/`, { method: 'DELETE' });
};
```

## Contextos React

### Autenticação
```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

### Sidebar
```typescript
// contexts/SidebarContext.tsx
interface SidebarContextType {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}
```

## Definições de Tipos

### Interfaces Principais
```typescript
// lib/definitions.ts
export interface DNSRecord {
  id: string;
  name: string;
  recordType: string;
  content: string;
  ttl: number;
  proxied: boolean;
  domainId: string;
  domainName: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  isActive: boolean;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  createdAt: string;
  ownerEmail: string;
  managers: TenantManager[];
}
```

## Estilização

### Tailwind CSS
```css
/* Configuração personalizada */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md border border-gray-200 p-6;
  }
}
```

### Design System
```typescript
// Componentes reutilizáveis
const Button = ({ variant = 'primary', children, ...props }) => {
  const variants = {
    primary: 'bg-green-500 hover:bg-green-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };
  
  return (
    <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};
```

## Configuração

### Variáveis de Ambiente
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Next.js Config
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
```

## Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar produção
npm start
```

### Scripts Disponíveis
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,scss,md}\""
  }
}
```

## Linting e Formatação

### ESLint
```javascript
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

### Prettier
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false
}
```

## Testes

### Configuração de Testes
```typescript
// __tests__/components/DNSRecordTable.test.tsx
import { render, screen } from '@testing-library/react';
import DNSRecordTable from '@/components/admin/dns-records/DNSRecordTable';

describe('DNSRecordTable', () => {
  it('should filter records based on user role', () => {
    const mockRecords = [
      { id: '1', recordType: 'A', name: 'test.com' },
      { id: '2', recordType: 'CNAME', name: 'www.test.com' },
    ];
    
    render(<DNSRecordTable dnsRecords={mockRecords} userRole="member" />);
    
    // Verificar que apenas CNAME é visível para usuários comuns
    expect(screen.queryByText('test.com')).not.toBeInTheDocument();
    expect(screen.getByText('www.test.com')).toBeInTheDocument();
  });
});
```

## Deploy

### Vercel
```bash
# Deploy automático
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Performance

### Otimizações
- Server Components para renderização no servidor
- Lazy loading de componentes
- Otimização de imagens com Next.js Image
- Bundle splitting automático

### Monitoramento
```typescript
// Analytics
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Segurança

### Proteção de Rotas
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
```

### Validação de Dados
```typescript
// Validação de formulários
const validateDNSRecord = (data: DNSRecordFormData) => {
  const errors: string[] = [];
  
  if (!data.name) errors.push('Nome é obrigatório');
  if (!data.content) errors.push('Conteúdo é obrigatório');
  if (data.ttl < 1 || data.ttl > 86400) errors.push('TTL deve estar entre 1 e 86400');
  
  return errors;
};
```

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Adicione testes
5. Execute `npm run lint` e `npm run format`
6. Faça commit das mudanças
7. Abra um Pull Request

## Licença

Este projeto está sob a licença ISC. 
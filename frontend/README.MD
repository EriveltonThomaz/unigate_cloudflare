# Frontend - Cloudflare Multi-Tenant Manager

Este projeto é o frontend do sistema de gerenciamento multi-tenant de domínios e subdomínios integrados à Cloudflare.

## Stack utilizada

- [Next.js](https://nextjs.org/) (React)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [React Query](https://tanstack.com/query/latest)
- [Context API](https://react.dev/reference/react/useContext) (ou Redux Toolkit, se necessário)

## Funcionalidades

- Autenticação de usuários (JWT)
- Controle de acesso por papéis (admin/usuário)
- Cadastro e gestão de usuários e permissões
- Cadastro e gestão de chaves de API da Cloudflare
- Listagem e gerenciamento de domínios e subdomínios
- CRUD de registros DNS
- Interface responsiva e acessível

## Estrutura de diretórios
components
/Auth
/Dashboard
/UI
/pages
/domains
/users
/services
/contexts
/utils


## Como rodar o projeto

1. Instale as dependências:

   ```bash
   npm install
Rode o servidor de desenvolvimento:
bash
Copy Code
npm run dev
Acesse em http://localhost:3000
Configuração do ambiente
Crie um arquivo .env.local com as variáveis de ambiente necessárias, por exemplo:

NEXT_PUBLIC_API_URL=http://localhost:8000
Scripts úteis
npm run dev - Inicia o servidor de desenvolvimento
npm run build - Gera a build de produção
npm run start - Inicia o servidor em produção
Observações
O frontend consome a API REST do backend Django.
Todas as operações sensíveis são protegidas por autenticação JWT.
O painel é responsivo e pode ser acessado de qualquer dispositivo.

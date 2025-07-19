# UniGate - Sistema de Gerenciamento

Sistema de gerenciamento de domínios e DNS com integração com Cloudflare.

## Requisitos

- Docker e Docker Compose
- Git

## Configuração Inicial

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/unigate.git
cd unigate
```

2. Configure os arquivos de ambiente:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

3. Edite os arquivos `.env` conforme necessário.

## Executando com Docker

Para iniciar todos os serviços:

```bash
docker-compose up -d
```

Para inicializar o banco de dados e criar um superusuário:

```bash
docker-compose up init_backend
```

## Acessando a Aplicação

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Admin Django: http://localhost:8000/admin

## Desenvolvimento

### Frontend

O frontend é construído com:

- Next.js
- Material UI
- TypeScript
- Axios para requisições API

Para desenvolvimento local sem Docker:

```bash
cd frontend
pnpm install
pnpm run dev
```

### Backend

O backend é construído com:

- Django
- Django REST Framework
- PostgreSQL
- Cloudflare API

Para desenvolvimento local sem Docker:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Estrutura do Projeto

```
.
├── backend/                # Aplicação Django
│   ├── accounts/           # App de autenticação
│   ├── admin_api/          # API de administração
│   ├── cloudflare_api/     # Integração com Cloudflare
│   ├── core/               # Configurações do projeto
│   ├── domains/            # Gerenciamento de domínios
│   └── tenants/            # Gerenciamento de inquilinos
├── frontend/               # Aplicação Next.js
│   ├── public/             # Arquivos estáticos
│   └── src/                # Código fonte
│       ├── app/            # Páginas da aplicação
│       ├── components/     # Componentes React
│       ├── contexts/       # Contextos React
│       ├── hooks/          # Hooks personalizados
│       ├── services/       # Serviços de API
│       ├── theme/          # Configuração de tema
│       └── utils/          # Utilitários
└── docker-compose.yml      # Configuração Docker
```

## Contribuindo

1. Crie um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
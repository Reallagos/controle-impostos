# 🎯 Sistema de Controle e Comparação de Impostos

Sistema web para que equipes de contabilidade preencham dados de impostos mensalmente e geradores/proprietários possam comparar múltiplas empresas para identificar economias fiscais.

## 📋 Pré-requisitos

- **Node.js:** 18+ ([Download](https://nodejs.org/))
- **Docker:** ([Download](https://www.docker.com/))
- **npm:** 9+ (vem com Node.js)
- **Git**

## 🚀 Início Rápido

### 1. Clone o repositório

```bash
git clone <repository-url>
cd controle-impostos
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env
```

### 3. Instale dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Volte para root
cd ..
```

### 4. Inicie o PostgreSQL

```bash
docker-compose up -d
```

**Verificar se está rodando:**
```bash
docker-compose ps
```

### 5. Inicie o Backend

```bash
cd backend
npm run dev
```

Você deve ver:
```
✅ Connected to PostgreSQL
Server running on http://localhost:3000
```

### 6. Inicie o Frontend (em novo terminal)

```bash
cd frontend
npm run dev
```

Acesse: **http://localhost:5173**

---

## 📚 Estrutura do Projeto

```
controle-impostos/
├── backend/              # API Node.js/Express
│   ├── src/             # Código fonte TypeScript
│   ├── tests/           # Testes unitários
│   └── package.json
├── frontend/            # React/Vite application
│   ├── src/             # Componentes React
│   ├── public/          # Assets estáticos
│   └── package.json
├── docs/                # Documentação
│   ├── prd/             # Product Requirements
│   └── stories/         # Development stories
└── docker-compose.yml   # Configuração PostgreSQL
```

---

## 🧪 Testes

### Backend

```bash
cd backend
npm test                 # Rodar testes
npm run test:watch      # Modo watch
npm run lint            # ESLint
npm run typecheck       # TypeScript check
```

### Frontend

```bash
cd frontend
npm run typecheck       # TypeScript check
npm run lint            # ESLint
```

---

## 🔧 Scripts Disponíveis

### Backend

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor com hot-reload (nodemon) |
| `npm run build` | Compila TypeScript para JavaScript |
| `npm start` | Executa código compilado |
| `npm test` | Executa testes com Jest |
| `npm run lint` | Valida código com ESLint |
| `npm run typecheck` | Verifica tipos TypeScript |

### Frontend

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia dev server com hot-reload (Vite) |
| `npm run build` | Build production |
| `npm run preview` | Preview do build |
| `npm run lint` | Valida código com ESLint |
| `npm run typecheck` | Verifica tipos TypeScript |

---

## 📡 API Endpoints

### Health Check

```bash
GET /api/health

# Response:
{
  "status": "ok",
  "timestamp": "2026-02-22T10:30:00.000Z",
  "uptime": 123.456
}
```

---

## 🗄️ Database

### Conectar ao PostgreSQL

```bash
docker-compose exec postgres psql -U postgres -d controle_impostos_dev
```

### Inicializar banco

O banco é inicializado automaticamente via `init.sql` quando você roda `docker-compose up`.

---

## 🔍 Troubleshooting

### "Cannot find module 'express'"

```bash
cd backend
npm install
```

### "Port 3000 already in use"

```bash
# Encontrar processo usando porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>
```

### "PostgreSQL connection failed"

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Reiniciar
docker-compose down
docker-compose up -d
```

---

## 📖 Documentação

- **[PRD (Product Requirements)](docs/prd/PRD-controle-impostos.md)** — Requisitos completos
- **[EPIC (Orquestração)](docs/stories/EPIC-001-sistema-controle-impostos.md)** — Roadmap de 8 semanas
- **[CONTRIBUTING](CONTRIBUTING.md)** — Padrões de código

---

## 📞 Suporte

Dúvidas? Veja:
1. `docs/` — Documentação técnica
2. Arquivo relevante `*.md` — Instruções específicas
3. Issues no GitHub

---

**Versão:** 0.1.0  
**Status:** Setup Inicial (STORY-1.1)  
**Próximo:** STORY-1.2 — Modelo de Dados

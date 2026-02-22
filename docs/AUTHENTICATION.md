# Autenticação JWT

**Version:** 1.0
**Created:** 2026-02-22
**Status:** ✅ Implementado (STORY-1.3)

---

## Overview

O sistema utiliza **JSON Web Tokens (JWT)** para autenticação. Os usuários fazem login com email/senha e recebem um access token (15 min) e refresh token (7 dias) para acessar APIs protegidas.

---

## Fluxo de Autenticação

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ 1. POST /auth/login (email, password)
       ▼
┌──────────────────────┐
│  Auth Service        │
│  ↓ bcrypt.compare()  │
│  ↓ jwt.sign()        │
└──────┬───────────────┘
       │ 2. Response: { accessToken, refreshToken, user }
       ▼
┌─────────────┐
│   Cliente   │ (armazena tokens)
└──────┬──────┘
       │ 3. GET /api/empresas + Header: Authorization: Bearer <accessToken>
       ▼
┌──────────────────────────────┐
│  Middleware authMiddleware   │
│  ↓ jwt.verify(token)         │
│  ↓ req.user = payload        │
└──────┬───────────────────────┘
       │ 4. Acesso permitido
       ▼
┌──────────────────────┐
│  API Protegida       │
│  (pode acessar req.user)
└──────────────────────┘
```

---

## Endpoints

### **POST /auth/login**

Realiza login do usuário com email e senha.

**Request:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@controle-impostos.dev",
    "password": "admin123"
  }'
```

**Request Body:**
```json
{
  "email": "admin@controle-impostos.dev",
  "password": "admin123"
}
```

**Response 200 OK:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@controle-impostos.dev",
    "nome": "Administrador Sistema",
    "role": "admin"
  }
}
```

**Response 401 Unauthorized:**
```json
{
  "error": "Invalid credentials"
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Email and password are required"
}
```

---

### **POST /auth/refresh**

Renova o access token usando o refresh token.

**Request:**
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200 OK:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 401 Unauthorized:**
```json
{
  "error": "Refresh token expired"
}
```

---

## Usando Access Token em Rotas Protegidas

### **GET /api/empresas** (Protegido)

Requer access token válido no header `Authorization`.

**Request:**
```bash
curl -X GET http://localhost:3000/api/empresas \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response 200 OK:**
```json
{
  "message": "Empresas endpoint (protected)",
  "user": {
    "userId": 1,
    "email": "admin@controle-impostos.dev",
    "role": "admin",
    "iat": 1708614922,
    "exp": 1708615822
  }
}
```

**Response 401 Unauthorized** (sem token ou token inválido):
```json
{
  "error": "No token provided"
}
```

---

## Variáveis de Ambiente

Criar arquivo `.env` na raiz do backend:

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=controle_impostos_dev

# JWT
JWT_SECRET=sua-chave-secreta-minimo-32-caracteres-aqui
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server
NODE_ENV=development
SERVER_PORT=3000
```

### **Gerando JWT_SECRET Seguro**

No WSL/Linux:
```bash
openssl rand -base64 32
```

No PowerShell (Windows):
```powershell
[Convert]::ToBase64String(([byte[]][System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)))
```

---

## Estrutura de JWT

### **Access Token Payload**

```typescript
{
  userId: number;        // ID do usuário
  email: string;         // Email do usuário
  role: string;          // Função (admin, contador, gerente, visualizador)
  iat: number;           // Issued At (timestamp)
  exp: number;           // Expiration (timestamp)
}
```

### **Token Expiry**

- **Access Token:** 15 minutos (segurança)
- **Refresh Token:** 7 dias (conveniência)

Quando o access token expirar, o cliente deve:
1. Chamar `/auth/refresh` com refresh token
2. Receber novo access token
3. Usar novo access token nas próximas requisições

---

## Implementação no Middleware

### **authMiddleware**

Valida JWT no header `Authorization: Bearer <token>` e coloca usuário em `req.user`:

```typescript
import { authMiddleware } from '../middleware/authMiddleware';

// Usar em rotas protegidas
app.get('/api/empresas', authMiddleware, (req, res) => {
  // req.user contém: userId, email, role, iat, exp
  res.json({ user: req.user });
});
```

### **optionalAuthMiddleware**

Valida token se fornecido, mas não rejeita sem token:

```typescript
import { optionalAuthMiddleware } from '../middleware/authMiddleware';

// Token é opcional
app.get('/api/public', optionalAuthMiddleware, (req, res) => {
  if (req.user) {
    // Usuário autenticado
  } else {
    // Usuário anônimo
  }
});
```

---

## Testes

### **Rodar Testes de Autenticação**

```bash
npm test -- auth.service.test.ts
npm test -- auth.middleware.test.ts
npm test -- auth.integration.test.ts
```

### **Casos de Teste Cobertos**

✅ Login com credenciais válidas
✅ Login com credenciais inválidas (401)
✅ Token válido passa no middleware
✅ Token expirado rejeitado (401)
✅ Token inválido rejeitado (401)
✅ Refresh token válido gera novos tokens
✅ Refresh token expirado rejeitado (401)
✅ Rotas protegidas exigem autenticação
✅ Rotas públicas funcionam sem token

---

## Segurança

### **Boas Práticas Implementadas**

✅ **Senhas hasheadas** — bcrypt com SALT_ROUNDS=10
✅ **JWT assinado** — HMAC-SHA256 com JWT_SECRET
✅ **Token expiry** — Access token expira em 15 minutos
✅ **Nenhuma senha em tokens** — Apenas userId, email, role
✅ **Header obrigatório** — Authorization: Bearer <token>

### **Considerações Adicionais (Futuro)**

⚠️ **HTTPS obrigatório em produção** — Proteção contra man-in-the-middle
⚠️ **Token revocation** — Para logout (STORY-1.5)
⚠️ **CSRF protection** — Para formulários
⚠️ **Rate limiting** — Para /auth/login

---

## Próximas Stories

- **STORY-1.4:** RLS no PostgreSQL (usa userId do JWT)
- **STORY-1.5:** Endpoint de logout + token revocation (opcional)
- **STORY-2.1:** CRUD de Empresas com proteção JWT
- **STORY-2.4:** Armazenamento seguro de tokens no frontend

---

## Links Úteis

- [JWT.io](https://jwt.io) — Debugar e entender JWTs
- [jsonwebtoken npm](https://www.npmjs.com/package/jsonwebtoken)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

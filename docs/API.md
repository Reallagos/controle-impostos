# API Documentation

**Version:** 1.0
**Created:** 2026-02-22
**Status:** ✅ Implementado (STORY-2.1)

---

## Overview

API REST para gerenciamento de empresas com autenticação JWT e Row Level Security (RLS). Todos os endpoints requerem token JWT válido no header `Authorization: Bearer <token>`.

---

## Authentication

Veja [AUTHENTICATION.md](./AUTHENTICATION.md) para fluxo completo de login e token refresh.

**Header obrigatório:**
```
Authorization: Bearer {accessToken}
```

---

## Endpoints de Empresas

### **POST /api/empresas**

Criar nova empresa.

**Request:**
```bash
curl -X POST http://localhost:3000/api/empresas \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "cnpj": "12.345.678/0001-90",
    "nome": "Minha Empresa Ltda"
  }'
```

**Request Body:**
```json
{
  "cnpj": "12.345.678/0001-90",
  "nome": "Minha Empresa Ltda"
}
```

**Response 201 Created:**
```json
{
  "id": 1,
  "cnpj": "12.345.678/0001-90",
  "nome": "Minha Empresa Ltda",
  "responsavel_id": 100,
  "ativa": true,
  "criado_em": "2026-02-22T10:30:00Z"
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Invalid CNPJ format"
}
```

**Response 400 (CNPJ duplicado):**
```json
{
  "error": "CNPJ already exists"
}
```

**Response 401 Unauthorized:**
```json
{
  "error": "No token provided"
}
```

---

### **GET /api/empresas**

Listar todas as empresas do usuário autenticado (Row Level Security).

**Request:**
```bash
curl -X GET http://localhost:3000/api/empresas \
  -H "Authorization: Bearer {token}"
```

**Response 200 OK:**
```json
{
  "empresas": [
    {
      "id": 1,
      "cnpj": "12.345.678/0001-90",
      "nome": "Minha Empresa Ltda",
      "responsavel_id": 100,
      "ativa": true,
      "criado_em": "2026-02-22T10:30:00Z",
      "atualizado_em": "2026-02-22T10:30:00Z"
    },
    {
      "id": 2,
      "cnpj": "98.765.432/0001-11",
      "nome": "Outra Empresa SA",
      "responsavel_id": 100,
      "ativa": true,
      "criado_em": "2026-02-22T11:00:00Z",
      "atualizado_em": "2026-02-22T11:00:00Z"
    }
  ],
  "total": 2
}
```

**Response 401 Unauthorized:**
```json
{
  "error": "No token provided"
}
```

---

### **GET /api/empresas/:id**

Obter detalhes de uma empresa específica (com RLS).

**Request:**
```bash
curl -X GET http://localhost:3000/api/empresas/1 \
  -H "Authorization: Bearer {token}"
```

**Response 200 OK:**
```json
{
  "id": 1,
  "cnpj": "12.345.678/0001-90",
  "nome": "Minha Empresa Ltda",
  "responsavel_id": 100,
  "ativa": true,
  "criado_em": "2026-02-22T10:30:00Z",
  "atualizado_em": "2026-02-22T10:30:00Z"
}
```

**Response 404 Not Found:**
```json
{
  "error": "Empresa not found"
}
```

**Response 403 Forbidden (RLS Violation - usuário não tem acesso):**
```json
{
  "error": "Access denied"
}
```

**Response 401 Unauthorized:**
```json
{
  "error": "No token provided"
}
```

---

### **PUT /api/empresas/:id**

Atualizar empresa (parcial update).

**Request:**
```bash
curl -X PUT http://localhost:3000/api/empresas/1 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Nome Atualizado",
    "ativa": true
  }'
```

**Request Body (todos os campos opcionais):**
```json
{
  "cnpj": "12.345.678/0001-90",
  "nome": "Novo Nome",
  "ativa": false
}
```

**Response 200 OK:**
```json
{
  "id": 1,
  "cnpj": "12.345.678/0001-90",
  "nome": "Novo Nome",
  "responsavel_id": 100,
  "ativa": false,
  "criado_em": "2026-02-22T10:30:00Z",
  "atualizado_em": "2026-02-22T11:15:00Z"
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Invalid CNPJ format"
}
```

**Response 403 Forbidden (RLS):**
```json
{
  "error": "Access denied"
}
```

**Response 404 Not Found:**
```json
{
  "error": "Empresa not found"
}
```

---

### **DELETE /api/empresas/:id**

Deletar empresa (com CASCADE delete automático de impostos_mensal e usuario_empresa).

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/empresas/1 \
  -H "Authorization: Bearer {token}"
```

**Response 204 No Content:**
(Sem body)

**Response 403 Forbidden (RLS):**
```json
{
  "error": "Access denied"
}
```

**Response 404 Not Found:**
```json
{
  "error": "Empresa not found"
}
```

**Response 401 Unauthorized:**
```json
{
  "error": "No token provided"
}
```

---

## Row Level Security (RLS)

Todos os endpoints implementam RLS via tabela de junção `usuario_empresa`:

| User | Sua Empresa | Empresa de Outro User |
|------|-------------|----------------------|
| GET  | ✅ 200     | ❌ 404 / 403         |
| POST | ✅ 201     | ❌ 403 (apenas pode criar as suas) |
| PUT  | ✅ 200     | ❌ 403               |
| DELETE | ✅ 204     | ❌ 403               |

**Nota:** Controle de Admin (acesso a qualquer empresa) será implementado em STORY-1.5 (Roles & Permissions).

---

## CNPJ Validation

Validação básica (STORY-2.1):
- Formato esperado: `XX.XXX.XXX/XXXX-XX`
- Apenas verifica o padrão (regex)
- Não calcula dígito verificador (será adicionado em STORY-2.3)

**Exemplo válido:** `12.345.678/0001-90`
**Exemplo inválido:** `12345678000190` (sem formatação)

---

## Error Handling

| Status | Significado | Exemplo |
|--------|-------------|---------|
| **200** | OK | Requisição bem-sucedida (GET, PUT com sucesso) |
| **201** | Created | Empresa criada com sucesso (POST) |
| **204** | No Content | Empresa deletada com sucesso (DELETE) |
| **400** | Bad Request | CNPJ inválido, campo obrigatório faltando |
| **401** | Unauthorized | Token JWT faltando ou inválido |
| **403** | Forbidden | RLS violation - usuário não tem acesso à empresa |
| **404** | Not Found | Empresa não existe ou sem acesso (RLS) |
| **500** | Internal Server Error | Erro não esperado no servidor |

---

## Testing

### Unit Tests (EmpresaService)
```bash
npm test -- empresa.service.test.ts
```

### Integration Tests (Endpoints)
```bash
npm test -- empresa.integration.test.ts
```

### All Tests
```bash
npm test
```

---

## Performance

- **GET /api/empresas:** O(n) onde n = número de empresas do usuário (com índice em usuario_empresa)
- **GET /api/empresas/:id:** O(1) com índice em id
- **POST /api/empresas:** O(1) inserção + transação
- **PUT /api/empresas/:id:** O(1) atualização
- **DELETE /api/empresas/:id:** O(1) + CASCADE automático

---

## Security

✅ **Implementado em STORY-2.1:**
- JWT obrigatório em todos endpoints
- RLS via usuario_empresa junction table
- SQL injection prevention (prepared statements)
- CNPJ format validation

⏳ **Futuro (STORY-1.5, 2.3):**
- CNPJ dígito verificador
- PostgreSQL RLS policies (STORY-1.4)
- Admin bypass (STORY-1.5)
- Rate limiting

---

## Próximas Stories

- **STORY-2.2:** Formulário mensal de impostos (usa /api/empresas)
- **STORY-2.4:** Comparação entre 2+ empresas (usa GET /api/empresas)
- **STORY-1.4:** PostgreSQL RLS policies (complementa RLS de aplicação)
- **STORY-1.5:** Roles & Permissions (Admin access a qualquer empresa)

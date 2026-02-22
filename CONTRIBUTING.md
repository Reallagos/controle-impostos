# 📝 Contribuindo

## Padrões de Código

### TypeScript

- Use **strict mode**: `"strict": true` em tsconfig.json
- Tipos explícitos em função signatures
- Evite `any` — use tipos genéricos ou `unknown`
- Use `const` por padrão, `let` raramente

### Nomeação

| Item | Padrão | Exemplo |
|------|--------|---------|
| Variáveis/Funções | camelCase | `getUserData()`, `isActive` |
| Classes/Interfaces | PascalCase | `UserService`, `IDatabase` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRIES`, `DB_TIMEOUT` |
| Arquivos | lowercase | `user-service.ts`, `database.ts` |

### Formatação

- **Indentação:** 2 espaços
- **Line length:** 100 caracteres
- **Semicolons:** Sempre
- **Trailing comma:** es5
- **Quotes:** Single quotes (`'`)

Use **Prettier** para formatar automaticamente:
```bash
npm run lint:fix
```

---

## Workflow de Desenvolvimento

### 1. Criar branch

```bash
git checkout -b feature/nome-da-feature
```

### 2. Desenvolver & Testar

```bash
# Backend
cd backend
npm run dev          # Hot-reload
npm run lint         # Verificar estilo
npm run typecheck    # Verificar tipos
npm test             # Rodar testes

# Frontend
cd frontend
npm run dev
npm run lint
npm run typecheck
```

### 3. Commit

Use mensagens convencionais:

```
feat: adiciona autenticação JWT
^--^  ^--^
|     |
|     Descrição em português
|
Tipo: feat, fix, docs, style, refactor, test, chore
```

### 4. Push & PR

```bash
git push origin feature/nome-da-feature
```

---

## Testing

### Backend (Jest)

```bash
cd backend
npm test
npm run test:watch   # Modo watch
```

**Padrão de testes:**
```typescript
describe('UserService', () => {
  it('should create user', async () => {
    // Arrange
    const userData = { name: 'John' };
    
    // Act
    const user = await userService.create(userData);
    
    // Assert
    expect(user.id).toBeDefined();
  });
});
```

### Frontend (Vitest)

```bash
cd frontend
npm run test
npm run test:watch
```

---

## Code Review Checklist

- [ ] Código passa em `npm run lint`
- [ ] Código passa em `npm run typecheck`
- [ ] Testes estão passando (`npm test`)
- [ ] File List atualizado (se adicionar arquivos)
- [ ] README atualizado (se mudar comportamento)
- [ ] Nenhum `TODO` ou `FIXME` sem contexto

---

## Histórico de Commits

```bash
# Ver commits recentes
git log --oneline

# Ver mudanças em um arquivo
git log --follow -- src/app.ts
```

---

**Obrigado por contribuir!** 🎉

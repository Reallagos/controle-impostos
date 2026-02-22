# 🚀 COMECE AQUI — Seu Projeto AIOS

**Status:** Estrutura criada e pronta para desenvolvimento
**Data:** 22/02/2026
**Próximo passo:** Validar requirements e começar STORY-1.1

---

## ✅ O Que Foi Criado

### 1. **PRD** (Product Requirements Document)
📄 `docs/prd/PRD-controle-impostos.md`
- Visão completa do sistema
- 6 requisitos funcionais (RF-1 até RF-6)
- 5 requisitos não-funcionais (NFR-1 até NFR-5)
- Personas, roadmap, riscos

### 2. **EPIC** (Orquestração do Projeto)
📋 `docs/stories/EPIC-001-sistema-controle-impostos.md`
- Dividido em **4 Fases** × **13 Stories**
- Phase 1 (Infra): STORY 1.1-1.5
- Phase 2 (MVP): STORY 2.1-2.6
- Phase 3 (Dashboard): STORY 3.1-3.5
- Phase 4 (Polish): STORY 4.1-4.6

### 3. **STORY-1.1** (Setup Completo)
📝 `docs/stories/1.1.story.md`
- Primeira história — configurar projeto
- Stack definida: Node/Express/React/PostgreSQL
- 10 acceptance criteria

---

## 🎯 Próximos Passos (Na Ordem Correta)

### **Passo 1: Validar Requirements com @po** (30 min)
```
Comando: Chamar @po para revisar PRD + EPIC

@po
*validate-story-draft

(Ele validará usando checklist de 10 pontos)
```

**O que @po verificará:**
- ✅ PRD está claro e completo?
- ✅ EPIC é realista para 8 semanas?
- ✅ STORY-1.1 tem AC testável?
- ✅ Dependências entre stories estão claras?

**Resultado esperado:** PRD/EPIC marcado como **READY**

---

### **Passo 2: Implementar STORY-1.1 com @dev** (2-3 dias)
```
Comando: Chamar @dev para implementar setup

@dev
*develop

(Ele criará projeto, estrutura, e primeiros testes verdes)
```

**Entregáveis:**
- ✅ Repo com Node/Express/React/PostgreSQL
- ✅ `npm run dev` funcionando
- ✅ `npm test` passando
- ✅ ESLint + TypeCheck OK
- ✅ README com instruções

---

### **Passo 3: QA Gate com @qa** (1 dia)
```
Comando: @qa revisará STORY-1.1

@qa
*qa-gate

(Verificará: código, testes, segurança, docs)
```

**Se PASS:** STORY-1.1 vai para main
**Se CONCERNS:** Ajustes rápidos com @dev

---

### **Passo 4: Criar STORY-1.2 com @sm** (30 min)
```
Comando: @sm cria próxima história

@sm
*create-story

(Será: Modelo de Dados — Empresas/Usuários/Impostos)
```

Depois: **Rinse & Repeat** para STORY-1.3, 1.4, 1.5...

---

## 📊 Timeline Esperada

| Semana | Fase | Stories | Checkpoint |
|--------|------|---------|-----------|
| 1-2 | Infra & Auth | 1.1-1.5 | Auth + RLS funcionando |
| 2-4 | MVP Core | 2.1-2.6 | Comparação básica OK |
| 4-6 | Dashboard | 3.1-3.5 | KPIs e relatórios |
| 6-8 | Polish | 4.1-4.6 | Deploy em produção |

---

## 🔑 Comandos AIOS Principais

```bash
# Validar requirements
@po
*validate-story-draft

# Desenvolver story
@dev
*develop

# Testar e gatekeep
@qa
*qa-gate

# Deploy (somente @devops)
@devops
*push

# Ver próxima story
@sm
*create-story

# Ver tudo
@aios-master
*help
```

---

## 📁 Estrutura de Docs

```
docs/
├── prd/
│   └── PRD-controle-impostos.md       ← Requirements master
├── stories/
│   ├── EPIC-001-...md                 ← Orquestração
│   ├── 1.1.story.md                   ← Setup (em progresso)
│   ├── 1.2.story.md                   ← Será criada
│   └── ...
└── architecture/
    └── (será preenchida conforme avança)
```

---

## ⚠️ Pontos Críticos (Não Esquecer)

1. **RLS (Row Level Security)** é CRÍTICO
   - Cada usuário vê APENAS suas empresas
   - Deve ser implementado desde o DB (STORY-1.4)
   - Code review detalhada obrigatória

2. **Segurança de Dados**
   - CNPJ e impostos são sensíveis
   - HTTPS em produção
   - Sem hardcoded secrets

3. **Backup Automático**
   - Deve estar testado ANTES de produção
   - Diário, com teste de restore

4. **CodeRabbit Auto-Fix**
   - Rodará durante implementação
   - CRITICAL/HIGH são auto-fixadas
   - Max 2 iterações, depois manual

---

## 🎓 Workflow AIOS Resumido

```
1. PRD criado ✅
   ↓
2. EPIC criado ✅
   ↓
3. STORY-1.1 criada ✅
   ↓
4. @po VALIDA (próximo)
   ↓
5. @dev IMPLEMENTA
   ↓
6. @qa TESTA
   ↓
7. @devops PUSHES
   ↓
8. STORY-1.2 criada
   ↓
Repeat até todas as 13 stories
```

---

## 💬 Como Usar Agents

```
# Exemplo: Chamar @po
@po
Olá, por favor valide PRD e EPIC usando a checklist de 10 pontos.
Comando: *validate-story-draft

# Exemplo: Chamar @dev
@dev
Vou implementar STORY-1.1 (Setup).
Comando: *develop

# Exemplo: Chamar @qa
@qa
Por favor, faça QA gate de STORY-1.1.
Comando: *qa-gate
```

---

## ❓ Dúvidas Frequentes

**P: Por onde começar?**
R: Digite `@po` e peça para validar requirements.

**P: Quanto tempo leva cada story?**
R: STORY-1.1 = 2-3 dias, STORY-2.4 (Comparação) = 4-5 dias.

**P: E se algo quebrar?**
R: Use `@aios-master *help` ou veja `docs/stories/EPIC-001` para dependências.

**P: Posso fazer 2 stories ao mesmo tempo?**
R: Não se bloquearem. STORY-1.3 (Auth) bloqueia 1.4 (RLS).

**P: Preciso entender toda a stack?**
R: @dev cuidará de implementação. Você gerencia via PRD/EPIC.

---

## 🚀 Próximo Comando (Execute Agora!)

```
@po
*validate-story-draft

Obrigado por revisar PRD, EPIC e STORY-1.1 usando a checklist.
Documento principal: docs/prd/PRD-controle-impostos.md
```

---

**Bom desenvolvimento! 🎉**

Qualquer dúvida, use `@aios-master *help` ou veja instruções em `.claude/CLAUDE.md`.

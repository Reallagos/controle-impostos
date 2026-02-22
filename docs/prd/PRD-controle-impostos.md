# PRD — Sistema de Controle e Comparação de Impostos

**Data:** 22/02/2026
**Status:** Ready ✅
**Owner:** Escritório de Contabilidade
**Target Release:** 8 semanas
**Validated by:** @po (Pax) — 22/02/2026

---

## 1. Visão do Produto

Sistema web para que equipes de contabilidade preencham dados de impostos mensalmente e geradores/proprietários possam comparar múltiplas empresas para identificar economias fiscais.

**Diferencial:** Comparação cruzada (muitas-para-muitas) com visualização de gaps entre empresas.

---

## 2. Problemas & Oportunidades

| Problema | Oportunidade |
|----------|------------|
| Difícil comparar impostos entre empresas manualmente | Visualização automática de diferenças |
| Equipe dispersa, dados em planilhas | Centralizar em banco de dados seguro |
| Sem auditoria de quem alterou o quê | Log completo de mudanças |
| Impossível medir economia de planejamento fiscal | Dashboard com comparações quantitativas |

---

## 3. Requisitos Funcionais

### RF-1: Autenticação & Autorização
- [ ] Login com email/senha
- [ ] Roles: Admin, Contador (entra dados), Gerente (compara), Visualizador (read-only)
- [ ] RLS (Row Level Security): cada usuário vê apenas empresas atribuídas
- [ ] Auditoria de login

### RF-2: Gerenciamento de Empresas
- [ ] CRUD de empresas (nome, CNPJ, responsável)
- [ ] Atribuir equipes por empresa
- [ ] Histórico de empresas (ativas/inativas)

### RF-3: Preenchimento de Impostos (Mensal)
- [ ] Formulário mensal com 8 campos de impostos:
  - IRPJ
  - CSLL
  - PIS/PASEP
  - COFINS
  - ICMS
  - INSS
  - FGTS
  - Honorários
- [ ] Validações (valores positivos, obrigatórios)
- [ ] Salvar rascunho & publicar
- [ ] Histórico de alterações por usuário
- [ ] Calend rio de lembretes (1º dia do mês)

### RF-4: Comparação de Empresas
- [ ] Selecionar empresa BASE
- [ ] Selecionar múltiplas empresas para COMPARAR
- [ ] Exibir lado-a-lado os 8 impostos
- [ ] Calcular diferenças (absoluto + %)
- [ ] Destacar maiores economias (potencial)

### RF-5: Dashboard & Relatórios
- [ ] Dashboard com KPIs:
  - Total de impostos por empresa (mês atual)
  - Economia potencial identificada
  - Empresas com maior spread
- [ ] Relatório exportável (PDF/Excel)
- [ ] Gráficos de série temporal (comparação ao longo dos meses)
- [ ] Filtros por período

### RF-6: Notificações & Lembretes
- [ ] Aviso quando dados do mês não foram preenchidos
- [ ] Notificação de empresa atrasada na entrada
- [ ] Email/dashboard notification

---

## 4. Requisitos Não-Funcionais

### NFR-1: Segurança
- [ ] HTTPS em produção
- [ ] Senhas hasheadas (bcrypt)
- [ ] RLS no banco de dados (PostgreSQL)
- [ ] Rate limiting em endpoints sensíveis
- [ ] No SQL injection / XSS

### NFR-2: Performance
- [ ] Carregamento de comparação < 2s (100 empresas)
- [ ] Dashboard carrega em < 1s
- [ ] Relatórios gerados em < 30s

### NFR-3: Escalabilidade
- [ ] Suportar 100+ empresas
- [ ] Suportar 50+ usuários simultâneos
- [ ] Banco de dados com índices otimizados

### NFR-4: Usabilidade
- [ ] Interface intuitiva (sem treinamento)
- [ ] Responsivo (mobile + desktop)
- [ ] Acessibilidade WCAG AA

### NFR-5: Confiabilidade
- [ ] Backup automático diário
- [ ] Uptime 99.5%
- [ ] Logs estruturados (rastreabilidade)

---

## 5. Restrições & Dependências

| Item | Descrição |
|------|-----------|
| **Tecnologia Stack** | Node.js/Express, PostgreSQL, React |
| **Equipe** | 4+ contadores + você (gerente) |
| **Acesso** | Cada usuário vê apenas suas empresas atribuídas |
| **Compliance** | Dados sensíveis (CNPJ, impostos) → LGPD compliant |
| **Prazo** | MVP em 4 semanas, sistema completo em 8 |

---

## 6. Critérios de Sucesso

- [ ] Equipe preenchendo dados de 5+ empresas regularmente
- [ ] Você consegue comparar qualquer 2-N empresas em < 5 cliques
- [ ] Economia identificada (gap entre empresas) visível em dashboard
- [ ] Zero perdas de dados (backups funcionando)
- [ ] Satisfação da equipe >= 4/5 (Net Promoter Score)

---

## 7. Personas & Casos de Uso

### Persona 1: Contador (Ana)
**Perfil:** Preenche dados de 3-5 empresas
**Caso de Uso:**
1. Acessa sistema
2. Navega até "Dezembro 2026"
3. Preenche 8 campos de impostos para sua empresa atribuída
4. Salva e publica
5. Recebe confirmação

### Persona 2: Gerente (Você)
**Perfil:** Analisa e toma decisões
**Caso de Uso:**
1. Acessa dashboard
2. Seleciona "Empresa A" como BASE
3. Seleciona "Empresa B, C, D" para comparar
4. Vê tabela lado-a-lado com economia potencial destacada
5. Exporta relatório para apresentação ao cliente

### Persona 3: Administrador
**Perfil:** Cuida de usuários e permissões
**Caso de Uso:**
1. Cria novo usuário (contador)
2. Atribui a 2 empresas específicas
3. Define role como "Contador"
4. Envia link de reset de senha

---

## 8. Roadmap de Fases

| Fase | Duração | Deliverables |
|------|---------|---------------|
| **Fase 1: Infra & Auth** | Semana 1-2 | Banco, autenticação, RLS |
| **Fase 2: MVP Core** | Semana 2-4 | Preenchimento + Comparação básica |
| **Fase 3: Dashboard** | Semana 4-6 | KPIs, gráficos, relatórios |
| **Fase 4: Polish & Deploy** | Semana 6-8 | Testes, segurança, produção |

---

## 9. Riscos & Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|--------|-----------|
| RLS implementado errado | Média | Alto | Code review detalhada |
| Performance com muitos dados | Baixa | Médio | Índices no DB, cache |
| Equipe resiste a novo sistema | Baixa | Médio | Treinamento + suporte |

---

## 10. Glossário

- **RLS:** Row Level Security — controle de acesso no nível de linha (banco de dados)
- **MVP:** Minimum Viable Product — versão mínima funcional
- **Gap:** Diferença entre valores de impostos (economia potencial)
- **Spread:** Variação entre a empresa com maior e menor imposto

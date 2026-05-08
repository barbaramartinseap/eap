# EAP IA — CRM Comercial para Rede de Franquias

CRM agentic B2B para franqueados da EAP (Engenharia e Performance) que vendem consultoria de gestão de obras para construtoras brasileiras.

---

## Stack

| Camada    | Tecnologia                                    |
|-----------|-----------------------------------------------|
| Backend   | Node.js + TypeScript + Fastify + Prisma       |
| Banco     | SQLite (`backend/prisma/dev.db`)              |
| Auth      | JWT via `@fastify/jwt` + bcryptjs             |
| Frontend  | HTML/CSS/JS puro — sem framework              |
| Fontes    | Plus Jakarta Sans (corpo) + Anton (brand)     |
| Porta     | **3333**                                      |

---

## Comandos (rodar dentro de `backend/`)

```bash
npm run dev          # inicia servidor em modo watch (porta 3333)
npm run db:seed      # recria dados de teste (usar se login falhar)
npm run db:studio    # Prisma Studio em :5555
npm run db:migrate   # aplica novas migrations
npm run db:reset     # reset completo + seed
npm run build        # compila TypeScript → dist/
```

**Credenciais dev:** `bernardo@eapia.com.br` / `E@P2026#` — Bernardo, Unidade Salvador-BA

---

## Estrutura de arquivos críticos

```
eapia/
├── CLAUDE.md                        ← este arquivo
├── backend/
│   ├── src/
│   │   ├── server.ts                ← entry point Fastify
│   │   ├── plugins/
│   │   │   ├── auth.ts              ← decorator JWT (request.unidade)
│   │   │   └── prisma.ts            ← plugin Prisma global
│   │   ├── routes/
│   │   │   ├── auth.ts              ← POST /login, POST /register
│   │   │   ├── leads.ts             ← CRUD leads + KPIs + summary + validação motivo perda + SLA
│   │   │   ├── painel.ts            ← cadência + desfechos + registrar ação
│   │   │   ├── dashboard.ts         ← métricas executivas + alertas SLA
│   │   │   └── health.ts            ← GET /health
│   │   └── services/
│   │       ├── score.ts             ← calcularScore(), scoreToTemperatura(), estagioToChance()
│   │       └── cadence.ts           ← motor de cadência (Playbook EAP)
│   └── prisma/
│       ├── schema.prisma            ← modelos de dados
│       ├── seed.ts                  ← 8 leads Salvador-BA (faturamentoEstimado = valor contrato EAP/ano)
│       └── dev.db                   ← banco SQLite local
└── frontend/
    ├── painel.html                  ← Painel de Execução (lead a lead)
    ├── leads.html                   ← Gestão de Leads (lista, kanban, form)
    └── dashboard.html               ← Dashboard executivo (Chart.js)
```

---

## Modelos de dados (Prisma)

```
UnidadeFranqueada (franqueado/tenant)
  └── Lead (prospect construtora)
       ├── Oportunidade (negociação)
       ├── Tarefa (próxima ação)
       └── NotaInteracao (histórico/timeline)
```

**Campos-chave do Lead:**
- `scoreIcp` (0–100) — calculado por `services/score.ts`
- `temperatura` — FRIO | MORNO | QUENTE | QUALIFICADO
- `estagioPipeline` — NOVO_LEAD | EM_CONTATO | QUALIFICADO | REUNIAO_AGENDADA | REUNIAO_REALIZADA | PROPOSTA_EM_ELABORACAO | PROPOSTA_ENVIADA | NEGOCIACAO | FECHADO_GANHO | FECHADO_PERDIDO
- `chanceFechamento` (0–100%)
- `motivoPerda` — obrigatório ao mover para FECHADO_PERDIDO (validado no backend)
- `faturamentoEstimado` — valor anual do contrato EAP (não faturamento da construtora)
- `nichoObra` — OBRAS_PUBLICAS | RESIDENCIAL_ALTO | RESIDENCIAL_MEDIO | INDUSTRIAL | COMERCIAL | OUTRO
- `dorPrincipal` — FLUXO_CAIXA | CONTROLE_OBRA | MARGEM | CREDITO | EQUIPE | OUTRO
- `origem` — INDICACAO | LINKEDIN | INSTAGRAM | META_ADS | OUTBOUND_ATIVO | LANDING_PAGE | LIVES_CONTEUDOS | OUTRO

---

## Endpoints da API

Todos os endpoints (exceto `/login` e `/health`) exigem `Authorization: Bearer <token>`.

| Método | Rota                         | Descrição                                        |
|--------|------------------------------|--------------------------------------------------|
| POST   | /login                       | Autenticação                                     |
| GET    | /health                      | Health check                                     |
| GET    | /leads                       | Lista leads (filtros, busca, ordem)              |
| GET    | /leads/summary               | Resumo diário + `foraDeSLA` (SLA vencido)        |
| GET    | /leads/kpis                  | KPIs do mês                                      |
| GET    | /leads/:id                   | Detalhe do lead                                  |
| GET    | /leads/:id/timeline          | Histórico de interações                          |
| POST   | /leads                       | Criar lead (score + primeira tarefa automática)  |
| PATCH  | /leads/:id                   | Atualizar lead (exige motivoPerda se FECHADO_PERDIDO) |
| DELETE | /leads/:id                   | Arquivar lead (soft delete)                      |
| GET    | /painel/resumo               | Cards de resumo do dia                           |
| GET    | /painel/tarefas-hoje         | Tarefas pendentes do dia                         |
| GET    | /painel/script?tarefaId=:id  | Script de cadência para a tarefa                 |
| POST   | /painel/registrar            | Registra execução e gera próxima ação            |
| GET    | /dashboard/franqueado        | Métricas, funil, gráficos, alertas SLA           |

---

## Design system (frontend)

```css
--bg:         #F4F1EC   /* fundo bege quente */
--navy:       #070D1C   /* sidebar e headers */
--navy2:      #101B33
--gold:       #B88A2A   /* destaque e CTAs */
--gold-lt:    #D4A843
--blue:       #1B3D8F
--text-1:     #070D1C
--text-2:     #5F6673
--text-3:     #8C92A0
--danger:     #B4232A
--ok:         #1F7A4D
--warn:       #B7791F
--border:     #E5DFD3
--border-md:  #C9BFAE
```

Fonte corpo: `Plus Jakarta Sans` — Fonte brand/título: `Anton`

---

## Módulos implementados ✅

- [x] **Painel de Execução** (`painel.html`) — script dinâmico, smart next action, alertas, horário com select comercial
- [x] **Módulo Leads** (`leads.html`) — lista, kanban 7 colunas, filtros, busca, score, form (com campo telefone), detalhe, timeline
- [x] **Dashboard do Franqueado** (`dashboard.html`) — KPIs, funil, 4 gráficos, metas editáveis via modal (sem prompt nativo)
- [x] **Score ICP** automático (`services/score.ts`)
- [x] **Motor de cadência** baseado no Playbook EAP (`services/cadence.ts`)
- [x] **Auth JWT** por unidade franqueada
- [x] **Seed** com 8 leads Salvador-BA (Bernardo, `bernardo@eapia.com.br` / `E@P2026#`)
- [x] **Motivo de perda obrigatório** — validação backend + modal em `leads.html` + interceptação em `painel.html`
- [x] **SLA de primeiro contato** — badge na tabela, chip de prioridade, alerta no dashboard (NOVO_LEAD +24h)

---

## Regras de negócio importantes

- **`faturamentoEstimado`** = valor anual do contrato EAP (R$), NÃO o faturamento da construtora. Usado para calcular `receitaPrevista` no dashboard (valor × chanceFechamento)
- **Metas do dashboard** são salvas em `localStorage` por device. Default: 12 leads quali / 2 contratos / R$30k receita
- **SLA de primeiro contato** = lead `NOVO_LEAD` criado há mais de 24h sem nenhuma ação
- **Motivo de perda** é obrigatório para qualquer transição para `FECHADO_PERDIDO` — validado no `PATCH /leads/:id` e interceptado no frontend antes de salvar
- `unidadeFranqueada.nome` = nome do franqueado (ex: 'Bernardo') — exibido na sidebar. `cidade` define "Unidade Salvador - BA"

---

## Convenções do projeto

- Frontend em HTML/CSS/JS puro — **não introduzir React, Vue ou qualquer framework**
- Backend Fastify — **não trocar por Express ou outro framework**
- Banco SQLite local — **não trocar por Postgres/MySQL sem pedido explícito**
- Autenticação sempre via `request.unidade` (injetado pelo plugin `auth.ts`)
- Todo novo campo de Lead deve ser adicionado ao schema **e** ao seed
- Ao criar migration: `npm run db:migrate` dentro de `backend/`
- Scores e temperaturas sempre calculados via `services/score.ts` — nunca hardcoded no frontend
- Nunca usar `prompt()` nativo no frontend — usar modal próprio
- Horário de próxima ação: `<select>` com opções comerciais (07:00–20:00), nunca `<input type="time">`

---

## MVP pendente 🔲

- [ ] **Dashboard Matriz** — visão consolidada da rede de franquias (multi-tenant, admin EAP)
- [ ] Deduplicação automática de leads por telefone/CNPJ

**Módulos futuros:** Propostas/Contratos, Financeiro, Marketing Agente, Onboarding, integração Econodata, deploy Cloudflare Workers + D1.

---

## Protocolo de trabalho com Claude Code

1. **Uma sessão por módulo** — nunca implementar dois módulos no mesmo chat
2. Usar `/compact` se a conversa ficar longa antes de trocar de assunto
3. Ao final de cada sessão, pedir "atualize o arquivo md" para manter CLAUDE.md e memory em sincronia
4. Para tarefas grandes e isoladas, pedir execução em worktree separada

# EAP IA — Arquitetura do Sistema

> CRM agentic B2B para rede de franquias EAP (Engenharia e Performance).
> Documento gerado em 2026-05-02. Mantido manualmente — atualizar ao final de cada sessão de desenvolvimento.

---

## Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                        FRONTEND                         │
│  painel.html   leads.html   dashboard.html              │
│  HTML/CSS/JS puro · sem framework · localStorage        │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST (Bearer JWT)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                        BACKEND                          │
│  Node.js + TypeScript + Fastify · porta 3333            │
│  Plugins: JWT auth · Prisma global                      │
│  Routes: auth · leads · painel · dashboard · health     │
│  Services: score.ts · cadence.ts                        │
└────────────────────────┬────────────────────────────────┘
                         │ Prisma ORM
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    SQLite (dev.db)                      │
│  UnidadeFranqueada · Lead · Oportunidade                │
│  Tarefa · NotaInteracao                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Stack

| Camada    | Tecnologia                                    |
|-----------|-----------------------------------------------|
| Backend   | Node.js + TypeScript + Fastify                |
| ORM       | Prisma                                        |
| Banco     | SQLite (`backend/prisma/dev.db`)              |
| Auth      | JWT via `@fastify/jwt` + bcryptjs             |
| Frontend  | HTML + CSS + JavaScript puro (sem framework)  |
| Fontes    | Plus Jakarta Sans (corpo) · Anton (brand)     |
| Porta     | 3333 (backend) · 5555 (Prisma Studio)         |

---

## Estrutura de Arquivos

```
eapia/
├── CLAUDE.md                         ← instruções para Claude Code
├── ARQUITETURA.md                    ← este arquivo
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── server.ts                 ← entry point Fastify, registra plugins e rotas
│   │   ├── plugins/
│   │   │   ├── auth.ts              ← decorator JWT (request.unidade injetado)
│   │   │   └── prisma.ts            ← plugin Prisma global (fastify.prisma)
│   │   ├── routes/
│   │   │   ├── auth.ts              ← POST /login, POST /register
│   │   │   ├── leads.ts             ← CRUD leads + KPIs + summary + SLA + validação perda
│   │   │   ├── painel.ts            ← cadência + desfechos + registrar ação
│   │   │   ├── dashboard.ts         ← métricas + alertas + funil + gráficos
│   │   │   └── health.ts            ← GET /health
│   │   └── services/
│   │       ├── score.ts             ← Score ICP, temperatura, chance, primeira ação
│   │       └── cadence.ts           ← Motor de cadência (Playbook EAP)
│   └── prisma/
│       ├── schema.prisma            ← modelos de dados
│       ├── migrations/              ← histórico de migrations SQLite
│       ├── seed.ts                  ← 8 leads Salvador-BA (Bernardo)
│       └── dev.db                   ← banco SQLite local (gitignore)
│
└── frontend/
    ├── painel.html                  ← Painel de Execução (lead a lead, cadência)
    ├── leads.html                   ← Gestão de Leads (lista, kanban, form, detalhe)
    └── dashboard.html               ← Dashboard executivo (KPIs, funil, Chart.js)
```

---

## Banco de Dados

### Diagrama de relacionamentos

```
UnidadeFranqueada (1)
    ├── Lead (N)
    │     ├── Oportunidade (N)
    │     ├── Tarefa (N)
    │     └── NotaInteracao (N)
    ├── Tarefa (N)
    └── NotaInteracao (N)
```

### UnidadeFranqueada

| Campo    | Tipo   | Descrição                                  |
|----------|--------|--------------------------------------------|
| id       | String | UUID (cuid)                                |
| nome     | String | Nome do franqueado (ex: 'Bernardo')        |
| email    | String | Login único                                |
| senha    | String | Hash bcrypt                                |
| cidade   | String | Cidade da unidade (ex: 'Salvador')         |
| status   | String | ATIVA \| INATIVA                           |

### Lead

| Campo               | Tipo    | Descrição                                                          |
|---------------------|---------|--------------------------------------------------------------------|
| id                  | String  | UUID                                                               |
| nomeEmpresa         | String  | Nome da construtora                                                |
| nomeContato         | String  | Nome do decisor                                                    |
| telefone            | String  | Obrigatório                                                        |
| email               | String? | Opcional                                                           |
| whatsapp            | String? | Opcional                                                           |
| instagram           | String? | Opcional                                                           |
| cidade              | String  | Cidade da construtora                                              |
| nichoObra           | String  | Ver enum abaixo                                                    |
| qtdObrasSimultaneas | Int     | Qtd de obras ativas                                                |
| faturamentoEstimado | String  | **Valor anual do contrato EAP** (NÃO faturamento da construtora)  |
| temSocio            | Boolean | Tem sócio?                                                         |
| equipePropia        | Boolean | Tem equipe própria?                                                |
| qtdEngenheiros      | Int     | Qtd de engenheiros na equipe                                       |
| dorPrincipal        | String  | Ver enum abaixo                                                    |
| origem              | String  | Ver enum abaixo                                                    |
| scoreIcp            | Int     | 0–100 (calculado automaticamente)                                  |
| temperatura         | String  | FRIO \| MORNO \| QUENTE \| QUALIFICADO                            |
| estagioPipeline     | String  | Ver pipeline abaixo                                                |
| chanceFechamento    | Int     | 0–100% (baseado no estágio)                                        |
| motivoPerda         | String? | Obrigatório ao mover para FECHADO_PERDIDO                          |
| diasParado          | Int     | Dias sem atividade (campo calculado/atualizado)                    |
| responsavel         | String  | Nome do franqueado responsável                                     |
| primeiraAcaoEm      | DateTime? | Timestamp do primeiro contato                                    |
| unidadeId           | String  | FK → UnidadeFranqueada (isolamento multi-tenant)                   |
| createdAt           | DateTime | Auto (usado no cálculo de SLA)                                    |
| updatedAt           | DateTime | Auto                                                               |
| deletedAt           | DateTime? | Soft delete (archived)                                           |

### Tarefa

| Campo          | Tipo     | Descrição                                           |
|----------------|----------|-----------------------------------------------------|
| id             | String   | UUID                                                |
| tipo           | String   | LIGAR \| WHATSAPP \| EMAIL \| REUNIAO \| FOLLOW_UP  |
| descricao      | String   | Texto da tarefa                                     |
| tentativaNum   | Int      | Número da tentativa no script de cadência           |
| dataVencimento | DateTime | Prazo da tarefa                                     |
| status         | String   | PENDENTE \| CONCLUIDA \| CANCELADA                  |
| leadId         | String   | FK → Lead                                           |
| unidadeId      | String   | FK → UnidadeFranqueada                              |

### NotaInteracao

| Campo     | Tipo     | Descrição                                                 |
|-----------|----------|-----------------------------------------------------------|
| id        | String   | UUID                                                      |
| tipo      | String   | LIGACAO \| WHATSAPP \| EMAIL \| REUNIAO \| NOTA_INTERNA   |
| conteudo  | String   | Texto da interação                                        |
| resultado | String?  | NAO_ATENDEU \| REUNIAO_AGENDADA \| PROPOSTA_ENVIADA etc.  |
| leadId    | String   | FK → Lead                                                 |
| unidadeId | String   | FK → UnidadeFranqueada                                    |
| createdAt | DateTime | Auto                                                      |

### Oportunidade

| Campo           | Tipo    | Descrição           |
|-----------------|---------|---------------------|
| id              | String  | UUID                |
| valor           | Float   | Valor da proposta   |
| status          | String  | Status negociação   |
| probabilidade   | Int     | % estimada          |
| leadId          | String  | FK → Lead           |
| unidadeId       | String  | FK → UnidadeFranqueada |

---

## Enumerações (campos String no SQLite)

### estagioPipeline (pipeline comercial)
```
NOVO_LEAD → EM_CONTATO → QUALIFICADO → REUNIAO_AGENDADA
→ REUNIAO_REALIZADA → PROPOSTA_EM_ELABORACAO → PROPOSTA_ENVIADA
→ NEGOCIACAO → FECHADO_GANHO | FECHADO_PERDIDO
```

### nichoObra
`OBRAS_PUBLICAS` · `RESIDENCIAL_ALTO` · `RESIDENCIAL_MEDIO` · `INDUSTRIAL` · `COMERCIAL` · `OUTRO`

### dorPrincipal
`FLUXO_CAIXA` · `CONTROLE_OBRA` · `MARGEM` · `CREDITO` · `EQUIPE` · `OUTRO`
(também usados: `BAIXA_MARGEM` · `MUITAS_OBRAS` · `ATRASO_OBRA` · `SEM_CONTROLE_FINANCEIRO`)

### origem
`INDICACAO` · `LINKEDIN` · `INSTAGRAM` · `META_ADS` · `OUTBOUND_ATIVO` · `LANDING_PAGE` · `LIVES_CONTEUDOS` · `OUTRO`

### temperatura
`FRIO` · `MORNO` · `QUENTE` · `QUALIFICADO`

### motivoPerda (quando FECHADO_PERDIDO)
`SEM_INTERESSE` · `SEM_FIT` · `PRECO` · `CONCORRENTE` · `SEM_VERBA` · `TIMING` · `NAO_DECIDIU` · `NUMERO_INVALIDO` · `ARQUIVADO`

---

## Backend — Endpoints da API

Todos os endpoints (exceto `/login` e `/health`) exigem `Authorization: Bearer <token>`.
O token é gerado no login e contém `{ unidadeId, email, nome }`.

| Método | Rota                        | Descrição                                                         |
|--------|-----------------------------|-------------------------------------------------------------------|
| POST   | /login                      | Autenticação — retorna JWT                                        |
| GET    | /health                     | Health check                                                      |
| GET    | /leads                      | Lista leads (filtros: estagio, temperatura, busca, order)         |
| GET    | /leads/summary              | Resumo diário + `foraDeSLA` (NOVO_LEAD +24h)                     |
| GET    | /leads/kpis                 | KPIs do mês (totais, conversões, receita prevista)                |
| GET    | /leads/:id                  | Detalhe completo do lead                                          |
| GET    | /leads/:id/timeline         | Histórico de interações (NotaInteracao)                           |
| POST   | /leads                      | Criar lead → calcula score → cria primeira tarefa automaticamente |
| PATCH  | /leads/:id                  | Atualizar lead (valida motivoPerda se FECHADO_PERDIDO)            |
| DELETE | /leads/:id                  | Soft delete (arquiva com motivoPerda='ARQUIVADO')                 |
| GET    | /painel/resumo              | Cards de resumo do dia (tarefas, leads ativos, taxa de contato)   |
| GET    | /painel/tarefas-hoje        | Tarefas PENDENTE com vencimento hoje                              |
| GET    | /painel/script?tarefaId=:id | Script de cadência para a tarefa (objections, mensagem)           |
| POST   | /painel/registrar           | Registra execução → cria NotaInteracao → gera próxima Tarefa      |
| GET    | /dashboard/franqueado       | Métricas executivas, funil, dados gráficos, alertas SLA           |

---

## Serviços

### score.ts — Score ICP

**Entradas:** `qtdObrasSimultaneas`, `nichoObra`, `origem`, `dorPrincipal`, `temSocio`, `equipePropia`, `qtdEngenheiros`

**Dimensões (total 100 pts):**

| Dimensão             | Peso máx | Critério                                              |
|----------------------|----------|-------------------------------------------------------|
| Obras simultâneas    | 30 pts   | ≥5 = 30 · 3–4 = 20 · 2 = 12 · 1 = 5                 |
| Nicho de obra        | 25 pts   | INDUSTRIAL/OBRAS_PUBLICAS = 25 · RESIDENCIAL_ALTO = 20 · COMERCIAL/RES_MEDIO = 15 · OUTRO = 8 |
| Origem do lead       | 20 pts   | INDICACAO = 20 · LINKEDIN/OUTBOUND = 15 · INSTAGRAM/META_ADS = 10 · LIVES/LANDING = 8 · OUTRO = 5 |
| Dor principal        | 15 pts   | FLUXO_CAIXA/SEM_CONTROLE_FINANCEIRO = 15 · BAIXA_MARGEM/MUITAS_OBRAS = 12 · ATRASO_OBRA = 10 · OUTRO = 5 |
| Perfil da empresa    | 10 pts   | temSocio (+4) · equipePropia (+3) · qtdEngenheiros≥3 (+3) |

**Temperatura:**
- ≥ 80 pts → `QUALIFICADO`
- ≥ 65 pts → `QUENTE`
- ≥ 45 pts → `MORNO`
- < 45 pts → `FRIO`

**Chance de fechamento por estágio:**

| Estágio                  | Chance |
|--------------------------|--------|
| NOVO_LEAD                | 5%     |
| EM_CONTATO               | 15%    |
| QUALIFICADO              | 25%    |
| REUNIAO_AGENDADA         | 40%    |
| REUNIAO_REALIZADA        | 55%    |
| PROPOSTA_EM_ELABORACAO   | 65%    |
| PROPOSTA_ENVIADA         | 70%    |
| NEGOCIACAO               | 80%    |
| FECHADO_GANHO            | 100%   |
| FECHADO_PERDIDO          | 0%     |

### cadence.ts — Motor de Cadência

Baseado no Playbook EAP. Determina:
- Script de abordagem por temperatura e tentativa
- Objections comuns + respostas prontas
- Próxima ação automática após desfecho registrado

**Mapa de desfechos → novo estágio (DESFECHO_ESTAGIO):**

| Desfecho registrado | Novo estagioPipeline   |
|---------------------|------------------------|
| CONTATO_REALIZADO   | EM_CONTATO             |
| QUALIFICADO         | QUALIFICADO            |
| REUNIAO_AGENDADA    | REUNIAO_AGENDADA       |
| REUNIAO_REALIZADA   | REUNIAO_REALIZADA      |
| PROPOSTA_ENVIADA    | PROPOSTA_ENVIADA       |
| EM_NEGOCIACAO       | NEGOCIACAO             |
| GANHO               | FECHADO_GANHO          |
| PERDIDO / SEM_FIT / SEM_INTERESSE / NUMERO_INVALIDO | FECHADO_PERDIDO |

**Primeira tarefa por temperatura:**
- `QUENTE` / `QUALIFICADO` → LIGAR (hoje)
- `MORNO` → WHATSAPP (hoje)
- `FRIO` → FOLLOW_UP (+3 dias)

---

## Frontend — Páginas

### painel.html — Painel de Execução

**Propósito:** Trabalhar lead a lead seguindo a cadência do dia.

**Funcionalidades:**
- Cards de resumo (tarefas pendentes, leads ativos, taxa de contato)
- Exibe um lead por vez com script de abordagem dinâmico
- Botões de desfecho (Não atendeu, Reunião agendada, etc.)
- Agendamento da próxima ação com `<select>` de horários comerciais (07:00–20:00, steps 30min)
- Labels "Data" e "Horário" acima dos campos
- Modal de motivo de perda (intercepta desfechos de encerramento antes de salvar)
- `confirmarPerdaPainel()` → PATCH lead com FECHADO_PERDIDO + motivoPerda → POST /painel/registrar

**Estado:** Nenhum localStorage. Tudo em memória de sessão.

### leads.html — Gestão de Leads

**Propósito:** CRUD completo de leads com múltiplas visualizações.

**Funcionalidades:**
- Lista tabular com filtros (estágio, temperatura) e busca com debounce
- Kanban 7 colunas (drag-and-drop visual)
- Badge `⏰ SLA` na tabela para leads NOVO_LEAD +24h
- Chip de prioridade urgente no detalhe quando SLA vencido
- Formulário de cadastro: Telefone obrigatório, Score ICP em tempo real, label "Valor contrato EAP/ano (R$)"
- Sidebar de detalhe: dados completos + timeline + score ring + chance de fechamento
- Botão "Marcar como perdido" (condicional: não exibe em FECHADO_GANHO/PERDIDO)
- Modal de motivo de perda com 7 opções

**Estado:** Nenhum localStorage relevante.

### dashboard.html — Dashboard do Franqueado

**Propósito:** Visão executiva de performance e pipeline.

**Funcionalidades:**
- 8 KPIs principais (leads, conversão, receita prevista, etc.)
- `receitaPrevista` = Σ(faturamentoEstimado × chanceFechamento) dos leads ativos
- Funil de conversão por estágio
- 4 gráficos Chart.js (pipeline, origens, temperatura, evolução mensal)
- Metas editáveis via modal próprio (sem `prompt()` nativo):
  - Leads qualificados / mês (default: 12)
  - Contratos fechados / mês (default: 2)
  - Receita prevista / mês (default: R$30.000)
- Alertas inteligentes incluindo `SLA_PRIMEIRO_CONTATO` (ponto vermelho)
- Metas persistidas em `localStorage` com chave `eap_metas`

**Estado:** `localStorage.eap_metas` = `{ leads: number, contratos: number, receita: number }`

---

## Autenticação e Multi-tenancy

```
POST /login
  → valida email + senha (bcrypt)
  → retorna JWT { unidadeId, email, nome }

Todas as rotas protegidas:
  → preHandler: fastify.authenticate
  → injeta request.unidade = { unidadeId, email, nome }
  → todas as queries filtram por unidadeId (isolamento total entre franqueados)
```

---

## Fluxo Principal de Dados

```
Franqueado abre leads.html
    → GET /leads (lista filtrada por unidadeId)
    → Clica "Cadastrar lead"
    → POST /leads
        → calcularScore(input) → scoreIcp, temperatura
        → estagioToChance(estagio) → chanceFechamento
        → getFirstTaskForTemp(temperatura) → cria Tarefa automática
        → cria NotaInteracao "Lead criado. Score ICP: X — Y."

Franqueado abre painel.html
    → GET /painel/tarefas-hoje (tarefas PENDENTE de hoje)
    → GET /painel/script?tarefaId=X (script de cadência)
    → Registra desfecho → POST /painel/registrar
        → cria NotaInteracao com resultado
        → atualiza estagioPipeline via DESFECHO_ESTAGIO map
        → calcula próxima tarefa e cria Tarefa com nova data
        → (se FECHADO_PERDIDO) → PATCH /leads/:id com motivoPerda primeiro

Franqueado abre dashboard.html
    → GET /dashboard/franqueado
        → agrega KPIs, funil, dados gráficos
        → verifica leads NOVO_LEAD +24h → alerta SLA_PRIMEIRO_CONTATO
    → Edita meta → modal → localStorage.setItem('eap_metas', ...)
```

---

## Regras de Negócio

| Regra                        | Detalhe                                                                                    |
|------------------------------|--------------------------------------------------------------------------------------------|
| faturamentoEstimado          | Valor anual do contrato EAP (R$), NÃO o faturamento da construtora                        |
| receitaPrevista              | Σ(faturamentoEstimado × chanceFechamento) para leads ativos                               |
| motivoPerda obrigatório      | Backend retorna HTTP 400 se FECHADO_PERDIDO sem motivoPerda preenchido                    |
| SLA primeiro contato         | Lead NOVO_LEAD criado há +24h sem nenhuma ação → alerta vermelho                          |
| Soft delete                  | DELETE /leads/:id → motivoPerda='ARQUIVADO' + deletedAt, nunca exclusão física            |
| Metas                        | Salvas em localStorage por device. Default: 12 leads / 2 contratos / R$30k receita       |
| Horário próxima ação         | `<select>` 07:00–20:00 em steps de 30min — nunca `<input type="time">` (evita OS picker) |
| nome da UnidadeFranqueada    | Nome do franqueado (pessoa), ex: 'Bernardo' — exibido na sidebar                          |
| cidade da UnidadeFranqueada  | Localização da unidade, ex: 'Salvador' → "Unidade Salvador - BA" na sidebar               |
| Score ICP                    | Calculado sempre via services/score.ts — nunca hardcoded no frontend                      |

---

## Design System

```css
--bg:        #F4F1EC   /* fundo bege quente */
--navy:      #070D1C   /* sidebar e headers */
--navy2:     #101B33
--gold:      #B88A2A   /* destaque e CTAs */
--gold-lt:   #D4A843
--blue:      #1B3D8F
--text-1:    #070D1C
--text-2:    #5F6673
--text-3:    #8C92A0
--danger:    #B4232A
--ok:        #1F7A4D
--warn:      #B7791F
--border:    #E5DFD3
--border-md: #C9BFAE
```

**Fontes:** `Plus Jakarta Sans` (corpo) · `Anton` (brand/títulos)
**Modais:** Todos custom — nunca usar `alert()`, `confirm()` ou `prompt()` nativos.

---

## Seed de Desenvolvimento

**Credenciais:** `bernardo@eapia.com.br` / `E@P2026#`
**Unidade:** Bernardo — Salvador-BA

8 leads criados com telefones (71), cidade Salvador:

| Empresa               | Estágio             | Nicho           | Contrato EAP/ano |
|-----------------------|---------------------|-----------------|------------------|
| Construtora Alpha     | EM_CONTATO          | OBRAS_PUBLICAS  | R$ 72.000        |
| Engenharia Beta       | QUALIFICADO         | RESIDENCIAL_ALTO| R$ 48.000        |
| Gamma Obras           | REUNIAO_AGENDADA    | INDUSTRIAL      | R$ 96.000        |
| Delta Construções     | NOVO_LEAD           | COMERCIAL       | R$ 36.000        |
| Epsilon Engenharia    | EM_CONTATO          | RESIDENCIAL_MEDIO| R$ 48.000       |
| Zeta Incorporações    | PROPOSTA_ENVIADA    | RESIDENCIAL_ALTO| R$ 60.000        |
| Omega Construtora     | REUNIAO_REALIZADA   | OBRAS_PUBLICAS  | R$ 54.000        |
| Sigma Obras           | NEGOCIACAO          | INDUSTRIAL      | R$ 84.000        |

---

## Comandos

```bash
# Dentro de backend/
npm run dev          # inicia servidor porta 3333 (modo watch)
npm run db:seed      # recria dados de teste
npm run db:studio    # Prisma Studio em :5555
npm run db:migrate   # aplica novas migrations
npm run db:reset     # reset completo + seed
npm run build        # compila TypeScript → dist/
```

---

## MVP Pendente

- [ ] **Dashboard Matriz** — visão consolidada da rede de franquias (multi-tenant, admin EAP)
- [ ] **Deduplicação automática** de leads por telefone/CNPJ

## Módulos Futuros

- Propostas / Contratos
- Módulo Financeiro
- Agente de Marketing
- Módulo de Onboarding
- Integração Econodata
- Deploy Cloudflare Workers + D1

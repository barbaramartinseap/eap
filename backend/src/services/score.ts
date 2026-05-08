// Cálculo de score automático de lead — baseado no ICP da EAP.
// Variáveis: obras, nicho, origem, dor, estrutura decisória.

export interface LeadScoreInput {
  qtdObrasSimultaneas: number
  nichoObra: string
  origem: string
  dorPrincipal: string
  temSocio: boolean
  equipePropia: boolean
  qtdEngenheiros: number
}

// Score 0-100
export function calcularScore(lead: LeadScoreInput): number {
  let s = 0

  // 1. Quantidade de obras (0-30)
  s += lead.qtdObrasSimultaneas >= 5 ? 30
     : lead.qtdObrasSimultaneas >= 3 ? 22
     : lead.qtdObrasSimultaneas >= 2 ? 14
     : 5

  // 2. Nicho (0-20)
  const nicho: Record<string, number> = {
    OBRAS_PUBLICAS: 20, INDUSTRIAL: 18, RESIDENCIAL_ALTO: 16,
    COMERCIAL: 13, RESIDENCIAL_MEDIO: 10, OUTRO: 7,
  }
  s += nicho[lead.nichoObra] ?? 7

  // 3. Origem (0-20)
  const origem: Record<string, number> = {
    INDICACAO: 20, PARCERIA: 18, OUTBOUND_ATIVO: 15,
    META_ADS: 13, LANDING_PAGE: 13, LINKEDIN: 12,
    INSTAGRAM: 11, LIVES_CONTEUDOS: 9, WHATSAPP: 8,
    REATIVACAO_BASE: 7, CADASTRO_MANUAL: 6,
  }
  s += origem[lead.origem] ?? 7

  // 4. Dor principal (0-20)
  const dor: Record<string, number> = {
    MUITAS_OBRAS: 20, SEM_CONTROLE_FINANCEIRO: 20,
    BAIXA_MARGEM: 17, FLUXO_CAIXA: 17,
    SEM_PREVISIBILIDADE: 14, ATRASO_OBRA: 14,
    COMPRAS_EMERGENCIAIS: 12, EQUIPE_DESORGANIZADA: 10,
    OUTRO: 7,
  }
  s += dor[lead.dorPrincipal] ?? 7

  // 5. Estrutura / decisor (0-10)
  if (lead.temSocio) s += 3
  if (lead.equipePropia) s += 3
  s += lead.qtdEngenheiros >= 3 ? 4 : lead.qtdEngenheiros >= 1 ? 2 : 0

  return Math.min(100, s)
}

export function scoreToTemperatura(score: number): string {
  if (score >= 80) return 'QUALIFICADO'
  if (score >= 65) return 'QUENTE'
  if (score >= 45) return 'MORNO'
  return 'FRIO'
}

// Calcula % de chance de fechamento pelo estágio do pipeline
export function estagioToChance(estagio: string): number {
  const map: Record<string, number> = {
    NOVO_LEAD:               5,
    EM_CONTATO:             10,
    QUALIFICADO:            20,
    REUNIAO_AGENDADA:       35,
    REUNIAO_REALIZADA:      45,
    PROPOSTA_EM_ELABORACAO: 55,
    PROPOSTA_ENVIADA:       65,
    NEGOCIACAO:             80,
    FECHADO_GANHO:         100,
    FECHADO_PERDIDO:         0,
  }
  return map[estagio] ?? 10
}

// ── Score de Urgência (Momentum) — mede urgência operacional 0-100 ──────────

export interface UrgenciaInput {
  diasParado: number
  estagioPipeline: string
  temperatura: string
  scoreIcp: number
}

export function calcularUrgencia(lead: UrgenciaInput): number {
  let s = 0

  // 1. Dias parado no estágio (0-40)
  s += lead.diasParado > 14 ? 40
     : lead.diasParado > 7  ? 35
     : lead.diasParado > 3  ? 25
     : lead.diasParado > 0  ? 15
     : 0

  // 2. Estágio crítico (0-30) — quanto mais avançado e parado, mais urgente
  const estagioScore: Record<string, number> = {
    NEGOCIACAO:               30,
    PROPOSTA_ENVIADA:         25,
    PROPOSTA_EM_ELABORACAO:   20,
    REUNIAO_REALIZADA:        20,
    REUNIAO_AGENDADA:         15,
    QUALIFICADO:              12,
    EM_CONTATO:               10,
    NOVO_LEAD:                 5,
    FECHADO_GANHO:             0,
    FECHADO_PERDIDO:           0,
  }
  s += estagioScore[lead.estagioPipeline] ?? 5

  // 3. Temperatura / potencial (0-20) — lead quente parado é mais urgente
  const tempScore: Record<string, number> = {
    QUALIFICADO: 20, QUENTE: 18, MORNO: 10, FRIO: 5,
  }
  s += tempScore[lead.temperatura] ?? 5

  // 4. SLA violado: NOVO_LEAD sem contato após 24h (+10 bonus)
  if (lead.estagioPipeline === 'NOVO_LEAD' && lead.diasParado >= 1) s += 10

  return Math.min(100, s)
}

// Converte score numérico em label de urgência
export function urgenciaToLabel(score: number): 'URGENTE' | 'ATENCAO' | 'NORMAL' {
  if (score >= 70) return 'URGENTE'
  if (score >= 40) return 'ATENCAO'
  return 'NORMAL'
}

// ── Estagnação por estágio (Playbook EAP) ───────────────────────────────────

export const STAGNATION_THRESHOLDS: Partial<Record<string, number>> = {
  NOVO_LEAD:                1,
  EM_CONTATO:               5,
  QUALIFICADO:              7,
  REUNIAO_AGENDADA:         3,
  REUNIAO_REALIZADA:        5,
  PROPOSTA_EM_ELABORACAO:   5,
  PROPOSTA_ENVIADA:         7,
  NEGOCIACAO:               7,
}

export function isEstagnado(estagio: string, diasParado: number): boolean {
  const t = STAGNATION_THRESHOLDS[estagio]
  return t != null && diasParado >= t
}

// ── Primeira tarefa ──────────────────────────────────────────────────────────

// Define a primeira tarefa com base na temperatura
export function getFirstTaskForTemp(temp: string, nomeEmpresa: string): {
  tipo: string; descricao: string; daysFromNow: number
} {
  if (temp === 'QUALIFICADO' || temp === 'QUENTE') {
    return {
      tipo: 'LIGAR',
      descricao: `Primeiro contato — ligar para ${nomeEmpresa} hoje`,
      daysFromNow: 0,
    }
  }
  if (temp === 'MORNO') {
    return {
      tipo: 'ENVIAR_EMAIL',
      descricao: `Primeiro contato — WhatsApp para ${nomeEmpresa} hoje`,
      daysFromNow: 0,
    }
  }
  return {
    tipo: 'FOLLOW_UP',
    descricao: `Nutrição inicial — follow-up com ${nomeEmpresa}`,
    daysFromNow: 3,
  }
}

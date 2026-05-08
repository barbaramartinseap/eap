// Motor de cadência EAP — baseado no Playbook Cadência Comercial EAP.
// Perfis, ganchos e sequências extraídos do playbook oficial.

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProfileType = 'OBRAS_PUBLICAS' | 'RESIDENCIAL' | 'MULTIPLAS'
export type TarefaTipo = 'LIGAR' | 'ENVIAR_EMAIL' | 'AGENDAR_REUNIAO' | 'FOLLOW_UP' | 'ENVIAR_PROPOSTA' | 'OUTRO'

export interface LeadContext {
  nomeEmpresa: string
  nomeContato: string
  telefone: string | null
  scoreIcp: number
  temperatura: string
  nichoObra: string
  qtdObrasSimultaneas: number
  estagioPipeline: string
  consultorNome?: string
}

// Gancho com 3 opções (A, B, C)
export interface GanchoOptions { a: string; b: string; c: string }

export interface LigarScriptResult {
  scriptType: 'LIGAR'
  perfil: string
  dor: string
  tentativaLabel: string
  pillarCentral: string
  ganchoInicial: GanchoOptions
  ganchoDesenvolvimento: GanchoOptions
  ctaEncerramento: GanchoOptions
  tons: { tom1: string; tom2: string; tom3: string }
  dicas: string[]
  materiaisApoio: string[]
}

export interface WhatsAppScriptResult {
  scriptType: 'WHATSAPP'
  diaLabel: string       // "Dia 1 — Apresentação"
  diaNum: number         // 1 | 4 | 8 | 12
  mensagem: string
  conteudoSugerido: string | null
  dicas: string[]
  materiaisApoio: string[]
  perfil: string
}

export interface ReuniaoScriptResult {
  scriptType: 'REUNIAO'
  abordagemAbertura: string
  pautaSugerida: string
  materiaisApoio: string[]
  dicas: string[]
  perfil: string
}

export type ScriptResult = LigarScriptResult | WhatsAppScriptResult | ReuniaoScriptResult

export interface NextTask {
  tipo: TarefaTipo
  tentativaNum: number
  daysFromNow: number
  descricao: string
}

// ─── Sequências de cadência (baseadas no playbook) ────────────────────────────

interface CadenceStep {
  tipo: TarefaTipo
  tentativaNum: number
  daysFromStart: number
}

// Cadência completa por lead novo:
// D0: Ligação (1ª bateria — até 3x no dia)
// D1: Ligação (2ª bateria — até 2x no dia)
// D1: WhatsApp apresentação (se ligação não atender)
// D4: WhatsApp follow-up com valor
// D8: WhatsApp reforço temático
// D12: WhatsApp encerramento + CTA
// Se reunião agendada → cadência pós-pauta
// D2, D4, D6: Follow-up pós-pauta (playbook: 2 em 2 dias)

const CADENCE_PROSPECCAO: CadenceStep[] = [
  { tipo: 'LIGAR',        tentativaNum: 1, daysFromStart: 0  }, // D0 — ligação 1 (manhã)
  { tipo: 'LIGAR',        tentativaNum: 2, daysFromStart: 0  }, // D0 — ligação 2 (tarde)
  { tipo: 'LIGAR',        tentativaNum: 3, daysFromStart: 0  }, // D0 — ligação 3 (fim do dia)
  { tipo: 'LIGAR',        tentativaNum: 4, daysFromStart: 1  }, // D1 — ligação 4 (manhã)
  { tipo: 'LIGAR',        tentativaNum: 5, daysFromStart: 1  }, // D1 — ligação 5 (tarde)
  { tipo: 'ENVIAR_EMAIL', tentativaNum: 1, daysFromStart: 1  }, // WhatsApp D1 apresentação
  { tipo: 'ENVIAR_EMAIL', tentativaNum: 2, daysFromStart: 4  }, // WhatsApp D4 follow-up valor
  { tipo: 'ENVIAR_EMAIL', tentativaNum: 3, daysFromStart: 8  }, // WhatsApp D8 reforço
  { tipo: 'ENVIAR_EMAIL', tentativaNum: 4, daysFromStart: 12 }, // WhatsApp D12 encerramento
]

const CADENCE_POS_PAUTA: CadenceStep[] = [
  { tipo: 'FOLLOW_UP', tentativaNum: 1, daysFromStart: 2 },
  { tipo: 'FOLLOW_UP', tentativaNum: 2, daysFromStart: 4 },
  { tipo: 'FOLLOW_UP', tentativaNum: 3, daysFromStart: 6 },
]

// ─── Perfil ──────────────────────────────────────────────────────────────────

export function detectProfile(lead: Pick<LeadContext, 'nichoObra' | 'qtdObrasSimultaneas'>): ProfileType {
  if (lead.nichoObra === 'OBRAS_PUBLICAS') return 'OBRAS_PUBLICAS'
  if (lead.nichoObra === 'RESIDENCIAL_ALTO' || lead.nichoObra === 'RESIDENCIAL_MEDIO') return 'RESIDENCIAL'
  return 'MULTIPLAS'
}

// ─── Próxima tarefa ──────────────────────────────────────────────────────────

export function getTipoInteracao(tipoTarefa: string): string {
  const m: Record<string, string> = {
    LIGAR: 'LIGACAO', ENVIAR_EMAIL: 'WHATSAPP',
    AGENDAR_REUNIAO: 'NOTA_INTERNA', FOLLOW_UP: 'NOTA_INTERNA',
  }
  return m[tipoTarefa] ?? 'NOTA_INTERNA'
}

export function getNextTask(
  lead: LeadContext,
  completedTipo: string,
  completedTentativaNum: number,
  desfecho?: string
): NextTask | null {
  // Se agendou reunião → inicia cadência pós-pauta
  if (desfecho === 'AGENDADO') {
    const first = CADENCE_POS_PAUTA[0]
    return {
      tipo: first.tipo,
      tentativaNum: first.tentativaNum,
      daysFromNow: first.daysFromStart,
      descricao: `Follow-up pós-pauta com ${lead.nomeEmpresa} — dia 2`,
    }
  }

  // Verifica se é pós-pauta
  if (completedTipo === 'FOLLOW_UP') {
    const idx = CADENCE_POS_PAUTA.findIndex(s => s.tentativaNum === completedTentativaNum)
    if (idx === -1 || idx >= CADENCE_POS_PAUTA.length - 1) return null
    const curr = CADENCE_POS_PAUTA[idx]
    const next = CADENCE_POS_PAUTA[idx + 1]
    return {
      tipo: next.tipo,
      tentativaNum: next.tentativaNum,
      daysFromNow: next.daysFromStart - curr.daysFromStart,
      descricao: `Follow-up pós-pauta com ${lead.nomeEmpresa} — dia ${next.daysFromStart}`,
    }
  }

  // Cadência de prospecção
  const idx = CADENCE_PROSPECCAO.findIndex(
    s => s.tipo === completedTipo && s.tentativaNum === completedTentativaNum
  )
  if (idx === -1 || idx >= CADENCE_PROSPECCAO.length - 1) return null

  const curr = CADENCE_PROSPECCAO[idx]
  const next = CADENCE_PROSPECCAO[idx + 1]
  const daysFromNow = next.daysFromStart - curr.daysFromStart

  const labels: Record<string, string> = {
    LIGAR:          `Ligar para ${lead.nomeEmpresa} — ${next.tentativaNum}ª bateria`,
    ENVIAR_EMAIL:   `WhatsApp para ${lead.nomeEmpresa} — ${waDayLabel(next.tentativaNum)}`,
    AGENDAR_REUNIAO:`Agendar reunião com ${lead.nomeEmpresa}`,
    FOLLOW_UP:      `Follow-up com ${lead.nomeEmpresa}`,
  }

  return {
    tipo: next.tipo,
    tentativaNum: next.tentativaNum,
    daysFromNow: Math.max(daysFromNow, 0),
    descricao: labels[next.tipo] ?? `Próxima ação com ${lead.nomeEmpresa}`,
  }
}

function waDayLabel(tentativa: number): string {
  const map: Record<number, string> = { 1: 'Dia 1 — Apresentação', 2: 'Dia 4 — Valor', 3: 'Dia 8 — Reforço', 4: 'Dia 12 — Encerramento' }
  return map[tentativa] ?? `tentativa ${tentativa}`
}

// ─── Script principal ────────────────────────────────────────────────────────

export function getScript(tipo: string, tentativaNum: number, lead: LeadContext): ScriptResult {
  if (tipo === 'LIGAR') return getLigarScript(tentativaNum, lead)
  if (tipo === 'ENVIAR_EMAIL') return getWhatsAppScript(tentativaNum, lead)
  if (tipo === 'AGENDAR_REUNIAO') return getReuniaoScript(lead)
  if (tipo === 'FOLLOW_UP') return getFollowUpScript(tentativaNum, lead)

  return {
    scriptType: 'REUNIAO',
    perfil: 'Ação genérica',
    abordagemAbertura: `Execute a ação planejada com ${lead.nomeContato}.`,
    pautaSugerida: '',
    materiaisApoio: [],
    dicas: ['Registre o resultado ao finalizar.'],
  }
}

// ─── LIGAÇÃO ─────────────────────────────────────────────────────────────────

function getLigarScript(tentativa: number, lead: LeadContext): LigarScriptResult {
  const profile = detectProfile(lead)
  const empresa = lead.nomeEmpresa
  const contato = lead.nomeContato
  const qtd = lead.qtdObrasSimultaneas

  const bateria = tentativa <= 3 ? 1 : 2
  const tentativaLabel = bateria === 1
    ? `1ª bateria — tentativa ${tentativa} de 3 (varie o horário: manhã / tarde / fim do dia)`
    : `2ª bateria — tentativa ${tentativa - 3} de 2 (varie o horário: manhã / tarde)`

  const PILAR = `"Temos um cliente com 4 obras, organizado → Faturamento R$10M | Lucro 28%.\nTemos outro com 12 canteiros, sem controle → Faturamento R$50M | PREJUÍZO.\n\nFaturamento ≠ Lucro. O controle de processos diferencia lucro de prejuízo."`

  if (profile === 'OBRAS_PUBLICAS') {
    return {
      scriptType: 'LIGAR',
      perfil: 'Obras Públicas',
      dor: 'Fluxo de caixa imprevisível, atrasos de pagamento, falta de visibilidade sobre prazos',
      tentativaLabel,
      pillarCentral: PILAR,
      ganchoInicial: {
        a: `Oi ${contato}, [Seu Nome], Gestor Executivo da EAP. Trabalho com construtoras em obras públicas sendo o braço de planejamento que gerencia prazos e custos. Fluxo de caixa é a maior dor desse setor — posso entender melhor sua operação?`,
        b: `Oi ${contato}, [Seu Nome] da EAP. Você atua em obras públicas — padrão do mercado: quem não controla prazos rigorosamente perde dinheiro com atrasos de pagamento. Tem 10 minutos pra eu entender o fluxo de caixa da ${empresa}?`,
        c: `Oi ${contato}, [Seu Nome] da EAP. Gestores como você em obras públicas estão tendo sucesso controlando fluxo de caixa com nosso sistema. Posso entender sua operação e ver uma estratégia para o crescimento saudável da ${empresa}?`,
      },
      ganchoDesenvolvimento: {
        a: `A gente fornece planejamento que deixa visível onde está o dinheiro. Isso acelera aprovações e evita os atrasos que prejudicam seu fluxo.`,
        b: `Nosso foco é antecipar problemas de prazo — você sabe com antecedência que vai atrasar, negocia melhor, recupera cronograma ou se prepara financeiramente.`,
        c: `Clientes em obras públicas conseguem reduzir surpresas de fluxo de caixa em 80% porque sabem com precisão quando vão receber e quando desembolsar.`,
      },
      ctaEncerramento: {
        a: `Perfeito. Vou enviar cases de obra pública agora. Qual dia essa semana você consegue 30 minutos? [Ofereça 2-3 datas]`,
        b: `Ótimo. Vou mandar links dos cases no Instagram. Você dá uma olhada e agendamos conversa mais profunda. Quinta ou sexta te funciona?`,
        c: `Perfeito. Tenho vagas amanhã às 10h ou quinta às 14h. Qual funciona para você?`,
      },
      tons: {
        tom1: 'URGÊNCIA + DADOS: Comece com o problema real → traga o número/caso → agende conversa profunda.',
        tom2: 'OPORTUNIDADE + RESULTADO: Comece com o que está ganhando quem controla → foco em fluxo de caixa → envie material + agende.',
        tom3: 'DIÁLOGO + DIAGNÓSTICO: Comece perguntando sobre a operação deles → valide o problema → agende diagnóstico.',
      },
      dicas: [
        `Liga até atender — ${bateria === 1 ? 'até 3 tentativas hoje' : 'até 2 tentativas hoje'}, em horários diferentes`,
        'Use UM gancho por ligação — não misture os três',
        'Feche SEMPRE com 2 datas específicas ("quinta às 10h ou sexta às 14h") — nunca pergunta aberta. Mande o convite DURANTE a ligação.',
        `Posicione ${lead.consultorNome || 'o consultor técnico'} como quem conduz o Diagnóstico Executivo (40 min) — não uma "apresentação", mas uma análise real da operação deles.`,
        'Erro a evitar: não apresente o consultor como "próxima etapa do funil" — ele entrega diagnóstico com valor próprio, independente de qualquer decisão comercial.',
        tentativa === 5 ? 'Se não atender nesta tentativa: inicie a cadência de WhatsApp (Dia 1 — Apresentação)' : '',
      ].filter(Boolean),
      materiaisApoio: [
        'Instagram EAP: @eap.assessoria — perfil com cases e conteúdo de obras públicas',
        'Case: construtora em obra pública reduziu atrasos de prazo em 60%',
        'PDF: Fluxo de Caixa em Obras Públicas (enviar após agendar pauta)',
      ],
    }
  }

  if (profile === 'RESIDENCIAL') {
    return {
      scriptType: 'LIGAR',
      perfil: 'Residencial / Incorporadora',
      dor: 'Acesso a crédito para expansão, rentabilidade por unidade/lote',
      tentativaLabel,
      pillarCentral: PILAR,
      ganchoInicial: {
        a: `Oi ${contato}, [Seu Nome], Gestor Executivo da EAP. Trabalho com incorporadoras e construtoras residenciais gerenciando planejamento e custos. Quando você prova controle, a gente te conecta com fundos e hubs de crédito. Você busca expandir com financiamento estruturado?`,
        b: `Oi ${contato}, sou [Seu Nome] da EAP. Incorporadora que quer crescer mas não tem estrutura de crédito fica presa. A gente documenta seu controle e te coloca em contato com parceiros de financiamento que conhecemos. Posso entender sua operação?`,
        c: `Oi ${contato}, [Seu Nome] da EAP. Incorporadoras que trabalham com a gente conseguem linhas de Home Equity e crédito porque têm documentação pronta. Você tem interesse em expandir com estrutura?`,
      },
      ganchoDesenvolvimento: {
        a: `A gente documenta planejamento, custos reais, cronograma. Com isso pronto, você fica elegível pra linha de crédito. Temos parceria com Fundos para te trazer essa linha.`,
        b: `Quando você tem controle documentado, não precisa pedir crédito implorando. Chega com dados que comprovam sua capacidade. Fundos veem o controle e aprovam.`,
        c: `Clientes conseguem estruturar Home Equity em 30-45 dias porque chegam com documentação pronta. Sem a gente, esse processo demora 6 meses.`,
      },
      ctaEncerramento: {
        a: `Ótimo. Vou enviar cases de incorporadoras que conseguiram linhas de financiamento. Quando você consegue 30 minutos? Segunda, terça ou quarta?`,
        b: `Perfeito. Deixa eu marcar pauta pra estruturar seu plano de crédito. Tenho quinta às 10h ou sexta à tarde.`,
        c: `Excelente. Vou agendar pauta onde a gente faz diagnóstico E traça roadmap pra crédito nos próximos meses. Qual dia funciona?`,
      },
      tons: {
        tom1: 'URGÊNCIA + DADOS: Comece com o problema de crédito → case real → agende para mostrar o roadmap.',
        tom2: 'OPORTUNIDADE + RESULTADO: Comece com o crédito que ele pode acessar → Home Equity em 30-45 dias → agende.',
        tom3: 'DIÁLOGO + DIAGNÓSTICO: Comece perguntando sobre plano de expansão → mostre o caminho → agende diagnóstico.',
      },
      dicas: [
        `Liga até atender — ${bateria === 1 ? 'até 3 tentativas hoje' : 'até 2 tentativas hoje'}, em horários diferentes`,
        'O gatilho de crédito é muito poderoso nesse perfil — use-o cedo',
        'Feche SEMPRE com data e hora específica',
        tentativa === 5 ? 'Se não atender nesta tentativa: inicie a cadência de WhatsApp (Dia 1 — Apresentação)' : '',
      ].filter(Boolean),
      materiaisApoio: [
        'Instagram EAP: @eap.assessoria — cases de incorporadoras e acesso a crédito',
        'Case: incorporadora estruturou Home Equity em 35 dias com a EAP',
        'PDF: Estrutura para Acesso a Crédito em Incorporações (enviar após agendar pauta)',
      ],
    }
  }

  // MULTIPLAS
  return {
    scriptType: 'LIGAR',
    perfil: `3+ Obras Simultâneas (${qtd} obras)`,
    dor: 'Descontrole operacional, custos saindo de mão, falta de padronização entre canteiros',
    tentativaLabel,
    pillarCentral: PILAR,
    ganchoInicial: {
      a: `Oi ${contato}, [Seu Nome], Gestor Executivo da EAP. Você gerencia ${qtd} obras — temos cliente que faturou 50 milhões em 12 canteiros e levou PREJUÍZO. Outro que faturou 10M em 4 obras e lucrou 28%. Diferença? Controle. Temos 10 minutos?`,
      b: `Oi ${contato}, [Seu Nome] da EAP. Com ${qtd} obras simultâneas, descontrole é inevitável — a menos que você tenha sistema. A gente fornece esse sistema. Pode conversar rapidinho?`,
      c: `Oi ${contato}, [Seu Nome] da EAP. Construtoras com múltiplas obras que trabalham com a gente conseguem recuperar margem entre 5-15% só descobrindo onde está vazando dinheiro. A ${empresa} passa por isso? 10 minutos?`,
    },
    ganchoDesenvolvimento: {
      a: `Com ${qtd} obras, o problema não é falta de operação — é falta de visibilidade. Você não sabe qual obra drena dinheiro até ficar tarde. A gente torna isso visível em tempo real.`,
      b: `Cada obra gerenciada de um jeito diferente cria ineficiência. A gente padroniza processos, treina seu time uma vez, reaplica em todas as obras.`,
      c: `Você descobre em cada canteiro: qual está ganhando, qual está perdendo, qual está no limite. Isso permite realocação de recursos e ajustes rápidos.`,
    },
    ctaEncerramento: {
      a: `Ótimo. Vou enviar case de empresa com ${qtd > 5 ? '8' : '5'} obras que recuperou margem. Quando você consegue conversa mais profunda? Segunda ou quarta?`,
      b: `Perfeito. Vou mandar diagnóstico rápido baseado em construtoras similares. Agendamos pauta pra você ver os resultados? Qual dia funciona essa semana?`,
      c: `Excelente. Deixa eu marcar reunião de 30 minutos pra estruturar o plano. Tenho quinta às 16h ou sexta de manhã. Qual funciona?`,
    },
    tons: {
      tom1: 'URGÊNCIA + DADOS: Abra com o caso "R$50M = prejuízo" → impacto imediato → agende.',
      tom2: 'OPORTUNIDADE + RESULTADO: Comece com "recuperar 5-15% de margem" → benefício concreto → envie case + agende.',
      tom3: 'DIÁLOGO + DIAGNÓSTICO: Pergunte sobre a maior dor com múltiplas obras → valide → agende diagnóstico.',
    },
    materiaisApoio: [
      'Instagram EAP: @eap.assessoria — cases de construtoras com múltiplas obras',
      `Case: construtora com ${lead.qtdObrasSimultaneas > 5 ? '8' : '5'} obras recuperou 12% de margem com padronização EAP`,
      'PDF: Padronização de Canteiros em Escala (enviar após agendar pauta)',
    ],
    dicas: [
      `Liga até atender — ${tentativa === 1 ? 'até 3 tentativas hoje' : 'até 2 tentativas hoje'}, em horários diferentes`,
      'O caso "50M = prejuízo vs 10M = lucro" é o argumento mais forte desse perfil',
      'Feche SEMPRE com data e hora específica',
      tentativa === 5 ? 'Se não atender nesta tentativa: inicie a cadência de WhatsApp (Dia 1 — Apresentação)' : '',
    ].filter(Boolean),
  }
}

// ─── WHATSAPP ────────────────────────────────────────────────────────────────

function nichoWaLabel(nichoObra: string): string {
  const m: Record<string, string> = {
    OBRAS_PUBLICAS:    'obras públicas',
    RESIDENCIAL_ALTO:  'construção residencial alto padrão',
    RESIDENCIAL_MEDIO: 'construção residencial',
    INDUSTRIAL:        'obras industriais',
    COMERCIAL:         'obras comerciais',
    OUTRO:             'construção civil',
  }
  return m[nichoObra] ?? 'construção civil'
}

function getWhatsAppScript(tentativaNum: number, lead: LeadContext): WhatsAppScriptResult {
  const profile = detectProfile(lead)
  const contato = lead.nomeContato
  const nicho = nichoWaLabel(lead.nichoObra)
  const perfilLabels: Record<ProfileType, string> = {
    OBRAS_PUBLICAS: 'Obras Públicas',
    RESIDENCIAL:    'Residencial / Incorporadora',
    MULTIPLAS:      'Múltiplas Obras',
  }
  const perfilLabel = perfilLabels[profile]

  if (tentativaNum === 1) {
    return {
      scriptType: 'WHATSAPP',
      diaLabel: 'Dia 1 — Apresentação',
      diaNum: 1,
      perfil: perfilLabel,
      mensagem: `Oi, ${contato}. Tudo bem?

Aqui é [SEU NOME], da EAP.

Vi que vocês atuam com ${nicho} e achei que fazia sentido te chamar.

A EAP ajuda construtoras a terem mais controle sobre prazo, custo, caixa e rotina de obra.

Hoje vocês estão com quantas obras em andamento?`,
      conteudoSugerido: null,
      dicas: [
        'Mensagem curta e direta — não force resposta.',
        'Se responder, faça UMA pergunta de qualificação por vez.',
        'Não envie PDF ou material neste dia.',
        'Se demonstrar interesse, conduza para agendamento.',
      ],
      materiaisApoio: [
        'Instagram EAP: @eap.assessoria',
      ],
    }
  }

  if (tentativaNum === 2) {
    const conteudo = getConteudoPorPerfil(profile, 1)
    const tipoLabel = conteudo.tipo === 'pdf' ? 'material' : conteudo.tipo === 'podcast' ? 'podcast' : 'case'
    return {
      scriptType: 'WHATSAPP',
      diaLabel: 'Dia 4 — Follow-up com Valor',
      diaNum: 4,
      perfil: perfilLabel,
      mensagem: `${contato}, passando para te deixar esse ${tipoLabel}.

Ele conversa bastante com empresas que atuam com ${nicho} e precisam controlar várias frentes ao mesmo tempo.

O ponto principal é: não basta ter obra rodando. Precisa enxergar prazo, custo e caixa por contrato.

Faz sentido para o momento de vocês?`,
      conteudoSugerido: `${conteudo.tipo.toUpperCase()}: ${conteudo.titulo}\n${conteudo.descricao}`,
      dicas: [
        'Envie o material somente se o lead confirmar interesse.',
        'Se responder positivamente, conduza direto para agendamento.',
        'Não insista se não houver resposta.',
      ],
      materiaisApoio: [
        `${conteudo.tipo.toUpperCase()}: ${conteudo.titulo}`,
        conteudo.descricao,
      ],
    }
  }

  if (tentativaNum === 3) {
    return {
      scriptType: 'WHATSAPP',
      diaLabel: 'Dia 8 — Reforço Temático',
      diaNum: 8,
      perfil: perfilLabel,
      mensagem: `${contato}, só reforçando um ponto.

Em empresas que atuam com ${nicho}, o problema geralmente não aparece de uma vez.

Ele começa no cronograma, passa pelo custo, pressiona o caixa e só depois vira urgência na gestão.

Hoje vocês conseguem enxergar esses desvios com antecedência?`,
      conteudoSugerido: null,
      dicas: [
        'Não envie material adicional — a mensagem já é o conteúdo.',
        'Se responder, qualifique: pergunte sobre prazo, custo ou caixa.',
        'Foco em gerar reflexão antes do encerramento no Dia 12.',
      ],
      materiaisApoio: [],
    }
  }

  // Dia 12 — Encerramento
  return {
    scriptType: 'WHATSAPP',
    diaLabel: 'Dia 12 — Encerramento',
    diaNum: 12,
    perfil: perfilLabel,
    mensagem: `${contato}, última mensagem minha sobre esse assunto.

A EAP costuma fazer sentido quando a construtora já tem obra rodando e precisa melhorar controle de prazo, custo, caixa e tomada de decisão.

Se isso for prioridade agora, vale marcarmos uma conversa rápida.

Se não for o momento, sem problema.`,
    conteudoSugerido: null,
    dicas: [
      'Sem material adicional — apenas CTA limpo.',
      'Se responder com interesse → agende a pauta direto.',
      'Se responder sem interesse → encerre como PERDIDO.',
      'Se não responder → marque como FRIO (reativar em 30 dias).',
    ],
    materiaisApoio: [],
  }
}

interface ConteudoSugerido { tipo: 'pdf' | 'podcast' | 'case'; titulo: string; descricao: string }

function getConteudoPorPerfil(profile: ProfileType, slot: 1 | 2): ConteudoSugerido {
  const conteudos: Record<ProfileType, [ConteudoSugerido, ConteudoSugerido]> = {
    OBRAS_PUBLICAS: [
      { tipo: 'pdf', titulo: 'Fluxo de Caixa em Obras Públicas', descricao: 'Como antecipar atrasos de pagamento e proteger sua margem' },
      { tipo: 'podcast', titulo: 'Gestão de Obras Públicas na Prática', descricao: 'Episódio com construtoras que reduziram atrasos em 60%' },
    ],
    RESIDENCIAL: [
      { tipo: 'pdf', titulo: 'Estrutura para Acesso a Crédito em Incorporações', descricao: 'O que bancos e fundos exigem para liberar Home Equity' },
      { tipo: 'podcast', titulo: 'Incorporação com Funding Inteligente', descricao: 'Cases de incorporadoras que estruturaram crédito com a EAP' },
    ],
    MULTIPLAS: [
      { tipo: 'case', titulo: 'Case: Construtora com 8 Obras Recuperou 12% de Margem', descricao: 'Como a padronização de processos revelou onde o dinheiro estava vazando' },
      { tipo: 'pdf', titulo: 'Padronização de Canteiros em Escala', descricao: 'Framework para gestão de múltiplas obras com um único método' },
    ],
  }
  return conteudos[profile][slot - 1]
}

// ─── REUNIÃO / PÓS-PAUTA ────────────────────────────────────────────────────

function getReuniaoScript(lead: LeadContext): ReuniaoScriptResult {
  const profile = detectProfile(lead)
  const empresa = lead.nomeEmpresa
  const contato = lead.nomeContato

  const pautaSugerida = [
    'Me conta, hoje… como funciona o modelo de negócio da sua empresa?',
    'Quantas obras você tem em andamento hoje?',
    'E no dia a dia… quem que puxa mais essa operação aí? É você mesmo ou tem alguém à frente?',
    'Hoje vocês trabalham mais com obra própria, incorporação ou prestação de serviço?',
    'Agora me diz uma coisa… como tá o planejamento dessas obras hoje?',
    'Vocês têm um planejamento estruturado mesmo ou vai mais no ajuste do dia a dia?',
    'Com que frequência você revisa o andamento das obras?',
    'Você sente que consegue se antecipar aos problemas… ou normalmente resolve quando já estourou?',
    'E na prática… o que mais tem te dado dor de cabeça hoje na operação?',
    'Essas compras emergenciais… acontecem com frequência aí?',
    'Você já parou pra pensar quanto isso impacta no teu resultado?',
    'Já teve obra que parecia que ia dar lucro… e no final não entregou o que você esperava?',
    'Hoje existe um processo padrão nas suas obras… ou cada uma acaba rodando de um jeito?',
    'Você sente que sua equipe depende mais de sistema… ou da experiência e memória no dia a dia?',
    'Quando aparece um problema… existe um caminho claro de resolução ou vai sendo resolvido conforme aparece?',
    'Se eu te perguntar agora… quantos problemas existem hoje nas suas obras… você consegue me responder?',
    'O que hoje mais tira teu controle da operação?',
    'E onde você sente que tá deixando dinheiro na mesa… mesmo sem perceber?',
    'Me fala com sinceridade… isso que a gente tá falando aqui… é algo que você quer resolver agora ou ainda tá entendendo o cenário?',
    'Se continuar do jeito que tá hoje… o que tende a acontecer com a tua operação?',
    'Você já tentou estruturar isso antes ou ainda não teve tempo de parar pra organizar?',
    'Faz sentido pra você ter esse tipo de controle dentro da sua operação?',
    'O que mais te chamou atenção até aqui?',
    'Você consegue se enxergar operando dessa forma no dia a dia?',
    'O que você precisaria ver pra dar o próximo passo com segurança?',
  ].map((q, i) => `${i + 1}. ${q}`).join('\n')

  const materiais: Record<ProfileType, string[]> = {
    OBRAS_PUBLICAS: [
      'Apresentação EAP — módulo obras públicas',
      'Case: construtora reduziu atrasos de prazo em 60%',
      'PDF: Fluxo de caixa em obras públicas',
    ],
    RESIDENCIAL: [
      'Apresentação EAP — módulo incorporação',
      'Case: incorporadora estruturou Home Equity em 35 dias',
      'PDF: Estrutura de crédito para incorporadoras',
    ],
    MULTIPLAS: [
      'Apresentação EAP — módulo múltiplas obras',
      `Case: construtora com ${lead.qtdObrasSimultaneas > 5 ? '8' : '5'} obras recuperou 12% de margem`,
      'PDF: Padronização de canteiros em escala',
    ],
  }

  const perfilLabels: Record<ProfileType, string> = {
    OBRAS_PUBLICAS: 'Obras Públicas',
    RESIDENCIAL:    'Residencial / Incorporadora',
    MULTIPLAS:      'Múltiplas Obras',
  }
  return {
    scriptType: 'REUNIAO',
    abordagemAbertura: `"${contato}, hoje quero entender a realidade de vocês ANTES de qualquer apresentação. Me conta: qual é o maior gargalo de gestão que você enfrenta hoje nas obras da ${empresa}?"`,
    pautaSugerida,
    materiaisApoio: materiais[profile],
    perfil: perfilLabels[profile],
    dicas: [
      'Comece ouvindo — o diagnóstico vale mais que o pitch',
      'Anote os pontos de dor para usar na proposta',
      'Feche a pauta com próximos passos e data específica',
      'Critérios de qualificação: 2+ obras, decisor, equipe mínima, R$3k/mês',
    ],
  }
}

function getFollowUpScript(tentativaNum: number, lead: LeadContext): ReuniaoScriptResult {
  const dias: Record<number, number> = { 1: 2, 2: 4, 3: 6 }
  const dia = dias[tentativaNum] ?? tentativaNum * 2
  const empresa = lead.nomeEmpresa
  const contato = lead.nomeContato

  return {
    scriptType: 'REUNIAO',
    perfil: `Follow-up ${empresa}`,
    abordagemAbertura: `Follow-up pós-pauta — Dia ${dia} após a reunião com ${contato}`,
    pautaSugerida: tentativaNum === 1
      ? `1. Como ficou depois da nossa conversa?\n2. Alguma dúvida sobre a proposta?\n3. Quem mais precisa estar envolvido na decisão?\n4. Qual é o prazo esperado para a decisão?\n5. Próximo passo concreto`
      : tentativaNum === 2
        ? `1. Validar se recebeu/leu a proposta\n2. Objeções específicas — tratar uma a uma\n3. Ajuste de proposta se necessário\n4. Data de decisão`
        : `1. Última tentativa — decisão ou prazo\n2. Se não há interesse: encerrar com profissionalismo\n3. Se timing ruim: agendar recontato específico`,
    materiaisApoio: tentativaNum === 1
      ? ['Proposta enviada após a pauta', 'Case mencionado na reunião']
      : tentativaNum === 2
        ? ['Proposta ajustada (se necessário)', 'ROI calculado para o perfil da empresa']
        : ['Proposta final'],
    dicas: [
      tentativaNum === 1 ? '3 contatos no dia 2 (WhatsApp + ligação + e-mail se necessário)' : '',
      'Objetivo: quebrar inércia e fechar decisão',
      tentativaNum === 3 ? 'Se não fechar: marque como FRIO ou PERDIDO conforme a resposta' : 'Não pressione — construa urgência por valor',
    ].filter(Boolean),
  }
}

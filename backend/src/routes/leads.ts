import { FastifyPluginAsync } from 'fastify'
import { calcularScore, scoreToTemperatura, estagioToChance, getFirstTaskForTemp, calcularUrgencia, isEstagnado, STAGNATION_THRESHOLDS } from '../services/score'

const leadsRoute: FastifyPluginAsync = async (fastify) => {

  // ── GET /leads/summary — resumo executivo diário ──────────────────
  fastify.get('/summary', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { unidadeId } = request.user
    const ativos = { notIn: ['FECHADO_GANHO', 'FECHADO_PERDIDO'] }

    const [
      quentesSemContato, reunioesComPotencial, leadosParados,
      emCadencia, leadNovos,
    ] = await Promise.all([
      fastify.prisma.lead.count({
        where: { unidadeId, temperatura: { in: ['QUENTE', 'QUALIFICADO'] }, diasParado: { gte: 1 }, estagioPipeline: ativos },
      }),
      fastify.prisma.lead.count({
        where: { unidadeId, estagioPipeline: 'REUNIAO_REALIZADA' },
      }),
      fastify.prisma.lead.count({
        where: { unidadeId, diasParado: { gte: 7 }, estagioPipeline: ativos },
      }),
      fastify.prisma.tarefa.count({
        where: { unidadeId, status: 'PENDENTE' },
      }),
      fastify.prisma.lead.count({
        where: { unidadeId, createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } },
      }),
    ])

    const focoLeads = await fastify.prisma.lead.findMany({
      where: { unidadeId, estagioPipeline: ativos },
      orderBy: [{ scoreIcp: 'desc' }, { diasParado: 'desc' }],
      take: 3,
      select: { id: true, nomeEmpresa: true, scoreIcp: true, temperatura: true, diasParado: true, estagioPipeline: true },
    })

    const slaLimit = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const foraDeSLA = await fastify.prisma.lead.count({
      where: { unidadeId, estagioPipeline: 'NOVO_LEAD', createdAt: { lt: slaLimit } },
    })

    return { quentesSemContato, reunioesComPotencial, leadosParados, emCadencia, leadNovos, focoLeads, foraDeSLA }
  })

  // ── GET /leads/kpis ───────────────────────────────────────────────
  fastify.get('/kpis', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { unidadeId } = request.user
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
    const ativos = { notIn: ['FECHADO_GANHO', 'FECHADO_PERDIDO'] }

    const [
      totalMes, novosHoje, qualificados, leadsAtivos,
      semAcao, reunioesMarcadas, propostasAbertas, fechamentosMes,
    ] = await Promise.all([
      fastify.prisma.lead.count({ where: { unidadeId, createdAt: { gte: inicioMes } } }),
      fastify.prisma.lead.count({ where: { unidadeId, createdAt: { gte: hoje } } }),
      fastify.prisma.lead.count({ where: { unidadeId, scoreIcp: { gte: 65 }, estagioPipeline: ativos } }),
      fastify.prisma.lead.count({ where: { unidadeId, estagioPipeline: ativos } }),
      fastify.prisma.lead.count({ where: { unidadeId, diasParado: { gte: 5 }, estagioPipeline: ativos } }),
      fastify.prisma.lead.count({ where: { unidadeId, estagioPipeline: 'REUNIAO_AGENDADA' } }),
      fastify.prisma.lead.count({ where: { unidadeId, estagioPipeline: { in: ['PROPOSTA_ENVIADA', 'NEGOCIACAO'] } } }),
      fastify.prisma.lead.count({ where: { unidadeId, estagioPipeline: 'FECHADO_GANHO', updatedAt: { gte: inicioMes } } }),
    ])

    const totalMesTotal = await fastify.prisma.lead.count({ where: { unidadeId, createdAt: { gte: inicioMes } } })
    const taxaConversao = totalMesTotal > 0 ? Math.round((fechamentosMes / totalMesTotal) * 100) : 0

    // Previsão de receita (soma ponderada por chance de fechamento)
    const leadsComFaturamento = await fastify.prisma.lead.findMany({
      where: { unidadeId, estagioPipeline: ativos, faturamentoEstimado: { not: null } },
      select: { faturamentoEstimado: true, chanceFechamento: true },
    })
    // faturamentoEstimado is stored as string like "50000" or "50k-100k"
    const previsaoMRR = leadsComFaturamento.reduce((acc, l) => {
      const val = parseFloat((l.faturamentoEstimado ?? '0').replace(/[^0-9.]/g, '')) || 0
      return acc + (val * (l.chanceFechamento / 100))
    }, 0)

    return {
      totalMes, novosHoje, qualificados, leadsAtivos,
      semAcao, reunioesMarcadas, propostasAbertas, fechamentosMes,
      taxaConversao, previsaoMRR: Math.round(previsaoMRR),
    }
  })

  // ── GET /leads — lista com filtros ────────────────────────────────
  fastify.get<{
    Querystring: {
      search?: string; temperatura?: string; nicho?: string
      origem?: string; estagio?: string; parados?: string
      comReuniao?: string; comProposta?: string; estagnado?: string
      take?: string; skip?: string
    }
  }>('/', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { unidadeId } = request.user
    const { search, temperatura, nicho, origem, estagio, parados, comReuniao, comProposta, estagnado } = request.query
    const take = Math.min(parseInt(request.query.take ?? '50'), 100)
    const skip = parseInt(request.query.skip ?? '0')

    const where: Record<string, unknown> = { unidadeId }

    if (search) {
      where.OR = [
        { nomeEmpresa: { contains: search } },
        { nomeContato: { contains: search } },
        { cidade: { contains: search } },
      ]
    }
    if (temperatura) where.temperatura = temperatura
    if (nicho) where.nichoObra = nicho
    if (origem) where.origem = origem
    if (estagio) where.estagioPipeline = estagio
    if (parados === 'true') where.diasParado = { gte: 5 }
    if (comReuniao === 'true') where.estagioPipeline = 'REUNIAO_AGENDADA'
    if (comProposta === 'true') where.estagioPipeline = { in: ['PROPOSTA_ENVIADA', 'NEGOCIACAO'] }
    if (estagnado === 'true') {
      where.OR = Object.entries(STAGNATION_THRESHOLDS).map(([est, dias]) => ({
        estagioPipeline: est,
        diasParado: { gte: dias },
      }))
    }

    const [leads, total] = await Promise.all([
      fastify.prisma.lead.findMany({
        where,
        orderBy: [{ scoreIcp: 'desc' }, { diasParado: 'desc' }, { updatedAt: 'desc' }],
        take, skip,
        include: {
          tarefas: {
            where: { status: 'PENDENTE' },
            orderBy: { dataVencimento: 'asc' },
            take: 1,
          },
          notas: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      fastify.prisma.lead.count({ where }),
    ])

    return {
      total,
      leads: leads.map(l => ({ ...l, estagnado: isEstagnado(l.estagioPipeline, l.diasParado) })),
    }
  })

  // ── GET /leads/:id — lead individual com timeline ─────────────────
  fastify.get<{ Params: { id: string } }>('/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { unidadeId } = request.user
    const { id } = request.params

    const lead = await fastify.prisma.lead.findFirst({
      where: { id, unidadeId },
      include: {
        tarefas: {
          orderBy: { dataVencimento: 'asc' },
        },
        notas: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        oportunidades: true,
      },
    })

    if (!lead) return reply.code(404).send({ error: 'Lead não encontrado' })
    return lead
  })

  // ── POST /leads — criar lead com score automático ─────────────────
  fastify.post<{ Body: Record<string, unknown>; Querystring: { force?: string } }>('/', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['nomeEmpresa', 'nomeContato', 'nichoObra', 'origem'],
        properties: {
          nomeEmpresa:         { type: 'string' },
          nomeContato:         { type: 'string' },
          telefone:            { type: 'string' },
          whatsapp:            { type: 'string' },
          email:               { type: 'string' },
          cidade:              { type: 'string' },
          instagram:           { type: 'string' },
          site:                { type: 'string' },
          nichoObra:           { type: 'string' },
          qtdObrasSimultaneas: { type: 'number' },
          faturamentoEstimado: { type: 'string' },
          temSocio:            { type: 'boolean' },
          equipePropia:        { type: 'boolean' },
          qtdEngenheiros:      { type: 'number' },
          dorPrincipal:        { type: 'string' },
          origem:              { type: 'string' },
          responsavel:         { type: 'string' },
          observacoes:         { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { unidadeId, nome: responsavelDefault } = request.user
    const body = request.body as Record<string, unknown>

    // ── Deduplicação por telefone ─────────────────────────────────
    if (body.telefone && request.query.force !== 'true') {
      const inputDigits = String(body.telefone).replace(/\D/g, '')
      if (inputDigits.length >= 8) {
        const leadsComTel = await fastify.prisma.lead.findMany({
          where: { unidadeId, telefone: { not: null } },
          select: { id: true, nomeEmpresa: true, telefone: true },
        })
        const dup = leadsComTel.find(l => l.telefone!.replace(/\D/g, '') === inputDigits)
        if (dup) {
          return reply.code(409).send({
            error: `Já existe um lead com este telefone: ${dup.nomeEmpresa}`,
            code: 'LEAD_DUPLICADO',
            leadId: dup.id,
            nomeEmpresa: dup.nomeEmpresa,
          })
        }
      }
    }

    const scoreInput = {
      qtdObrasSimultaneas: Number(body.qtdObrasSimultaneas ?? 1),
      nichoObra:    String(body.nichoObra ?? 'OUTRO'),
      origem:       String(body.origem ?? 'CADASTRO_MANUAL'),
      dorPrincipal: String(body.dorPrincipal ?? 'OUTRO'),
      temSocio:     Boolean(body.temSocio),
      equipePropia: Boolean(body.equipePropia),
      qtdEngenheiros: Number(body.qtdEngenheiros ?? 0),
    }

    const score = calcularScore(scoreInput)
    const temperatura = scoreToTemperatura(score)
    const chance = estagioToChance('NOVO_LEAD')
    const urgencia = calcularUrgencia({ diasParado: 0, estagioPipeline: 'NOVO_LEAD', temperatura, scoreIcp: score })

    const lead = await fastify.prisma.lead.create({
      data: {
        nomeEmpresa:         String(body.nomeEmpresa),
        nomeContato:         String(body.nomeContato),
        telefone:            body.telefone ? String(body.telefone) : undefined,
        whatsapp:            body.whatsapp ? String(body.whatsapp) : undefined,
        email:               body.email ? String(body.email) : undefined,
        cidade:              body.cidade ? String(body.cidade) : undefined,
        instagram:           body.instagram ? String(body.instagram) : undefined,
        site:                body.site ? String(body.site) : undefined,
        nichoObra:           scoreInput.nichoObra,
        qtdObrasSimultaneas: scoreInput.qtdObrasSimultaneas,
        faturamentoEstimado: body.faturamentoEstimado ? String(body.faturamentoEstimado) : undefined,
        temSocio:            scoreInput.temSocio,
        equipePropia:        scoreInput.equipePropia,
        qtdEngenheiros:      scoreInput.qtdEngenheiros,
        dorPrincipal:        scoreInput.dorPrincipal,
        origem:              scoreInput.origem,
        scoreIcp:            score,
        scoreUrgencia:       urgencia,
        temperatura,
        chanceFechamento:    chance,
        responsavel:         body.responsavel ? String(body.responsavel) : responsavelDefault,
        observacoes:         body.observacoes ? String(body.observacoes) : undefined,
        estagioPipeline:     'NOVO_LEAD',
        unidadeId,
      },
    })

    // Cria primeira tarefa automaticamente (Block 10)
    const firstTask = getFirstTaskForTemp(temperatura, lead.nomeEmpresa)
    const dataVencimento = new Date()
    dataVencimento.setDate(dataVencimento.getDate() + firstTask.daysFromNow)
    dataVencimento.setHours(9, 0, 0, 0)

    await fastify.prisma.tarefa.create({
      data: {
        tipo:          firstTask.tipo,
        descricao:     firstTask.descricao,
        dataVencimento,
        tentativaNum:  1,
        leadId:        lead.id,
        unidadeId,
      },
    })

    // Nota de entrada no timeline
    await fastify.prisma.notaInteracao.create({
      data: {
        tipo:     'NOTA_INTERNA',
        conteudo: `Lead criado. Score ICP: ${score} — ${temperatura}. Origem: ${scoreInput.origem}.`,
        leadId:   lead.id,
        unidadeId,
      },
    })

    return { ...lead, primeiraAcao: firstTask }
  })

  // ── PATCH /leads/:id — atualizar lead ─────────────────────────────
  fastify.patch<{ Params: { id: string }; Body: Record<string, unknown> }>('/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { unidadeId } = request.user
    const { id } = request.params
    const body = request.body

    const exists = await fastify.prisma.lead.findFirst({ where: { id, unidadeId } })
    if (!exists) return reply.code(404).send({ error: 'Lead não encontrado' })

    // Motivo de perda obrigatório
    if (body.estagioPipeline === 'FECHADO_PERDIDO') {
      const motivo = body.motivoPerda ?? exists.motivoPerda
      if (!motivo || String(motivo).trim() === '' || motivo === 'ARQUIVADO') {
        return reply.code(400).send({ error: 'Motivo de perda obrigatório ao encerrar lead.' })
      }
    }

    // Recalcula score se campos relevantes mudaram
    const scoreFields = ['qtdObrasSimultaneas','nichoObra','origem','dorPrincipal','temSocio','equipePropia','qtdEngenheiros']
    const needsRescore = scoreFields.some(f => body[f] !== undefined)

    let scoreData: Record<string, unknown> = {}
    if (needsRescore) {
      const scoreInput = {
        qtdObrasSimultaneas: Number(body.qtdObrasSimultaneas ?? exists.qtdObrasSimultaneas),
        nichoObra:    String(body.nichoObra ?? exists.nichoObra),
        origem:       String(body.origem ?? exists.origem),
        dorPrincipal: String(body.dorPrincipal ?? exists.dorPrincipal),
        temSocio:     Boolean(body.temSocio ?? exists.temSocio),
        equipePropia: Boolean(body.equipePropia ?? exists.equipePropia),
        qtdEngenheiros: Number(body.qtdEngenheiros ?? exists.qtdEngenheiros),
      }
      const score = calcularScore(scoreInput)
      scoreData = { scoreIcp: score, temperatura: scoreToTemperatura(score) }
    }

    // Recalcula urgência sempre (diasParado e estagio podem ter mudado)
    const urgenciaAtual = calcularUrgencia({
      diasParado:      Number(body.diasParado ?? exists.diasParado),
      estagioPipeline: String(body.estagioPipeline ?? exists.estagioPipeline),
      temperatura:     String(scoreData.temperatura ?? exists.temperatura),
      scoreIcp:        Number(scoreData.scoreIcp ?? exists.scoreIcp),
    })
    scoreData.scoreUrgencia = urgenciaAtual

    // Atualiza chance se estágio mudou
    let chanceData = {}
    if (body.estagioPipeline) {
      chanceData = { chanceFechamento: estagioToChance(String(body.estagioPipeline)) }
    }

    const allowedFields = [
      'nomeEmpresa','nomeContato','telefone','whatsapp','email','cidade',
      'instagram','site','nichoObra','qtdObrasSimultaneas','faturamentoEstimado',
      'temSocio','equipePropia','qtdEngenheiros','dorPrincipal','origem',
      'estagioPipeline','responsavel','motivoPerda','observacoes','diasParado',
    ]

    const updateData: Record<string, unknown> = { ...scoreData, ...chanceData }
    for (const key of allowedFields) {
      if (body[key] !== undefined) updateData[key] = body[key]
    }

    const updated = await fastify.prisma.lead.update({ where: { id }, data: updateData })
    return updated
  })

  // ── DELETE /leads/:id — arquivar lead ─────────────────────────────
  fastify.delete<{ Params: { id: string } }>('/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { unidadeId } = request.user
    const { id } = request.params
    const exists = await fastify.prisma.lead.findFirst({ where: { id, unidadeId } })
    if (!exists) return reply.code(404).send({ error: 'Lead não encontrado' })
    // Soft delete: move para perdido com motivo 'ARQUIVADO'
    await fastify.prisma.lead.update({
      where: { id },
      data: { estagioPipeline: 'FECHADO_PERDIDO', motivoPerda: 'ARQUIVADO' },
    })
    return { success: true }
  })

  // ── GET /leads/:id/timeline — linha do tempo ──────────────────────
  fastify.get<{ Params: { id: string } }>('/:id/timeline', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { unidadeId } = request.user
    const { id } = request.params

    const lead = await fastify.prisma.lead.findFirst({ where: { id, unidadeId }, select: { id: true } })
    if (!lead) return reply.code(404).send({ error: 'Lead não encontrado' })

    const [notas, tarefas] = await Promise.all([
      fastify.prisma.notaInteracao.findMany({
        where: { leadId: id },
        orderBy: { createdAt: 'asc' },
      }),
      fastify.prisma.tarefa.findMany({
        where: { leadId: id },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    // Merge e ordena por data
    const timeline = [
      ...notas.map(n => ({ type: 'nota', date: n.createdAt, ...n })),
      ...tarefas.map(t => ({ type: 'tarefa', date: t.createdAt, ...t })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return { timeline }
  })
}

export default leadsRoute

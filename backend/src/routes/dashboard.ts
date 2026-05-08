import { FastifyPluginAsync } from 'fastify'
import { STAGNATION_THRESHOLDS } from '../services/score'

const dashboardRoute: FastifyPluginAsync = async (fastify) => {

  // GET /dashboard/franqueado
  fastify.get('/franqueado', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { unidadeId } = request.user
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const ativos = { notIn: ['FECHADO_GANHO', 'FECHADO_PERDIDO'] }

    // ── Metas mensais EAP: 12 leads qualificados, 2 contratos ──
    const [
      leadsQualificadosMes, contratosMes, leadsMes,
      reunioesMes, propostasMes,
    ] = await Promise.all([
      fastify.prisma.lead.count({ where: { unidadeId, scoreIcp: { gte: 65 }, createdAt: { gte: startOfMonth } } }),
      fastify.prisma.lead.count({ where: { unidadeId, estagioPipeline: 'FECHADO_GANHO', updatedAt: { gte: startOfMonth } } }),
      fastify.prisma.lead.count({ where: { unidadeId, createdAt: { gte: startOfMonth } } }),
      fastify.prisma.lead.count({ where: { unidadeId, estagioPipeline: { in: ['REUNIAO_AGENDADA','REUNIAO_REALIZADA','PROPOSTA_EM_ELABORACAO','PROPOSTA_ENVIADA','NEGOCIACAO','FECHADO_GANHO'] } } }),
      fastify.prisma.lead.count({ where: { unidadeId, estagioPipeline: { in: ['PROPOSTA_ENVIADA','NEGOCIACAO','FECHADO_GANHO'] } } }),
    ])

    const taxaConversao = leadsMes > 0 ? Math.round((contratosMes / leadsMes) * 100) : 0

    // ── Receita realizada este mês (contratos fechados) ──
    const fechadosMes = await fastify.prisma.lead.findMany({
      where: { unidadeId, estagioPipeline: 'FECHADO_GANHO', updatedAt: { gte: startOfMonth }, faturamentoEstimado: { not: null } },
      select: { faturamentoEstimado: true },
    })
    const receitaRealizada = Math.round(fechadosMes.reduce((acc, l) => {
      const val = parseFloat((l.faturamentoEstimado ?? '0').replace(/[^0-9.]/g, '')) || 0
      return acc + val
    }, 0))

    // ── Receita em pipeline (ponderada por chance — informacional) ──
    const leadsComFat = await fastify.prisma.lead.findMany({
      where: { unidadeId, estagioPipeline: ativos, faturamentoEstimado: { not: null } },
      select: { faturamentoEstimado: true, chanceFechamento: true },
    })
    const receitaPrevista = Math.round(leadsComFat.reduce((acc, l) => {
      const val = parseFloat((l.faturamentoEstimado ?? '0').replace(/[^0-9.]/g, '')) || 0
      return acc + (val * (l.chanceFechamento / 100))
    }, 0))

    // ── Tempo médio de ciclo (dias) nos fechados deste mês ──
    const fechados = await fastify.prisma.lead.findMany({
      where: { unidadeId, estagioPipeline: 'FECHADO_GANHO', updatedAt: { gte: startOfMonth } },
      select: { createdAt: true, updatedAt: true },
    })
    const tempoMedioCiclo = fechados.length > 0
      ? Math.round(fechados.reduce((acc, l) =>
          acc + (new Date(l.updatedAt).getTime() - new Date(l.createdAt).getTime()) / 86400000, 0
        ) / fechados.length)
      : 0

    // ── Funil de conversão ──
    const [total, quali, comReuniao, comProposta, comContrato] = await Promise.all([
      fastify.prisma.lead.count({ where: { unidadeId } }),
      fastify.prisma.lead.count({ where: { unidadeId, scoreIcp: { gte: 65 } } }),
      fastify.prisma.lead.count({ where: { unidadeId, estagioPipeline: { in: ['REUNIAO_AGENDADA','REUNIAO_REALIZADA','PROPOSTA_EM_ELABORACAO','PROPOSTA_ENVIADA','NEGOCIACAO','FECHADO_GANHO'] } } }),
      fastify.prisma.lead.count({ where: { unidadeId, estagioPipeline: { in: ['PROPOSTA_ENVIADA','NEGOCIACAO','FECHADO_GANHO'] } } }),
      fastify.prisma.lead.count({ where: { unidadeId, estagioPipeline: 'FECHADO_GANHO' } }),
    ])

    const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0

    const funil = [
      { stage: 'LEADS',      label: 'Leads',       count: total,      taxa: 100 },
      { stage: 'QUALI',      label: 'Qualificados', count: quali,      taxa: pct(quali) },
      { stage: 'REUNIAO',    label: 'Reunião',      count: comReuniao, taxa: pct(comReuniao) },
      { stage: 'PROPOSTA',   label: 'Proposta',     count: comProposta,taxa: pct(comProposta) },
      { stage: 'CONTRATO',   label: 'Contrato',     count: comContrato,taxa: pct(comContrato) },
    ]

    // ── Leads por origem ──
    const origensRaw = await fastify.prisma.lead.groupBy({
      by: ['origem'], where: { unidadeId },
      _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 7,
    })
    const porOrigem = origensRaw.map(o => ({ origem: o.origem, count: o._count.id }))

    // ── Leads por nicho ──
    const nichosRaw = await fastify.prisma.lead.groupBy({
      by: ['nichoObra'], where: { unidadeId },
      _count: { id: true }, orderBy: { _count: { id: 'desc' } },
    })
    const porNicho = nichosRaw.map(n => ({ nicho: n.nichoObra, count: n._count.id }))

    // ── Pipeline por estágio (ativos) ──
    const estagiosRaw = await fastify.prisma.lead.groupBy({
      by: ['estagioPipeline'], where: { unidadeId, estagioPipeline: ativos },
      _count: { id: true },
    })
    const porEstagio = estagiosRaw
      .map(e => ({ estagio: e.estagioPipeline, count: e._count.id }))
      .sort((a, b) => {
        const order = ['NOVO_LEAD','EM_CONTATO','QUALIFICADO','REUNIAO_AGENDADA','REUNIAO_REALIZADA','PROPOSTA_EM_ELABORACAO','PROPOSTA_ENVIADA','NEGOCIACAO']
        return order.indexOf(a.estagio) - order.indexOf(b.estagio)
      })

    // ── Tendência semanal (últimas 6 semanas) ──
    const tendencia = []
    for (let i = 5; i >= 0; i--) {
      const wEnd = new Date(now); wEnd.setDate(now.getDate() - i * 7); wEnd.setHours(23, 59, 59, 999)
      const wStart = new Date(wEnd); wStart.setDate(wEnd.getDate() - 6); wStart.setHours(0, 0, 0, 0)
      const [leads, tarefasConcluidas, fechadosGanhos] = await Promise.all([
        fastify.prisma.lead.count({ where: { unidadeId, createdAt: { gte: wStart, lte: wEnd } } }),
        fastify.prisma.tarefa.count({ where: { unidadeId, status: { in: ['CONCLUIDA', 'CANCELADA'] }, updatedAt: { gte: wStart, lte: wEnd } } }),
        fastify.prisma.lead.count({ where: { unidadeId, estagioPipeline: 'FECHADO_GANHO', updatedAt: { gte: wStart, lte: wEnd } } }),
      ])
      const label = `${wStart.getDate().toString().padStart(2,'0')}/${(wStart.getMonth()+1).toString().padStart(2,'0')}`
      tendencia.push({ label, leads, tarefasConcluidas, fechadosGanhos })
    }

    // ── Temperatura dos leads ativos ──
    const tempsRaw = await fastify.prisma.lead.groupBy({
      by: ['temperatura'], where: { unidadeId, estagioPipeline: ativos },
      _count: { id: true },
    })
    const porTemperatura = tempsRaw.map(t => ({ temperatura: t.temperatura, count: t._count.id }))

    // ── Atividades recentes ──
    const atividades = await fastify.prisma.notaInteracao.findMany({
      where: { unidadeId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { lead: { select: { nomeEmpresa: true, temperatura: true } } },
    })

    // ── Alertas inteligentes ──
    const slaLimit = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const stagnationOR = Object.entries(STAGNATION_THRESHOLDS).map(([est, dias]) => ({
      estagioPipeline: est,
      diasParado: { gte: dias },
    }))
    const [quentesParados, propostasAntigas, reunioesConfirmar, slaLeads, totalEstagnados, estagnaCriticos] = await Promise.all([
      fastify.prisma.lead.findMany({ where: { unidadeId, temperatura: { in: ['QUENTE','QUALIFICADO'] }, diasParado: { gte: 3 }, estagioPipeline: ativos }, select: { id: true, nomeEmpresa: true, diasParado: true }, take: 3, orderBy: { diasParado: 'desc' } }),
      fastify.prisma.lead.findMany({ where: { unidadeId, estagioPipeline: 'PROPOSTA_ENVIADA', diasParado: { gte: 3 } }, select: { id: true, nomeEmpresa: true, diasParado: true }, take: 3, orderBy: { diasParado: 'desc' } }),
      fastify.prisma.lead.findMany({ where: { unidadeId, estagioPipeline: 'REUNIAO_AGENDADA' }, select: { id: true, nomeEmpresa: true }, take: 3 }),
      fastify.prisma.lead.findMany({ where: { unidadeId, estagioPipeline: 'NOVO_LEAD', createdAt: { lt: slaLimit } }, select: { id: true, nomeEmpresa: true, createdAt: true }, take: 3, orderBy: { createdAt: 'asc' } }),
      fastify.prisma.lead.count({ where: { unidadeId, OR: stagnationOR } }),
      fastify.prisma.lead.findMany({ where: { unidadeId, estagioPipeline: { in: ['NEGOCIACAO','PROPOSTA_ENVIADA'] }, OR: stagnationOR }, select: { id: true, nomeEmpresa: true, diasParado: true, estagioPipeline: true }, take: 3, orderBy: { diasParado: 'desc' } }),
    ])

    const estagioLabel: Record<string, string> = {
      NEGOCIACAO: 'Negociação', PROPOSTA_ENVIADA: 'Proposta enviada',
    }
    const alertas = [
      ...slaLeads.map(l => ({ tipo: 'SLA_PRIMEIRO_CONTATO', mensagem: `SLA vencido: ${l.nomeEmpresa} — sem primeiro contato há +24h`, leadId: l.id })),
      ...quentesParados.map(l => ({ tipo: 'LEAD_PARADO', mensagem: `${l.nomeEmpresa} — ${l.diasParado}d sem contato`, leadId: l.id })),
      ...propostasAntigas.map(l => ({ tipo: 'PROPOSTA_PARADA', mensagem: `Proposta ${l.nomeEmpresa} — ${l.diasParado}d sem retorno`, leadId: l.id })),
      ...reunioesConfirmar.map(l => ({ tipo: 'REUNIAO_CONFIRMAR', mensagem: `Confirmar reunião: ${l.nomeEmpresa}`, leadId: l.id })),
      ...estagnaCriticos.map(l => ({ tipo: 'PIPELINE_ESTAGNADO', mensagem: `${l.nomeEmpresa} parado há ${l.diasParado}d em ${estagioLabel[l.estagioPipeline] ?? l.estagioPipeline}`, leadId: l.id })),
    ]

    return {
      metas: {
        leadsQualificados: { atual: leadsQualificadosMes, meta: 12 },
        contratos: { atual: contratosMes, meta: 2 },
      },
      kpis: { leadsMes, qualificados: leadsQualificadosMes, reunioes: reunioesMes, propostas: propostasMes, contratos: contratosMes, taxaConversao, receitaRealizada, receitaPrevista, tempoMedioCiclo, totalEstagnados },
      funil, porOrigem, porNicho, porEstagio, porTemperatura, tendencia, alertas, atividades,
    }
  })
}

export default dashboardRoute

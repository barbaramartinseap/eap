import { FastifyPluginAsync } from 'fastify'
import { getScript, getNextTask, getTipoInteracao } from '../services/cadence'
import { STAGNATION_THRESHOLDS } from '../services/score'

// Mapeia as novas opções do briefing para tipos internos de tarefa
const PROXIMA_ACAO_MAP: Record<string, string> = {
  LIGAR_NOVAMENTE:   'LIGAR',
  ENVIAR_WHATSAPP:   'ENVIAR_EMAIL',
  AGENDAR_REUNIAO:   'AGENDAR_REUNIAO',
  ENVIAR_MATERIAL:   'ENVIAR_EMAIL',
  PREPARAR_PROPOSTA: 'ENVIAR_PROPOSTA',
  FAZER_FOLLOWUP:    'FOLLOW_UP',
  ENCERRAR:          'ENCERRAR',
  AGUARDAR_RETORNO:  'FOLLOW_UP',
  // legado
  PROXIMO_DA_CADENCIA: 'PROXIMO_DA_CADENCIA',
  AGENDAR_CUSTOM:    'AGENDAR_CUSTOM',
}

// Mapeamento desfecho → atualização de estágio do lead
const DESFECHO_ESTAGIO: Record<string, string> = {
  // ligação
  REUNIAO_AGENDADA:        'REUNIAO_AGENDADA',
  REUNIAO_MARCADA:         'REUNIAO_AGENDADA',
  AGENDADO:                'REUNIAO_AGENDADA',
  // reunião
  REUNIAO_CONFIRMADA:      'REUNIAO_AGENDADA',
  REUNIAO_REALIZADA:       'REUNIAO_REALIZADA',
  AVANCOU_PROPOSTA:        'PROPOSTA_EM_ELABORACAO',
  QUER_PROPOSTA:           'PROPOSTA_EM_ELABORACAO',
  // proposta
  PROPOSTA_ENVIADA:        'PROPOSTA_ENVIADA',
  APROVADA:                'NEGOCIACAO',
  // perdidos
  SEM_FIT:                 'FECHADO_PERDIDO',
  PERDIDO:                 'FECHADO_PERDIDO',
  SEM_INTERESSE:           'FECHADO_PERDIDO',
  NUMERO_INVALIDO:         'FECHADO_PERDIDO',
}

const painelRoute: FastifyPluginAsync = async (fastify) => {

  // GET /painel/resumo — dados para os cards de resumo do dia
  fastify.get('/resumo', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { unidadeId } = request.user
    const agora = new Date()
    const fimDia = new Date(agora); fimDia.setHours(23, 59, 59, 999)
    const inicioDia = new Date(agora); inicioDia.setHours(0, 0, 0, 0)

    const stagnationOR = Object.entries(STAGNATION_THRESHOLDS).map(([est, dias]) => ({
      estagioPipeline: est,
      diasParado: { gte: dias },
    }))

    const [pendentes, atrasadas, leadsSemContato, propostasSemResposta, reunioesAgendadas,
           leadsFriosParados, leadsQuentesParados, leadsMornosParados, estagnados] = await Promise.all([
      fastify.prisma.tarefa.count({
        where: { unidadeId, status: 'PENDENTE', dataVencimento: { lte: fimDia } },
      }),
      fastify.prisma.tarefa.count({
        where: { unidadeId, status: 'PENDENTE', dataVencimento: { lt: inicioDia } },
      }),
      fastify.prisma.lead.count({
        where: { unidadeId, estagioPipeline: 'NOVO_LEAD' },
      }),
      fastify.prisma.lead.count({
        where: { unidadeId, estagioPipeline: { in: ['PROPOSTA_ENVIADA', 'NEGOCIACAO'] } },
      }),
      fastify.prisma.lead.count({
        where: { unidadeId, estagioPipeline: 'REUNIAO_AGENDADA' },
      }),
      // cadência em risco: frios > 21d, mornos > 15d, quentes > 10d
      fastify.prisma.lead.count({ where: { unidadeId, temperatura: 'FRIO',        diasParado: { gte: 21 }, estagioPipeline: { notIn: ['FECHADO_GANHO','FECHADO_PERDIDO'] } } }),
      fastify.prisma.lead.count({ where: { unidadeId, temperatura: 'QUENTE',      diasParado: { gte: 10 }, estagioPipeline: { notIn: ['FECHADO_GANHO','FECHADO_PERDIDO'] } } }),
      fastify.prisma.lead.count({ where: { unidadeId, temperatura: 'MORNO',       diasParado: { gte: 15 }, estagioPipeline: { notIn: ['FECHADO_GANHO','FECHADO_PERDIDO'] } } }),
      fastify.prisma.lead.count({ where: { unidadeId, OR: stagnationOR } }),
    ])

    const cadenciaEsgotada = leadsFriosParados + leadsQuentesParados + leadsMornosParados

    return { pendentes, atrasadas, leadsSemContato, propostasSemResposta, reunioesAgendadas, cadenciaEsgotada, estagnados }
  })

  // GET /painel/tarefas-hoje
  fastify.get('/tarefas-hoje', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { unidadeId } = request.user
    const fimDia = new Date(); fimDia.setHours(23, 59, 59, 999)

    const tarefas = await fastify.prisma.tarefa.findMany({
      where: { unidadeId, status: 'PENDENTE', dataVencimento: { lte: fimDia } },
      include: {
        lead: {
          select: {
            id: true,
            nomeEmpresa: true,
            nomeContato: true,
            telefone: true,
            nichoObra: true,
            qtdObrasSimultaneas: true,
            scoreIcp: true,
            scoreUrgencia: true,
            temperatura: true,
            estagioPipeline: true,
            origem: true,
            diasParado: true,
          },
        },
      },
      orderBy: [
        { lead: { scoreUrgencia: 'desc' } },
        { lead: { scoreIcp: 'desc' } },
        { dataVencimento: 'asc' },
      ],
    })

    return { total: tarefas.length, tarefas }
  })

  // GET /painel/script?tarefaId=:id
  fastify.get<{ Querystring: { tarefaId: string } }>('/script', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        required: ['tarefaId'],
        properties: { tarefaId: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { unidadeId } = request.user
    const { tarefaId } = request.query

    const tarefa = await fastify.prisma.tarefa.findFirst({
      where: { id: tarefaId, unidadeId },
      include: { lead: { include: { unidade: true } } },
    })

    if (!tarefa) return reply.code(404).send({ error: 'Tarefa não encontrada' })

    const script = getScript(tarefa.tipo, tarefa.tentativaNum, {
      nomeEmpresa: tarefa.lead.nomeEmpresa,
      nomeContato: tarefa.lead.nomeContato,
      telefone: tarefa.lead.telefone,
      scoreIcp: tarefa.lead.scoreIcp,
      temperatura: tarefa.lead.temperatura,
      nichoObra: tarefa.lead.nichoObra,
      qtdObrasSimultaneas: tarefa.lead.qtdObrasSimultaneas,
      estagioPipeline: tarefa.lead.estagioPipeline,
      consultorNome: tarefa.lead.unidade.nome,
    })

    return script
  })

  // POST /painel/registrar — registra execução e gera próxima ação
  fastify.post<{
    Body: {
      tarefaId: string
      resultado: string
      observacoes?: string
      desfecho: string
      proximaAcao: string
      proximaData?: string       // ISO date: agendamento manual
      proximaDescricao?: string  // descrição livre da próxima ação
    }
  }>('/registrar', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['tarefaId', 'resultado', 'desfecho', 'proximaAcao'],
        properties: {
          tarefaId:          { type: 'string' },
          resultado:         { type: 'string' },
          observacoes:       { type: 'string' },
          desfecho:          { type: 'string' },
          proximaAcao:       { type: 'string' },
          proximaData:       { type: 'string' },
          proximaDescricao:  { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { unidadeId } = request.user
    const { tarefaId, resultado, observacoes, desfecho, proximaAcao, proximaData, proximaDescricao } = request.body

    const tarefa = await fastify.prisma.tarefa.findFirst({
      where: { id: tarefaId, unidadeId },
      include: { lead: true },
    })

    if (!tarefa) return reply.code(404).send({ error: 'Tarefa não encontrada' })

    const tipoInteracao = getTipoInteracao(tarefa.tipo)
    const statusTarefa = resultado === 'CANCELADA' ? 'CANCELADA' : 'CONCLUIDA'

    // 1. Marca a tarefa
    await fastify.prisma.tarefa.update({
      where: { id: tarefaId },
      data: { status: statusTarefa, observacoes },
    })

    // 2. Cria nota de interação
    await fastify.prisma.notaInteracao.create({
      data: {
        tipo: tipoInteracao,
        conteudo: observacoes ?? `${tarefa.tipo} — tentativa ${tarefa.tentativaNum}`,
        resultado: desfecho,
        leadId: tarefa.leadId,
        oportunidadeId: tarefa.oportunidadeId,
        tarefaId: tarefa.id,
        unidadeId,
      },
    })

    // 3. Atualiza estágio do lead baseado no desfecho
    const novoEstagio = DESFECHO_ESTAGIO[desfecho]
    if (novoEstagio) {
      await fastify.prisma.lead.update({
        where: { id: tarefa.leadId },
        data: { estagioPipeline: novoEstagio },
      })
    }

    // 4. Gera próxima tarefa
    let proximaTarefa = null
    const acaoMapeada = PROXIMA_ACAO_MAP[proximaAcao] ?? proximaAcao

    if (acaoMapeada !== 'ENCERRAR') {
      const leadCtx = {
        nomeEmpresa:         tarefa.lead.nomeEmpresa,
        nomeContato:         tarefa.lead.nomeContato,
        telefone:            tarefa.lead.telefone,
        scoreIcp:            tarefa.lead.scoreIcp,
        temperatura:         tarefa.lead.temperatura,
        nichoObra:           tarefa.lead.nichoObra,
        qtdObrasSimultaneas: tarefa.lead.qtdObrasSimultaneas,
        estagioPipeline:     tarefa.lead.estagioPipeline,
      }

      let tipoProxima: string
      let tentativaNum: number
      let dataVencimento: Date
      let descricao: string

      if (acaoMapeada === 'PROXIMO_DA_CADENCIA') {
        // usa a lógica de cadência automática
        const next = getNextTask(leadCtx, tarefa.tipo, tarefa.tentativaNum, desfecho)
        if (next) {
          tipoProxima = next.tipo
          tentativaNum = next.tentativaNum
          dataVencimento = new Date()
          dataVencimento.setDate(dataVencimento.getDate() + next.daysFromNow)
          dataVencimento.setHours(9, 0, 0, 0)
          descricao = next.descricao
        } else {
          return { success: true, proximaTarefa: null }
        }
      } else {
        // ação explícita escolhida pelo franqueado
        tipoProxima = acaoMapeada
        tentativaNum = 1
        dataVencimento = proximaData ? new Date(proximaData) : (() => {
          const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d
        })()
        const labelMap: Record<string, string> = {
          LIGAR:          `Ligar para ${leadCtx.nomeEmpresa}`,
          ENVIAR_EMAIL:   `WhatsApp para ${leadCtx.nomeEmpresa}`,
          AGENDAR_REUNIAO:`Agendar reunião com ${leadCtx.nomeEmpresa}`,
          ENVIAR_PROPOSTA:`Enviar proposta para ${leadCtx.nomeEmpresa}`,
          FOLLOW_UP:      `Follow-up com ${leadCtx.nomeEmpresa}`,
        }
        descricao = proximaDescricao ?? labelMap[tipoProxima] ?? `Ação com ${leadCtx.nomeEmpresa}`
      }

      const novaTarefa = await fastify.prisma.tarefa.create({
        data: {
          tipo: tipoProxima,
          descricao,
          dataVencimento,
          tentativaNum,
          leadId: tarefa.leadId,
          oportunidadeId: tarefa.oportunidadeId,
          unidadeId,
        },
      })

      const diffDays = Math.round((dataVencimento.getTime() - Date.now()) / 86400000)

      proximaTarefa = {
        id: novaTarefa.id,
        tipo: novaTarefa.tipo,
        tentativaNum: novaTarefa.tentativaNum,
        dataVencimento: novaTarefa.dataVencimento,
        daysFromNow: Math.max(diffDays, 0),
      }
    }

    return { success: true, proximaTarefa }
  })

  // POST /painel/pular — pula tarefa (sem alterar status, apenas registra)
  fastify.post<{ Body: { tarefaId: string } }>('/pular', {
    preHandler: [fastify.authenticate],
    schema: { body: { type: 'object', required: ['tarefaId'], properties: { tarefaId: { type: 'string' } } } },
  }, async (request, reply) => {
    const { unidadeId } = request.user
    const { tarefaId } = request.body
    const tarefa = await fastify.prisma.tarefa.findFirst({ where: { id: tarefaId, unidadeId } })
    if (!tarefa) return reply.code(404).send({ error: 'Tarefa não encontrada' })
    return { success: true }
  })
}

export default painelRoute

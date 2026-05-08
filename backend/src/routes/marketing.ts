import { FastifyPluginAsync } from 'fastify'
import {
  AgentInput,
  gerarConteudo,
  gerarPromptAgente,
  gerarSugestoesSemana,
  TEMAS_BANCO,
  BIBLIOTECA_MATRIZ,
  agentGeradorImagem,
} from '../services/marketing'

const marketingRoute: FastifyPluginAsync = async (fastify) => {
  const auth = { preHandler: [fastify.authenticate] }

  // -------------------------------------------------------------------------
  // GET /marketing/resumo — plano da semana + performance simples
  // -------------------------------------------------------------------------
  fastify.get('/resumo', auth, async (request) => {
    const { unidadeId } = request.user as { unidadeId: string }

    const unidade = await fastify.prisma.unidadeFranqueada.findUnique({
      where: { id: unidadeId },
      select: { nome: true, cidade: true },
    })

    const agora = new Date()
    const diaSemana = agora.getDay()
    const diffLua = diaSemana === 0 ? 0 : diaSemana
    const inicioSemana = new Date(agora)
    inicioSemana.setDate(agora.getDate() - diffLua)
    inicioSemana.setHours(0, 0, 0, 0)
    const fimSemana = new Date(inicioSemana)
    fimSemana.setDate(inicioSemana.getDate() + 6)
    fimSemana.setHours(23, 59, 59, 999)

    const [produzidos, publicados] = await Promise.all([
      fastify.prisma.conteudoMarketing.count({
        where: { unidadeId, status: { not: 'ARQUIVADO' } },
      }),
      fastify.prisma.conteudoMarketing.count({
        where: { unidadeId, status: 'PUBLICADO' },
      }),
    ])

    const pendentes = produzidos - publicados

    const fmt = (d: Date) =>
      d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

    return {
      unidade: { nome: unidade?.nome ?? '', cidade: unidade?.cidade ?? '' },
      semana: `${fmt(inicioSemana)} – ${fmt(fimSemana)}/${fimSemana.getFullYear()}`,
      sugestoes: gerarSugestoesSemana(),
      performance: {
        produzidos,
        publicados,
        pendentes,
        canalMaisUsado: produzidos > 0 ? 'LINKEDIN' : null,
        temaMaisUsado: produzidos > 0 ? 'Gestão de obras' : null,
      },
    }
  })

  // -------------------------------------------------------------------------
  // GET /marketing/temas — banco de temas por ICP
  // -------------------------------------------------------------------------
  fastify.get('/temas', auth, async () => {
    return { temas: TEMAS_BANCO }
  })

  // -------------------------------------------------------------------------
  // GET /marketing/biblioteca — biblioteca da matriz
  // -------------------------------------------------------------------------
  fastify.get('/biblioteca', auth, async () => {
    return { biblioteca: BIBLIOTECA_MATRIZ }
  })

  // -------------------------------------------------------------------------
  // GET /marketing/conteudos — lista conteúdos gerados
  // -------------------------------------------------------------------------
  fastify.get('/conteudos', auth, async (request) => {
    const { unidadeId } = request.user as { unidadeId: string }
    const query = request.query as { canal?: string; status?: string; formato?: string }

    const where: Record<string, unknown> = { unidadeId }
    if (query.canal) where.canal = query.canal
    if (query.status) where.status = query.status
    if (query.formato) where.formato = query.formato

    const conteudos = await fastify.prisma.conteudoMarketing.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      take: 50,
    })

    return conteudos.map((c) => ({
      ...c,
      conteudo: JSON.parse(c.conteudo as string),
    }))
  })

  // -------------------------------------------------------------------------
  // POST /marketing/gerar — gera conteúdo e salva
  // -------------------------------------------------------------------------
  fastify.post('/gerar', auth, async (request, reply) => {
    const { unidadeId } = request.user as { unidadeId: string }
    const body = request.body as {
      canal: string
      formato: string
      icp: string
      objetivo: string
      tema?: string   // opcional — se vazio, o agente ChatGPT define o tema
    }

    if (!body.canal || !body.formato || !body.icp || !body.objetivo) {
      return reply.status(400).send({ error: 'Campos obrigatórios: canal, formato, icp, objetivo' })
    }

    const unidade = await fastify.prisma.unidadeFranqueada.findUnique({
      where: { id: unidadeId },
      select: { nome: true, cidade: true },
    })

    const temaRecebido = (body.tema ?? '').trim()

    const input: AgentInput = {
      canal: body.canal,
      formato: body.formato,
      icp: body.icp,
      objetivo: body.objetivo,
      tema: temaRecebido,
      nomeFranqueado: unidade?.nome ?? '',
      cidade: unidade?.cidade ?? '',
    }

    const promptData  = gerarPromptAgente(input)
    const rascunho    = gerarConteudo(input)
    const imagemData  = agentGeradorImagem(input)

    const conteudoObj = {
      agente:       promptData.agente,
      prompt:       promptData.prompt,
      promptImagem: imagemData.promptImagem,  // prompt de imagem isolado (Passo 2)
      rascunho:     { ...rascunho, promptImagem: imagemData },
    }

    const salvo = await fastify.prisma.conteudoMarketing.create({
      data: {
        unidadeId,
        canal: body.canal,
        formato: body.formato,
        icp: body.icp,
        objetivo: body.objetivo,
        tema: temaRecebido || '(tema definido pelo agente)',
        conteudo: JSON.stringify(conteudoObj),
        status: 'PRONTO',
      },
    })

    return { ...salvo, conteudo: conteudoObj }
  })

  // -------------------------------------------------------------------------
  // PATCH /marketing/conteudos/:id — atualiza status ou conteúdo
  // -------------------------------------------------------------------------
  fastify.patch('/conteudos/:id', auth, async (request, reply) => {
    const { unidadeId } = request.user as { unidadeId: string }
    const { id } = request.params as { id: string }
    const body = request.body as { status?: string; tema?: string; conteudo?: object; dataPublicacao?: string }

    const existing = await fastify.prisma.conteudoMarketing.findFirst({
      where: { id, unidadeId },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Conteúdo não encontrado' })
    }

    const data: Record<string, unknown> = {}
    if (body.status) data.status = body.status
    if (body.tema) data.tema = body.tema
    if (body.conteudo) data.conteudo = JSON.stringify(body.conteudo)
    if (body.dataPublicacao) data.dataPublicacao = new Date(body.dataPublicacao)
    if (body.status === 'PUBLICADO' && !existing.dataPublicacao) {
      data.dataPublicacao = new Date()
    }

    const updated = await fastify.prisma.conteudoMarketing.update({
      where: { id },
      data,
    })

    return { ...updated, conteudo: JSON.parse(updated.conteudo as string) }
  })

  // -------------------------------------------------------------------------
  // DELETE /marketing/conteudos/:id — arquiva (soft delete)
  // -------------------------------------------------------------------------
  fastify.delete('/conteudos/:id', auth, async (request, reply) => {
    const { unidadeId } = request.user as { unidadeId: string }
    const { id } = request.params as { id: string }

    const existing = await fastify.prisma.conteudoMarketing.findFirst({
      where: { id, unidadeId },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Conteúdo não encontrado' })
    }

    await fastify.prisma.conteudoMarketing.update({
      where: { id },
      data: { status: 'ARQUIVADO' },
    })

    return { ok: true }
  })

  // -------------------------------------------------------------------------
  // GET /marketing/calendario — entradas do calendário
  // -------------------------------------------------------------------------
  fastify.get('/calendario', auth, async (request) => {
    const { unidadeId } = request.user as { unidadeId: string }
    const query = request.query as { semanas?: string }
    const semanas = Number(query.semanas ?? 2)

    const inicio = new Date()
    inicio.setDate(inicio.getDate() - inicio.getDay())
    inicio.setHours(0, 0, 0, 0)

    const fim = new Date(inicio)
    fim.setDate(inicio.getDate() + semanas * 7)

    const entradas = await fastify.prisma.calendarioEditorial.findMany({
      where: {
        unidadeId,
        data: { gte: inicio, lte: fim },
      },
      orderBy: { data: 'asc' },
    })

    return entradas
  })

  // -------------------------------------------------------------------------
  // POST /marketing/calendario — cria entrada
  // -------------------------------------------------------------------------
  fastify.post('/calendario', auth, async (request, reply) => {
    const { unidadeId } = request.user as { unidadeId: string }
    const body = request.body as {
      data: string
      canal: string
      tema: string
      formato?: string
      status?: string
      conteudoId?: string
      observacoes?: string
    }

    if (!body.data || !body.canal || !body.tema) {
      return reply.status(400).send({ error: 'Campos obrigatórios: data, canal, tema' })
    }

    const entrada = await fastify.prisma.calendarioEditorial.create({
      data: {
        unidadeId,
        data: new Date(body.data),
        canal: body.canal,
        tema: body.tema,
        formato: body.formato,
        status: body.status ?? 'IDEIA',
        conteudoId: body.conteudoId,
        observacoes: body.observacoes,
      },
    })

    return entrada
  })

  // -------------------------------------------------------------------------
  // PATCH /marketing/calendario/:id — atualiza entrada
  // -------------------------------------------------------------------------
  fastify.patch('/calendario/:id', auth, async (request, reply) => {
    const { unidadeId } = request.user as { unidadeId: string }
    const { id } = request.params as { id: string }
    const body = request.body as {
      data?: string
      canal?: string
      tema?: string
      formato?: string
      status?: string
      conteudoId?: string
      observacoes?: string
    }

    const existing = await fastify.prisma.calendarioEditorial.findFirst({
      where: { id, unidadeId },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Entrada não encontrada' })
    }

    const data: Record<string, unknown> = {}
    if (body.data) data.data = new Date(body.data)
    if (body.canal) data.canal = body.canal
    if (body.tema) data.tema = body.tema
    if (body.formato !== undefined) data.formato = body.formato
    if (body.status) data.status = body.status
    if (body.conteudoId !== undefined) data.conteudoId = body.conteudoId
    if (body.observacoes !== undefined) data.observacoes = body.observacoes

    const updated = await fastify.prisma.calendarioEditorial.update({
      where: { id },
      data,
    })

    return updated
  })

  // -------------------------------------------------------------------------
  // DELETE /marketing/calendario/:id — remove entrada
  // -------------------------------------------------------------------------
  fastify.delete('/calendario/:id', auth, async (request, reply) => {
    const { unidadeId } = request.user as { unidadeId: string }
    const { id } = request.params as { id: string }

    const existing = await fastify.prisma.calendarioEditorial.findFirst({
      where: { id, unidadeId },
    })

    if (!existing) {
      return reply.status(404).send({ error: 'Entrada não encontrada' })
    }

    await fastify.prisma.calendarioEditorial.delete({ where: { id } })

    return { ok: true }
  })
}

export default marketingRoute

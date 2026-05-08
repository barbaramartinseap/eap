/**
 * autoSeed.ts — Seed inicial chamado pelo server.ts quando o banco está vazio.
 * Cria as 3 unidades de homologação + leads de teste.
 * Não usa deleteMany — é seguro rodar em produção.
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import {
  calcularScore,
  scoreToTemperatura,
  estagioToChance,
  getFirstTaskForTemp,
} from '../services/score'

interface LeadInput {
  nomeEmpresa: string; nomeContato: string; telefone: string; cidade: string
  email?: string; whatsapp?: string
  nichoObra: string; qtdObrasSimultaneas: number; faturamentoEstimado: string
  temSocio: boolean; equipePropia: boolean; qtdEngenheiros: number
  dorPrincipal: string; origem: string; responsavel: string
  estagioPipeline: string; diasParado: number
}

async function criarLeads(
  prisma: PrismaClient,
  unidadeId: string,
  leadsData: LeadInput[],
  tarefaIdxs: { idx: number; tipo: string; tent: number }[],
  historicoData: { leadIdx: number; tipo: string; conteudo: string; resultado: string }[],
) {
  const hojeEnd = new Date(); hojeEnd.setHours(23, 59, 0, 0)
  const createdLeads = []

  for (const l of leadsData) {
    const score = calcularScore({
      qtdObrasSimultaneas: l.qtdObrasSimultaneas, nichoObra: l.nichoObra,
      origem: l.origem, dorPrincipal: l.dorPrincipal,
      temSocio: l.temSocio, equipePropia: l.equipePropia, qtdEngenheiros: l.qtdEngenheiros,
    })
    const temperatura = scoreToTemperatura(score)
    const chance = estagioToChance(l.estagioPipeline)

    const lead = await prisma.lead.create({
      data: {
        nomeEmpresa: l.nomeEmpresa, nomeContato: l.nomeContato, telefone: l.telefone,
        cidade: l.cidade, email: l.email, whatsapp: l.whatsapp,
        nichoObra: l.nichoObra, qtdObrasSimultaneas: l.qtdObrasSimultaneas,
        faturamentoEstimado: l.faturamentoEstimado, temSocio: l.temSocio,
        equipePropia: l.equipePropia, qtdEngenheiros: l.qtdEngenheiros,
        dorPrincipal: l.dorPrincipal, origem: l.origem,
        scoreIcp: score, temperatura, chanceFechamento: chance,
        estagioPipeline: l.estagioPipeline, diasParado: l.diasParado,
        responsavel: l.responsavel, unidadeId,
      },
    })
    createdLeads.push(lead)

    await prisma.notaInteracao.create({
      data: {
        tipo: 'NOTA_INTERNA',
        conteudo: `Lead criado. Score ICP: ${score} — ${temperatura}.`,
        leadId: lead.id, unidadeId,
      },
    })
  }

  for (const cfg of tarefaIdxs) {
    const lead = createdLeads[cfg.idx]
    const ft = getFirstTaskForTemp(lead.temperatura, lead.nomeEmpresa)
    await prisma.tarefa.create({
      data: {
        tipo: cfg.tipo, tentativaNum: cfg.tent,
        descricao: `${ft.descricao} — tentativa ${cfg.tent}`,
        dataVencimento: hojeEnd, status: 'PENDENTE',
        leadId: lead.id, unidadeId,
      },
    })
  }

  for (const h of historicoData) {
    await prisma.notaInteracao.create({
      data: {
        tipo: h.tipo, conteudo: h.conteudo, resultado: h.resultado,
        leadId: createdLeads[h.leadIdx].id, unidadeId,
      },
    })
  }

  return createdLeads
}

export async function runAutoSeed(prisma: PrismaClient) {
  const senhaHash = await bcrypt.hash('E@P2026#', 10)

  // ── Unidade 1: Bernardo — Salvador ──────────────────────────────────────────
  const bernardo = await prisma.unidadeFranqueada.create({
    data: { nome: 'Bernardo', email: 'bernardo@eapia.com.br', senha: senhaHash, cidade: 'Salvador', status: 'ATIVA' },
  })
  await criarLeads(prisma, bernardo.id, [
    { nomeEmpresa: 'Construtora Alpha', nomeContato: 'Ricardo Ferreira', telefone: '(71) 99123-4567', cidade: 'Salvador', email: 'ricardo@alpha.com.br', whatsapp: '(71) 99123-4567', nichoObra: 'OBRAS_PUBLICAS', qtdObrasSimultaneas: 5, faturamentoEstimado: '72000', temSocio: true, equipePropia: true, qtdEngenheiros: 4, dorPrincipal: 'FLUXO_CAIXA', origem: 'OUTBOUND_ATIVO', responsavel: 'Bernardo', estagioPipeline: 'EM_CONTATO', diasParado: 2 },
    { nomeEmpresa: 'Engenharia Beta', nomeContato: 'Patrícia Moura', telefone: '(71) 98765-4321', cidade: 'Salvador', nichoObra: 'RESIDENCIAL_ALTO', qtdObrasSimultaneas: 2, faturamentoEstimado: '48000', temSocio: false, equipePropia: true, qtdEngenheiros: 2, dorPrincipal: 'BAIXA_MARGEM', origem: 'LINKEDIN', responsavel: 'Bernardo', estagioPipeline: 'QUALIFICADO', diasParado: 4 },
    { nomeEmpresa: 'Gamma Obras', nomeContato: 'Carlos Henrique', telefone: '(71) 97654-3210', cidade: 'Salvador', email: 'carlos@gamma.com.br', nichoObra: 'INDUSTRIAL', qtdObrasSimultaneas: 8, faturamentoEstimado: '96000', temSocio: true, equipePropia: true, qtdEngenheiros: 6, dorPrincipal: 'MUITAS_OBRAS', origem: 'INDICACAO', responsavel: 'Bernardo', estagioPipeline: 'REUNIAO_AGENDADA', diasParado: 1 },
    { nomeEmpresa: 'Delta Construções', nomeContato: 'Marcos Silveira', telefone: '(71) 96543-2109', cidade: 'Salvador', nichoObra: 'COMERCIAL', qtdObrasSimultaneas: 1, faturamentoEstimado: '36000', temSocio: false, equipePropia: false, qtdEngenheiros: 0, dorPrincipal: 'OUTRO', origem: 'META_ADS', responsavel: 'Bernardo', estagioPipeline: 'NOVO_LEAD', diasParado: 10 },
    { nomeEmpresa: 'Epsilon Engenharia', nomeContato: 'Fernanda Costa', telefone: '(71) 95432-1098', cidade: 'Salvador', email: 'fernanda@epsilon.com.br', whatsapp: '(71) 95432-1098', nichoObra: 'RESIDENCIAL_MEDIO', qtdObrasSimultaneas: 3, faturamentoEstimado: '48000', temSocio: true, equipePropia: true, qtdEngenheiros: 2, dorPrincipal: 'ATRASO_OBRA', origem: 'INSTAGRAM', responsavel: 'Bernardo', estagioPipeline: 'EM_CONTATO', diasParado: 3 },
    { nomeEmpresa: 'Zeta Incorporações', nomeContato: 'Paulo Rodrigues', telefone: '(71) 94321-0987', cidade: 'Salvador', email: 'paulo@zeta.com.br', nichoObra: 'RESIDENCIAL_ALTO', qtdObrasSimultaneas: 4, faturamentoEstimado: '60000', temSocio: true, equipePropia: true, qtdEngenheiros: 3, dorPrincipal: 'SEM_CONTROLE_FINANCEIRO', origem: 'INDICACAO', responsavel: 'Bernardo', estagioPipeline: 'PROPOSTA_ENVIADA', diasParado: 5 },
    { nomeEmpresa: 'Omega Construtora', nomeContato: 'Ana Lima', telefone: '(71) 93210-9876', cidade: 'Salvador', nichoObra: 'OBRAS_PUBLICAS', qtdObrasSimultaneas: 3, faturamentoEstimado: '54000', temSocio: false, equipePropia: true, qtdEngenheiros: 3, dorPrincipal: 'FLUXO_CAIXA', origem: 'OUTBOUND_ATIVO', responsavel: 'Bernardo', estagioPipeline: 'REUNIAO_REALIZADA', diasParado: 2 },
    { nomeEmpresa: 'Sigma Obras', nomeContato: 'Roberto Nunes', telefone: '(71) 92109-8765', cidade: 'Salvador', nichoObra: 'INDUSTRIAL', qtdObrasSimultaneas: 6, faturamentoEstimado: '84000', temSocio: true, equipePropia: true, qtdEngenheiros: 5, dorPrincipal: 'MUITAS_OBRAS', origem: 'INDICACAO', responsavel: 'Bernardo', estagioPipeline: 'NEGOCIACAO', diasParado: 1 },
  ], [
    { idx: 0, tipo: 'LIGAR', tent: 1 }, { idx: 1, tipo: 'LIGAR', tent: 3 },
    { idx: 2, tipo: 'AGENDAR_REUNIAO', tent: 1 }, { idx: 3, tipo: 'LIGAR', tent: 1 },
    { idx: 4, tipo: 'ENVIAR_EMAIL', tent: 2 },
  ], [
    { leadIdx: 0, tipo: 'LIGACAO', conteudo: 'Tentativa de ligação — não atendeu', resultado: 'NAO_ATENDEU' },
    { leadIdx: 1, tipo: 'WHATSAPP', conteudo: 'WhatsApp enviado — apresentação EAP', resultado: 'MENSAGEM_ENVIADA' },
    { leadIdx: 2, tipo: 'LIGACAO', conteudo: 'Contato realizado. Carlos demonstrou interesse. Reunião agendada.', resultado: 'REUNIAO_AGENDADA' },
    { leadIdx: 5, tipo: 'NOTA_INTERNA', conteudo: 'Proposta enviada por email. Valor: R$3.500/mês.', resultado: 'PROPOSTA_ENVIADA' },
    { leadIdx: 6, tipo: 'NOTA_INTERNA', conteudo: 'Reunião realizada. Ana mostrou interesse na proposta.', resultado: 'REUNIAO_REALIZADA' },
    { leadIdx: 7, tipo: 'NOTA_INTERNA', conteudo: 'Em negociação ativa. Sócio envolvido.', resultado: 'EM_NEGOCIACAO' },
  ])

  // ── Unidade 2: Gabriel — Belo Horizonte ─────────────────────────────────────
  const gabriel = await prisma.unidadeFranqueada.create({
    data: { nome: 'Gabriel', email: 'gabriel@eapia.com.br', senha: senhaHash, cidade: 'Belo Horizonte', status: 'ATIVA' },
  })
  await criarLeads(prisma, gabriel.id, [
    { nomeEmpresa: 'MG Construtora', nomeContato: 'Alexandre Prado', telefone: '(31) 99234-5678', cidade: 'Belo Horizonte', email: 'alexandre@mgconstrutora.com.br', whatsapp: '(31) 99234-5678', nichoObra: 'RESIDENCIAL_ALTO', qtdObrasSimultaneas: 4, faturamentoEstimado: '66000', temSocio: true, equipePropia: true, qtdEngenheiros: 3, dorPrincipal: 'SEM_CONTROLE_FINANCEIRO', origem: 'INDICACAO', responsavel: 'Gabriel', estagioPipeline: 'QUALIFICADO', diasParado: 2 },
    { nomeEmpresa: 'BH Incorporações', nomeContato: 'Juliana Fonseca', telefone: '(31) 98876-5432', cidade: 'Belo Horizonte', nichoObra: 'RESIDENCIAL_MEDIO', qtdObrasSimultaneas: 6, faturamentoEstimado: '54000', temSocio: true, equipePropia: true, qtdEngenheiros: 4, dorPrincipal: 'ATRASO_OBRA', origem: 'LINKEDIN', responsavel: 'Gabriel', estagioPipeline: 'REUNIAO_AGENDADA', diasParado: 1 },
    { nomeEmpresa: 'Mineira Obras Públicas', nomeContato: 'Renato Alves', telefone: '(31) 97765-4321', cidade: 'Contagem', email: 'renato@mineiraobras.com.br', nichoObra: 'OBRAS_PUBLICAS', qtdObrasSimultaneas: 7, faturamentoEstimado: '90000', temSocio: false, equipePropia: true, qtdEngenheiros: 5, dorPrincipal: 'FLUXO_CAIXA', origem: 'OUTBOUND_ATIVO', responsavel: 'Gabriel', estagioPipeline: 'PROPOSTA_ENVIADA', diasParado: 3 },
    { nomeEmpresa: 'Capital Engenharia Comercial', nomeContato: 'Sônia Machado', telefone: '(31) 96654-3210', cidade: 'Belo Horizonte', nichoObra: 'COMERCIAL', qtdObrasSimultaneas: 2, faturamentoEstimado: '42000', temSocio: false, equipePropia: true, qtdEngenheiros: 2, dorPrincipal: 'BAIXA_MARGEM', origem: 'INSTAGRAM', responsavel: 'Gabriel', estagioPipeline: 'EM_CONTATO', diasParado: 5 },
    { nomeEmpresa: 'Vitória Construções Industriais', nomeContato: 'Eduardo Carmo', telefone: '(31) 95543-2109', cidade: 'Betim', email: 'eduardo@vitoriaind.com.br', nichoObra: 'INDUSTRIAL', qtdObrasSimultaneas: 9, faturamentoEstimado: '108000', temSocio: true, equipePropia: true, qtdEngenheiros: 7, dorPrincipal: 'MUITAS_OBRAS', origem: 'INDICACAO', responsavel: 'Gabriel', estagioPipeline: 'REUNIAO_REALIZADA', diasParado: 1 },
    { nomeEmpresa: 'Gold Tower BH', nomeContato: 'Cristiane Borges', telefone: '(31) 94432-1098', cidade: 'Belo Horizonte', email: 'cristiane@goldtower.com.br', nichoObra: 'RESIDENCIAL_ALTO', qtdObrasSimultaneas: 3, faturamentoEstimado: '78000', temSocio: true, equipePropia: true, qtdEngenheiros: 3, dorPrincipal: 'SEM_CONTROLE_FINANCEIRO', origem: 'LINKEDIN', responsavel: 'Gabriel', estagioPipeline: 'NEGOCIACAO', diasParado: 2 },
    { nomeEmpresa: 'Nova BH Construções', nomeContato: 'Thiago Mendes', telefone: '(31) 93321-0987', cidade: 'Belo Horizonte', nichoObra: 'RESIDENCIAL_MEDIO', qtdObrasSimultaneas: 1, faturamentoEstimado: '30000', temSocio: false, equipePropia: false, qtdEngenheiros: 0, dorPrincipal: 'OUTRO', origem: 'META_ADS', responsavel: 'Gabriel', estagioPipeline: 'NOVO_LEAD', diasParado: 8 },
  ], [
    { idx: 0, tipo: 'LIGAR', tent: 2 }, { idx: 1, tipo: 'AGENDAR_REUNIAO', tent: 1 },
    { idx: 3, tipo: 'LIGAR', tent: 1 }, { idx: 6, tipo: 'LIGAR', tent: 1 },
  ], [
    { leadIdx: 0, tipo: 'WHATSAPP', conteudo: 'WhatsApp enviado — apresentação EAP. Alexandre respondeu positivo.', resultado: 'MENSAGEM_ENVIADA' },
    { leadIdx: 1, tipo: 'LIGACAO', conteudo: 'Ligação realizada. Reunião agendada para semana que vem.', resultado: 'REUNIAO_AGENDADA' },
    { leadIdx: 2, tipo: 'NOTA_INTERNA', conteudo: 'Proposta enviada. Valor: R$4.200/mês para 7 obras.', resultado: 'PROPOSTA_ENVIADA' },
    { leadIdx: 4, tipo: 'NOTA_INTERNA', conteudo: 'Reunião realizada no canteiro de Betim. Muito interesse.', resultado: 'REUNIAO_REALIZADA' },
    { leadIdx: 5, tipo: 'NOTA_INTERNA', conteudo: 'Negociação em andamento. Aguardando aprovação do sócio.', resultado: 'EM_NEGOCIACAO' },
  ])

  // ── Unidade 3: Vagner — São Paulo ────────────────────────────────────────────
  const vagner = await prisma.unidadeFranqueada.create({
    data: { nome: 'Vagner', email: 'vagner@eapia.com.br', senha: senhaHash, cidade: 'São Paulo', status: 'ATIVA' },
  })
  await criarLeads(prisma, vagner.id, [
    { nomeEmpresa: 'Paulista Obras Públicas', nomeContato: 'Marcelo Souza', telefone: '(11) 99345-6789', cidade: 'São Paulo', email: 'marcelo@paulistaop.com.br', whatsapp: '(11) 99345-6789', nichoObra: 'OBRAS_PUBLICAS', qtdObrasSimultaneas: 10, faturamentoEstimado: '120000', temSocio: true, equipePropia: true, qtdEngenheiros: 8, dorPrincipal: 'FLUXO_CAIXA', origem: 'OUTBOUND_ATIVO', responsavel: 'Vagner', estagioPipeline: 'NEGOCIACAO', diasParado: 1 },
    { nomeEmpresa: 'SP Prime Incorporações', nomeContato: 'Daniela Rocha', telefone: '(11) 98987-6543', cidade: 'São Paulo', email: 'daniela@spprime.com.br', nichoObra: 'RESIDENCIAL_ALTO', qtdObrasSimultaneas: 5, faturamentoEstimado: '84000', temSocio: true, equipePropia: true, qtdEngenheiros: 4, dorPrincipal: 'SEM_CONTROLE_FINANCEIRO', origem: 'LINKEDIN', responsavel: 'Vagner', estagioPipeline: 'PROPOSTA_ENVIADA', diasParado: 4 },
    { nomeEmpresa: 'Metropolitan Industrial', nomeContato: 'Fábio Tavares', telefone: '(11) 97876-5432', cidade: 'Guarulhos', email: 'fabio@metropolitan.com.br', nichoObra: 'INDUSTRIAL', qtdObrasSimultaneas: 12, faturamentoEstimado: '144000', temSocio: true, equipePropia: true, qtdEngenheiros: 10, dorPrincipal: 'MUITAS_OBRAS', origem: 'INDICACAO', responsavel: 'Vagner', estagioPipeline: 'REUNIAO_REALIZADA', diasParado: 2 },
    { nomeEmpresa: 'Alphaville Construções', nomeContato: 'Luciana Pinto', telefone: '(11) 96765-4321', cidade: 'Barueri', nichoObra: 'RESIDENCIAL_ALTO', qtdObrasSimultaneas: 4, faturamentoEstimado: '72000', temSocio: false, equipePropia: true, qtdEngenheiros: 3, dorPrincipal: 'BAIXA_MARGEM', origem: 'LINKEDIN', responsavel: 'Vagner', estagioPipeline: 'REUNIAO_AGENDADA', diasParado: 1 },
    { nomeEmpresa: 'Ibirapuera Engenharia', nomeContato: 'Gustavo Lima', telefone: '(11) 95654-3210', cidade: 'São Paulo', nichoObra: 'OBRAS_PUBLICAS', qtdObrasSimultaneas: 6, faturamentoEstimado: '78000', temSocio: true, equipePropia: true, qtdEngenheiros: 5, dorPrincipal: 'ATRASO_OBRA', origem: 'OUTBOUND_ATIVO', responsavel: 'Vagner', estagioPipeline: 'QUALIFICADO', diasParado: 3 },
    { nomeEmpresa: 'Santos Dumont Construções', nomeContato: 'Roberta Campos', telefone: '(11) 94543-2109', cidade: 'São Paulo', email: 'roberta@santosdumont.com.br', nichoObra: 'COMERCIAL', qtdObrasSimultaneas: 3, faturamentoEstimado: '48000', temSocio: false, equipePropia: true, qtdEngenheiros: 2, dorPrincipal: 'OUTRO', origem: 'META_ADS', responsavel: 'Vagner', estagioPipeline: 'EM_CONTATO', diasParado: 6 },
    { nomeEmpresa: 'SP Residencial Médio', nomeContato: 'Anderson Vieira', telefone: '(11) 93432-1098', cidade: 'Santo André', nichoObra: 'RESIDENCIAL_MEDIO', qtdObrasSimultaneas: 2, faturamentoEstimado: '36000', temSocio: false, equipePropia: false, qtdEngenheiros: 1, dorPrincipal: 'FLUXO_CAIXA', origem: 'INSTAGRAM', responsavel: 'Vagner', estagioPipeline: 'NOVO_LEAD', diasParado: 12 },
  ], [
    { idx: 0, tipo: 'LIGAR', tent: 3 }, { idx: 3, tipo: 'AGENDAR_REUNIAO', tent: 1 },
    { idx: 4, tipo: 'LIGAR', tent: 2 }, { idx: 5, tipo: 'LIGAR', tent: 1 },
    { idx: 6, tipo: 'LIGAR', tent: 1 },
  ], [
    { leadIdx: 0, tipo: 'NOTA_INTERNA', conteudo: 'Em negociação. Marcelo quer fechar até final do mês.', resultado: 'EM_NEGOCIACAO' },
    { leadIdx: 1, tipo: 'NOTA_INTERNA', conteudo: 'Proposta enviada. Valor: R$4.800/mês. Aguardando retorno.', resultado: 'PROPOSTA_ENVIADA' },
    { leadIdx: 2, tipo: 'NOTA_INTERNA', conteudo: 'Reunião no canteiro de Guarulhos. Diretor muito interessado.', resultado: 'REUNIAO_REALIZADA' },
    { leadIdx: 3, tipo: 'LIGACAO', conteudo: 'Ligação realizada. Reunião agendada para próxima semana.', resultado: 'REUNIAO_AGENDADA' },
    { leadIdx: 4, tipo: 'WHATSAPP', conteudo: 'WhatsApp enviado após indicação. Aguardando retorno.', resultado: 'MENSAGEM_ENVIADA' },
  ])

  console.log('✅ Auto-seed concluído: Bernardo (Salvador), Gabriel (BH), Vagner (SP)')
}

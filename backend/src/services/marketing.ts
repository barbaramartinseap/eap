export interface AgentInput {
  canal: string
  formato: string
  icp: string
  objetivo: string
  tema?: string   // opcional — se vazio, o agente ChatGPT define o tema
  nomeFranqueado: string
  cidade: string
}

// ---------------------------------------------------------------------------
// Dados estáticos — banco de temas por ICP
// ---------------------------------------------------------------------------

export const TEMAS_BANCO: Record<string, string[]> = {
  OBRAS_PUBLICAS: [
    'Rastreabilidade semanal em obras com margem limitada',
    'Como evitar aditivos por falta de planejamento de execução',
    'Descompasso entre medições, financeiro e campo: o risco invisível',
    'Controle por frente de serviço em obras públicas complexas',
    'Reprogramação de obra: quando iniciar antes de perder o prazo contratual',
    'Documentação como proteção: o que toda construtora pública deveria registrar',
    'Tomada de decisão sem dado: o gargalo que ninguém vê no canteiro',
    'Obras públicas com múltiplas equipes: como manter padrão de execução',
    'Atraso físico vs atraso financeiro: entendendo a diferença antes que seja tarde',
    'O erro de controlar obra por intuição quando o contrato exige evidência',
  ],
  ALTO_PADRAO: [
    'Previsibilidade de prazo em obras de alto padrão: por que é tão difícil',
    'Compatibilização de projetos: o custo do retrabalho que ninguém prevê',
    'Compras reativas em obra de alto padrão: como a urgência destrói a margem',
    'Comunicação entre escritório e canteiro: o risco de decisão sem dado de campo',
    'Controle de acabamento em obras premium: o que realmente importa acompanhar',
    'Cliente exigente, obra mal gerida: como proteger a reputação da construtora',
    'Gestão de equipes em obras de alto padrão: rotina vs improviso',
    'Tomada de decisão no canteiro: o que acontece quando falta informação confiável',
    'Retrabalho em obra de alto padrão: causas reais e como prevenir',
    'O perfil do gestor de obras premium: técnico e executivo ao mesmo tempo',
  ],
  INCORPORADORAS: [
    'VGV alto e caixa desalinhado: o que está por trás desse desequilíbrio',
    'Velocidade de obra e velocidade de vendas: quando os dois não se falam',
    'Cronograma físico-financeiro: por que ele quebra antes de terminar a obra',
    'Múltiplos empreendimentos simultâneos: como manter governança operacional',
    'Repasse e prazo: o impacto de uma semana de atraso no resultado da incorporação',
    'Fluxo de caixa em obra: onde o dinheiro some antes de aparecer no balanço',
    'Aprovação, lançamento e execução: a tríade que precisa de ritmo para funcionar',
    'Previsibilidade operacional em incorporadoras: da maquete ao habite-se',
    'Margem comprimida: como a ineficiência de campo consome o resultado financeiro',
    'O que toda incorporadora deveria saber antes de iniciar a próxima obra',
  ],
  MULTIPLAS_OBRAS: [
    'Falta de padrão entre obras: o custo escondido da gestão descentralizada',
    'Decisões centralizadas no dono: o gargalo que impede a construtora de crescer',
    'Gestão dependente de pessoas: o risco de uma obra parar com a saída de um líder',
    'Compras reativas e urgência permanente: por que isso acontece e como sair',
    'Indicadores atrasados: quando o problema chega pelo resultado, não pelo processo',
    'Rotina semanal de controle: o que separa construtoras que crescem das que sobrevivem',
    'Falta de visão consolidada: como gerir carteira de obras sem perder margem',
    'Dificuldade de escalar: o que impede a construtora de abrir mais frentes com controle',
    'Gestão por urgência: o modo de operação que parece normal mas é o maior risco',
    'Como construtoras com 3 ou mais obras simultâneas criam rotina de decisão',
  ],
  ENGENHEIROS: [
    'A diferença entre ser um bom técnico e um gestor de obras eficiente',
    'Rotina do assessor executivo EAP: como é um dia de acompanhamento real',
    'Visita de campo como ferramenta de decisão, não de fiscalização',
    'Gestão remota de obra: o que funciona e o que cria risco operacional',
    'Diagnóstico técnico: como transformar observação de canteiro em plano de ação',
    'Planejamento na prática: a diferença entre cronograma na parede e gestão real',
    'Como engenheiros civis estão construindo receita recorrente como assessores',
    'Posicionamento profissional para engenheiros: autoridade antes de proposta',
    'Gestão de carteira de clientes: o que muda quando você tem método',
    'O olhar externo que toda construtora precisa e raramente tem',
  ],
  DONOS: [
    'O que acontece com a construtora quando o dono é o único que sabe de tudo',
    'Previsibilidade de resultado: por que donos de construtora perdem noites de sono',
    'Crescer sem perder controle: o dilema do dono de construtora bem-sucedido',
    'Decisões financeiras em obra: quando o dono decide sem dado confiável',
    'O que muda na construtora quando o dono para de apagar incêndio e começa a gerir',
    'Sazonalidade, atraso e fluxo de caixa: o tripé que todo dono de construtora conhece',
    'Delegar sem perder controle: o passo que a maioria dos donos não consegue dar',
    'O custo de não ter método: quanto custa a improvisação em uma obra de médio porte',
    'Construtora familiar: como estruturar para crescer sem criar conflito de gestão',
    'O que os donos de construtoras mais lucrativas fazem diferente na gestão de obra',
  ],
  DIRETORES: [
    'Governança operacional em construtoras: o que significa na prática',
    'Indicadores de obra que diretores realmente precisam acompanhar',
    'Tomada de decisão estratégica com dados de campo: como criar esse fluxo',
    'O papel do diretor na cultura de gestão de obras da construtora',
    'Expansão com controle: o desafio de diretores de construtoras em crescimento',
    'Transparência operacional: como construir visibilidade real sobre múltiplas obras',
    'Reunião de resultado vs reunião de processo: o que cada uma deveria ter',
    'Risco operacional em obras: como diretores identificam antes que vire crise',
    'Estruturar para crescer: o momento em que a construtora precisa de método',
    'O que diretores de construtoras líderes fazem diferente na gestão de portfólio',
  ],
  GESTORES: [
    'O dia a dia de um gestor de obras eficiente: rotina, dados e decisão',
    'Controle de cronograma físico: o que realmente funciona no canteiro',
    'Como gerir equipes de obra sem virar o único responsável por tudo',
    'Checklist de obra: ferramenta simples que a maioria ainda não usa bem',
    'Antecipação de problemas em obra: o que separa o gestor reativo do proativo',
    'Comunicação entre áreas de obra: onde os problemas costumam começar',
    'Como documentar obra sem burocracia desnecessária',
    'Gestão de subempreiteiros: o desafio que todo gestor de obra conhece',
    'Reunião de alinhamento semanal: como transformar em ferramenta real de gestão',
    'O que muda na obra quando o gestor passa a trabalhar com indicadores confiáveis',
  ],
  ENGENHEIROS_CIVIS: [
    'Engenheiro civil no mercado: como construir autoridade antes de prospectar',
    'Consultoria de gestão de obras: o que é, o que não é, e por que é diferente de fiscalização',
    'Como transformar experiência técnica em receita recorrente previsível',
    'LinkedIn para engenheiros civis: o que funciona e o que afasta o cliente certo',
    'Posicionamento de nicho para engenheiros: por que atender a todos é atender a ninguém',
    'Proposta de valor para construtoras: o que o cliente precisa ouvir para contratar',
    'Portfólio de obra vs portfólio de resultado: qual os clientes valorizam mais',
    'Como engenheiros estão gerando R$10k/mês com assessoria executiva de gestão',
    'O erro mais comum de engenheiros que tentam vender consultoria sem método',
    'EAP como modelo de negócio: o que significa ser um assessor executivo de gestão de obras',
  ],
  DOR_OPERACIONAL: [
    'Obra parada por falta de decisão: o custo que ninguém coloca na planilha',
    'Prazo, custo e qualidade: por que as três raramente andam juntas sem método',
    'Previsibilidade operacional: o que toda construtora quer e poucas conseguem',
    'O gargalo entre planejamento, compras e execução: onde o dinheiro some',
    'Controle de obra em tempo real: a diferença entre dado e sensação',
    'Por que obras com orçamento adequado ainda perdem margem no canteiro',
    'O impacto de uma semana sem dado confiável na gestão de uma obra de médio porte',
    'Gestão de risco em obras: o que construtoras bem geridas fazem diferente',
    'Como a falta de rotina de controle vira custo oculto no resultado final',
    'Método vs improviso: o que separa obras que entregam das que correm atrás',
  ],
}

// ---------------------------------------------------------------------------
// Biblioteca da Matriz — conteúdos-base prontos
// ---------------------------------------------------------------------------

export interface BibliotecaItem {
  id: string
  titulo: string
  canal: string
  formato: string
  icp: string
  objetivo: string
  descricao: string
  conteudoBase: string
  cta: string
}

export const BIBLIOTECA_MATRIZ: BibliotecaItem[] = [
  {
    id: 'bib-001',
    titulo: 'Post LinkedIn — Obra parada por falta de decisão',
    canal: 'LINKEDIN',
    formato: 'POST_TECNICO',
    icp: 'MULTIPLAS_OBRAS',
    objetivo: 'GERAR_AUTORIDADE',
    descricao: 'Post técnico sobre o custo da indecisão no canteiro. Tom executivo.',
    conteudoBase:
      'Toda obra tem um momento em que a decisão vale mais do que qualquer recurso disponível.\n\nNão é o orçamento que paralisa. Não é a equipe. Não é o fornecedor.\n\nÉ a ausência de dado confiável para decidir com segurança.\n\nQuando o gestor não tem informação em tempo real, ele espera. Quando ele espera, o canteiro improvisa. Quando o canteiro improvisa, o resultado escapa.\n\nÉ um ciclo silencioso que toda construtora com múltiplas obras já viveu.\n\nO problema não está nas pessoas. Está no processo.\n\nE processo, diferente de talento, é algo que se constrói com método.',
    cta: 'Se sua construtora tem 3 ou mais obras em andamento, vale conversar sobre como criar esse processo. Fale com a unidade EAP.',
  },
  {
    id: 'bib-002',
    titulo: 'Carrossel Instagram — Rotina semanal de controle',
    canal: 'INSTAGRAM',
    formato: 'CARROSSEL',
    icp: 'MULTIPLAS_OBRAS',
    objetivo: 'EDUCAR_MERCADO',
    descricao: 'Carrossel com 9 painéis ensinando a montar rotina semanal de controle de obra.',
    conteudoBase:
      'P1: A sua construtora tem rotina de controle semanal?\nP2: A maioria das construtoras brasileiras não tem.\nP3: E o resultado aparece nos números: atraso, retrabalho, margem comprimida.\nP4: O erro mais comum: confundir visita ao canteiro com gestão de obra.\nP5: Visita sem dado não é controle. É fiscalização por intuição.\nP6: Rotina de controle real tem: dado, responsável, prazo e decisão.\nP7: Construtoras com esse processo entregam mais, gastam menos e crescem sem perder margem.\nP8: A EAP ajuda construtoras a construir essa rotina. Com método. Com presença. Com resultado.\nP9: Quer entender como isso funciona na prática? Fale com a unidade EAP da sua região.',
    cta: 'Fale com a unidade EAP da sua região.',
  },
  {
    id: 'bib-003',
    titulo: 'Post LinkedIn — O custo do engenheiro sobrecarregado',
    canal: 'LINKEDIN',
    formato: 'POST_AUTORIDADE',
    icp: 'DONOS',
    objetivo: 'CONVIDAR_DIAGNOSTICO',
    descricao: 'Post sobre o modelo de gestão que centraliza tudo no dono ou no engenheiro líder.',
    conteudoBase:
      'Existe um modelo de negócio muito comum em construtoras brasileiras que parece funcionar — até o dia que não funciona mais.\n\nÉ o modelo onde o dono sabe de tudo. Ou o engenheiro líder sabe de tudo.\n\nFornecedor, prazo, equipe, orçamento, problema, solução: tudo passa por uma pessoa.\n\nNa fase inicial, isso até faz sentido. A empresa é pequena, o dono está presente, o resultado acontece.\n\nO problema é quando a empresa cresce.\n\nMais obras. Mais equipes. Mais decisões. E ainda uma só pessoa no centro de tudo.\n\nAí o sistema quebra. Não porque o dono é ruim. Mas porque o modelo nunca foi feito para escalar.\n\nEstruturar não é perder controle. É criar condições para crescer sem se tornar o gargalo do próprio negócio.',
    cta: 'Para uma análise da sua estrutura de gestão, entre em contato com a unidade EAP.',
  },
  {
    id: 'bib-004',
    titulo: 'Legenda Instagram — Bastidor de visita de campo',
    canal: 'INSTAGRAM',
    formato: 'LEGENDA',
    icp: 'ENGENHEIROS',
    objetivo: 'MOSTRAR_ROTINA',
    descricao: 'Legenda para foto ou vídeo de visita em canteiro de obras.',
    conteudoBase:
      'Semana começa no canteiro.\n\nNão para fiscalizar. Para observar, questionar e apoiar a tomada de decisão.\n\nA diferença entre um assessor técnico e um fiscalizador está no que ele faz com o que vê.\n\nFiscalizador registra desvio. Assessor cria condição para que o desvio não se repita.\n\nÉ esse o trabalho de campo que a EAP realiza com construtoras em toda a rede de franquias.',
    cta: 'Quer saber como funciona a assessoria executiva de gestão de obras? Fale com a unidade EAP da sua cidade.',
  },
  {
    id: 'bib-005',
    titulo: 'Post LinkedIn — Obras públicas e rastreabilidade',
    canal: 'LINKEDIN',
    formato: 'POST_DIAGNOSTICO',
    icp: 'OBRAS_PUBLICAS',
    objetivo: 'EDUCAR_MERCADO',
    descricao: 'Post técnico sobre rastreabilidade em obras públicas com margem limitada.',
    conteudoBase:
      'Em obras públicas, margem costuma ser baixa por contrato.\n\nIsso não é novidade para quem atua nesse mercado.\n\nO que poucos calculam é o quanto a falta de rastreabilidade consome o que restaria de margem.\n\nAditivo não previsto. Retrabalho não documentado. Medição contestada. Equipe parada esperando decisão.\n\nCada um desses pontos tem um custo. Somados, podem tornar uma obra lucrativa em prejuízo.\n\nA rastreabilidade semanal — dado por frente, por semana, por responsável — é o que permite identificar o problema antes de se tornar um buraco no resultado.\n\nNão é burocracia. É proteção financeira.',
    cta: 'Se sua construtora atua em obras públicas e quer conversar sobre como estruturar o controle, fale com a unidade EAP.',
  },
  {
    id: 'bib-006',
    titulo: 'Carrossel Instagram — O que é assessoria executiva de gestão de obras',
    canal: 'INSTAGRAM',
    formato: 'CARROSSEL',
    icp: 'DOR_OPERACIONAL',
    objetivo: 'MOSTRAR_DIFERENCIAL',
    descricao: 'Carrossel explicando o modelo EAP para quem não conhece assessoria de gestão.',
    conteudoBase:
      'P1: O que é assessoria executiva de gestão de obras?\nP2: Não é terceirização. Não é fiscalização. Não é consultoria que entrega relatório.\nP3: É presença técnica semanal, com dado real e apoio à tomada de decisão.\nP4: O assessor EAP acompanha a obra, identifica desvios e ajuda o dono a decidir com segurança.\nP5: Resultado: obra dentro do prazo, dentro do custo e com margem preservada.\nP6: Construtoras que trabalham com método entregam mais e crescem com menos risco.\nP7: A EAP atua com franqueados em todo o Brasil, especializados em assessoria executiva.\nP8: Não vendemos relatório. Vendemos resultado.\nP9: Quer entender como funciona na prática? Fale com a unidade EAP da sua região.',
    cta: 'Fale com a unidade EAP da sua região.',
  },
  {
    id: 'bib-007',
    titulo: 'Post LinkedIn — Diferença entre planejamento e gestão',
    canal: 'LINKEDIN',
    formato: 'POST_OPINIAO',
    icp: 'GESTORES',
    objetivo: 'GERAR_AUTORIDADE',
    descricao: 'Post de opinião sobre a diferença entre planejar e gerir uma obra na prática.',
    conteudoBase:
      'Planejamento e gestão de obra são atividades diferentes.\n\nPlanejamento acontece antes da obra começar. Gestão acontece todos os dias enquanto ela está em execução.\n\nO erro clássico: tratar o cronograma como entregável de início, e não como ferramenta de gestão contínua.\n\nCronograma que não é atualizado toda semana não é gestão. É arquivamento.\n\nGestão real tem ritmo. Tem dado. Tem responsável. Tem decisão.\n\nConstrutoras que confundem as duas atividades terminam dependendo de urgência para avançar.\n\nE urgência, em obra, tem custo.',
    cta: 'Sua operação tem rotina semanal de gestão ou trabalha por urgência? Vale uma conversa. Fale com a unidade EAP.',
  },
  {
    id: 'bib-008',
    titulo: 'Roteiro Reels — Diagnóstico em 30 segundos',
    canal: 'INSTAGRAM',
    formato: 'REELS',
    icp: 'DONOS',
    objetivo: 'ATRAIR_LEAD',
    descricao: 'Roteiro curto de Reels para donos de construtora. Formato: gancho + diagnóstico + CTA.',
    conteudoBase:
      'GANCHO: Você sabe dizer, agora, qual frente da sua obra está atrasada?\nCONTEXTO: Se precisar de mais de 2 minutos pra responder, há um problema de gestão a resolver.\nDIAGNÓSTICO: Gestão de obra não é presença no canteiro. É dado em tempo real.\nCTA: A EAP ajuda construtoras a construir essa visibilidade. Fale com a unidade da sua região.',
    cta: 'Fale com a unidade EAP da sua região.',
  },
  {
    id: 'bib-009',
    titulo: 'Post LinkedIn — Incorporadoras: prazo e repasse',
    canal: 'LINKEDIN',
    formato: 'POST_DADO',
    icp: 'INCORPORADORAS',
    objetivo: 'EDUCAR_MERCADO',
    descricao: 'Post com dado sobre impacto de atraso no repasse de incorporadoras.',
    conteudoBase:
      'Cada semana de atraso em obra de incorporação tem um custo financeiro direto.\n\nNão é só sobre imagem ou multa contratual.\n\nÉ sobre fluxo de caixa, custo financeiro, pressão de compradores e risco de distrato.\n\nIncorporadoras que gerenciam bem o prazo de obra não fazem isso por acaso.\n\nFazem porque têm processo. Têm dado semanal. Têm quem acompanhe de perto e sinalize desvio antes de virar problema.\n\nO prazo de obra é uma variável financeira. Precisa ser tratada como tal.',
    cta: 'Se sua incorporadora quer estruturar o controle de prazo com mais rigor, fale com a unidade EAP.',
  },
  {
    id: 'bib-010',
    titulo: 'Carrossel Instagram — 5 sinais de que sua obra precisa de método',
    canal: 'INSTAGRAM',
    formato: 'CARROSSEL',
    icp: 'DONOS',
    objetivo: 'ATRAIR_LEAD',
    descricao: 'Carrossel diagnóstico que ajuda donos a identificar problemas de gestão.',
    conteudoBase:
      'P1: 5 sinais de que sua obra precisa de método de gestão\nP2: 1. Você só fica sabendo do problema depois que já virou custo\nP3: 2. As decisões passam por você mesmo quando você está ausente\nP4: 3. O cronograma existe mas ninguém o atualiza toda semana\nP5: 4. As compras costumam ser feitas às pressas, sem planejamento prévio\nP6: 5. Você tem sensação de que a obra está bem — mas não tem dado que comprove\nP7: Esses sinais não são falha de equipe. São ausência de processo.\nP8: A EAP existe para ajudar construtoras a construir esse processo com método e presença semanal.\nP9: Quer fazer um diagnóstico da sua operação? Fale com a unidade EAP.',
    cta: 'Fale com a unidade EAP.',
  },
  {
    id: 'bib-011',
    titulo: 'Post LinkedIn — Franqueado EAP: o assessor executivo',
    canal: 'LINKEDIN',
    formato: 'POST_ROTINA',
    icp: 'ENGENHEIROS',
    objetivo: 'MOSTRAR_ROTINA',
    descricao: 'Post sobre a rotina do assessor executivo EAP, para engenheiros que queiram o modelo.',
    conteudoBase:
      'Minha semana começa no canteiro de obras.\n\nNão para inspecionar. Para entender o estado real da operação.\n\nDados de execução por frente. Desvios de prazo. Compras pendentes. Decisões travadas.\n\nDe lá, volto ao escritório com informação suficiente para ajudar o dono ou diretor a tomar decisão com segurança.\n\nÉ esse o trabalho de um assessor executivo de gestão de obras.\n\nTécnico o suficiente para entender o canteiro. Executivo o suficiente para transformar dado em decisão.\n\nÉ o modelo que a EAP leva para construtoras em todo o Brasil.',
    cta: 'Se você é engenheiro civil e quer entender como construir receita recorrente com assessoria de gestão, fale com a unidade EAP.',
  },
  {
    id: 'bib-012',
    titulo: 'Legenda Instagram — Alto padrão e gestão de expectativa',
    canal: 'INSTAGRAM',
    formato: 'LEGENDA',
    icp: 'ALTO_PADRAO',
    objetivo: 'GERAR_AUTORIDADE',
    descricao: 'Legenda para conteúdo de obra de alto padrão, posicionando EAP como referência.',
    conteudoBase:
      'Obra de alto padrão não tolera improviso.\n\nO cliente tolera menos ainda.\n\nO que diferencia uma entrega premium não está só na qualidade do acabamento — está no controle de processo que impede o retrabalho antes que aconteça.\n\nMétodo não é burocracia. É respeito pelo resultado que o cliente está pagando para receber.',
    cta: 'A EAP atua com construtoras de alto padrão em todo o Brasil. Fale com a unidade da sua região.',
  },
]

// ---------------------------------------------------------------------------
// Sugestões da semana
// ---------------------------------------------------------------------------

interface SugestaoSemana {
  tema: string
  canal: string
  formato: string
  icp: string
  objetivo: string
  prioridade: string
}

export function gerarSugestoesSemana(): SugestaoSemana[] {
  return [
    {
      tema: 'Obra parada por falta de decisão: o custo que ninguém coloca na planilha',
      canal: 'LINKEDIN',
      formato: 'POST_TECNICO',
      icp: 'MULTIPLAS_OBRAS',
      objetivo: 'GERAR_AUTORIDADE',
      prioridade: 'ALTA',
    },
    {
      tema: 'Rotina semanal de controle: o que separa construtoras que crescem das que sobrevivem',
      canal: 'INSTAGRAM',
      formato: 'CARROSSEL',
      icp: 'DONOS',
      objetivo: 'EDUCAR_MERCADO',
      prioridade: 'ALTA',
    },
    {
      tema: 'Bastidor de visita técnica em canteiro de obras',
      canal: 'INSTAGRAM',
      formato: 'LEGENDA',
      icp: 'ENGENHEIROS',
      objetivo: 'MOSTRAR_ROTINA',
      prioridade: 'MEDIA',
    },
    {
      tema: 'Como construtoras com 3 ou mais obras simultâneas criam rotina de decisão',
      canal: 'LINKEDIN',
      formato: 'POST_AUTORIDADE',
      icp: 'MULTIPLAS_OBRAS',
      objetivo: 'ATRAIR_LEAD',
      prioridade: 'ALTA',
    },
    {
      tema: 'O que acontece com a construtora quando o dono é o único que sabe de tudo',
      canal: 'INSTAGRAM',
      formato: 'REELS',
      icp: 'DONOS',
      objetivo: 'CONVIDAR_DIAGNOSTICO',
      prioridade: 'MEDIA',
    },
    {
      tema: 'Rastreabilidade semanal em obras com margem limitada',
      canal: 'LINKEDIN',
      formato: 'POST_DIAGNOSTICO',
      icp: 'OBRAS_PUBLICAS',
      objetivo: 'GERAR_AUTORIDADE',
      prioridade: 'MEDIA',
    },
  ]
}

// ---------------------------------------------------------------------------
// Mapeamentos de labels
// ---------------------------------------------------------------------------

const CTA_MAP: Record<string, string> = {
  GERAR_AUTORIDADE: 'Sua obra não precisa depender apenas de urgência e improviso. A EAP atua para trazer método, rotina e previsibilidade para a gestão de obras.',
  EDUCAR_MERCADO: 'Se sua construtora tem múltiplas obras em andamento, vale olhar para isso com mais método.',
  ATRAIR_LEAD: 'Quer entender onde sua operação está travando? Fale com a unidade EAP.',
  GERAR_DIRETO: 'Manda uma mensagem aqui no direct ou entra em contato com a unidade EAP da sua região.',
  CONVIDAR_DIAGNOSTICO: 'Para uma análise da sua rotina de gestão, entre em contato.',
  MOSTRAR_ROTINA: 'Converse com a unidade EAP da sua região.',
  MOSTRAR_DIFERENCIAL: 'A EAP atua para trazer método, rotina e previsibilidade para a gestão de obras.',
  QUEBRAR_OBJECAO: 'Para entender como o investimento em gestão se paga na prática, fale com a unidade EAP.',
  FILTRAR_PUBLICO: 'Se você atua com construtoras que buscam resultado com método, fale com a unidade EAP.',
  RECONHECIMENTO_LOCAL: 'Converse com a unidade EAP da sua cidade.',
}

const ICP_LABEL: Record<string, string> = {
  OBRAS_PUBLICAS: 'obras públicas',
  ALTO_PADRAO: 'obras de alto padrão',
  INCORPORADORAS: 'incorporadoras',
  MULTIPLAS_OBRAS: 'construtoras com múltiplas obras',
  DONOS: 'donos de construtoras',
  DIRETORES: 'diretores de engenharia',
  GESTORES: 'gestores de obras',
  ENGENHEIROS: 'engenheiros civis',
  ALTO_VGV: 'empreendimentos de alto VGV',
  DOR_OPERACIONAL: 'construtoras com gargalos operacionais',
  ENGENHEIROS_CIVIS: 'engenheiros civis',
}

const OBJETIVO_LABEL: Record<string, string> = {
  GERAR_AUTORIDADE: 'gerar autoridade',
  EDUCAR_MERCADO: 'educar o mercado',
  ATRAIR_LEAD: 'atrair lead qualificado',
  GERAR_DIRETO: 'gerar conversa no direct',
  CONVIDAR_DIAGNOSTICO: 'convidar para diagnóstico',
  MOSTRAR_ROTINA: 'mostrar rotina do assessor',
  MOSTRAR_DIFERENCIAL: 'mostrar diferencial da EAP',
  QUEBRAR_OBJECAO: 'quebrar objeção',
  FILTRAR_PUBLICO: 'filtrar público',
  RECONHECIMENTO_LOCAL: 'gerar reconhecimento local',
}

const HASHTAGS_ICP: Record<string, string[]> = {
  OBRAS_PUBLICAS: ['#gestãodeobras', '#obrapublica', '#engenharia', '#construtora', '#planejamentodeobra', '#EAP'],
  ALTO_PADRAO: ['#gestãodeobras', '#obrasaltopadrao', '#engenharia', '#construtora', '#qualidade', '#EAP'],
  INCORPORADORAS: ['#gestãodeobras', '#incorporadora', '#engenharia', '#prazo', '#resultadodeobra', '#EAP'],
  MULTIPLAS_OBRAS: ['#gestãodeobras', '#construtora', '#engenharia', '#método', '#crescimentocomcontrole', '#EAP'],
  DONOS: ['#gestãodeobras', '#construtora', '#donodeconstrutora', '#engenharia', '#métododegestão', '#EAP'],
  DIRETORES: ['#gestãodeobras', '#construtora', '#engenharia', '#governançaoperacional', '#resultado', '#EAP'],
  GESTORES: ['#gestãodeobras', '#gestordeobra', '#engenharia', '#planejamento', '#controledeobra', '#EAP'],
  ENGENHEIROS: ['#engenheirocivil', '#gestãodeobras', '#assessoriaexecutiva', '#EAP', '#receitarecorrente'],
  ENGENHEIROS_CIVIS: ['#engenheirocivil', '#gestãodeobras', '#assessoriaexecutiva', '#EAP', '#consultoria'],
  ALTO_VGV: ['#gestãodeobras', '#incorporadora', '#altovgv', '#engenharia', '#resultado', '#EAP'],
  DOR_OPERACIONAL: ['#gestãodeobras', '#construtora', '#método', '#controledeobra', '#eficiência', '#EAP'],
}

function getHashtags(icp: string): string[] {
  return HASHTAGS_ICP[icp] ?? ['#gestãodeobras', '#construtora', '#engenharia', '#EAP']
}

function getCta(objetivo: string): string {
  return CTA_MAP[objetivo] ?? 'Converse com a unidade EAP da sua região.'
}

// ---------------------------------------------------------------------------
// Agente 1 — Estrategista de Conteúdo
// ---------------------------------------------------------------------------

interface EstrategistaResult {
  temas: string[]
  anguloAbordagem: string
  publicoAlvo: string
  objetivoPost: string
  ctaRecomendado: string
}

export function agentEstrategista(input: AgentInput): EstrategistaResult {
  const icpTemas = TEMAS_BANCO[input.icp] ?? TEMAS_BANCO['DOR_OPERACIONAL']
  const shuffled = [...icpTemas].sort(() => 0.5 - Math.random())
  const temas = shuffled.slice(0, 5)

  const angulos: Record<string, string> = {
    GERAR_AUTORIDADE: 'Diagnóstico técnico com posicionamento de especialista. Mostre que você enxerga o que a maioria não vê.',
    EDUCAR_MERCADO: 'Conteúdo didático que explica um conceito relevante sem vender diretamente. Crie valor antes de criar desejo.',
    ATRAIR_LEAD: 'Conteúdo que identifica a dor do ICP e posiciona a EAP como solução natural. Foco na identificação do problema.',
    CONVIDAR_DIAGNOSTICO: 'Conteúdo diagnóstico que faz o leitor se reconhecer em um cenário problemático e querer uma saída.',
    MOSTRAR_ROTINA: 'Bastidor autêntico que humaniza o assessor e demonstra competência através da rotina, não do discurso.',
    MOSTRAR_DIFERENCIAL: 'Contraste direto entre a abordagem EAP e o mercado. Mostre o que é diferente sem denegrir o concorrente.',
    QUEBRAR_OBJECAO: 'Abordagem que antecipa a principal resistência do ICP e a desmonta com argumento técnico e evidência.',
    EDUCAR_MERCADO_2: 'Use dado, experiência de campo ou observação do mercado como ponto de partida.',
    FILTRAR_PUBLICO: 'Conteúdo polarizador que atrai quem tem o perfil certo e afasta quem não tem. Seja claro sobre quem você atende.',
    RECONHECIMENTO_LOCAL: 'Conteúdo que menciona a cidade, o mercado local ou casos da região para gerar proximidade.',
  }

  return {
    temas,
    anguloAbordagem: angulos[input.objetivo] ?? angulos['GERAR_AUTORIDADE'],
    publicoAlvo: ICP_LABEL[input.icp] ?? input.icp,
    objetivoPost: OBJETIVO_LABEL[input.objetivo] ?? input.objetivo,
    ctaRecomendado: getCta(input.objetivo),
  }
}

// ---------------------------------------------------------------------------
// Agente 2 — Copywriter LinkedIn
// ---------------------------------------------------------------------------

interface LinkedInResult {
  tituloInterno: string
  post: string
  cta: string
  hashtags: string[]
  comentarioFixo: string
  variacaoCurta: string
  objetivo: string
  icp: string
}

const GANCHOS_LINKEDIN: Record<string, string[]> = {
  MULTIPLAS_OBRAS: [
    'Existe um ponto em que toda construtora com múltiplas obras enfrenta o mesmo problema.',
    'Quando a terceira obra começa, algo muda na construtora — e quase ninguém está preparado.',
    'Gestão de múltiplas obras simultâneas não é escala. É risco multiplicado por três.',
  ],
  DONOS: [
    'O maior gargalo da maioria das construtoras não está na obra. Está no modelo de gestão.',
    'Toda construtora tem um momento em que o dono percebe que não pode mais saber de tudo.',
    'Crescer sem estrutura não é crescimento. É só mais volume do mesmo problema.',
  ],
  OBRAS_PUBLICAS: [
    'Em obras públicas, margem não é negociável. Por isso, gestão precisa ser rigorosa.',
    'Rastreabilidade em obra pública não é burocracia. É proteção financeira e contratual.',
    'O aditivo que poderia ser evitado geralmente começa com a ausência de dado na semana certa.',
  ],
  INCORPORADORAS: [
    'Cada semana de atraso em obra de incorporação tem um custo que vai além da multa contratual.',
    'Incorporadoras que entregam no prazo não têm sorte. Têm processo.',
    'VGV alto não protege a incorporadora de resultado baixo quando a gestão de obra falha.',
  ],
  ALTO_PADRAO: [
    'Obra de alto padrão não perdoa improviso. O cliente tolera menos ainda.',
    'Retrabalho em obra premium tem custo duplo: financeiro e de reputação.',
    'O que diferencia uma entrega de alto padrão começa muito antes do acabamento.',
  ],
  ENGENHEIROS: [
    'A formação técnica te prepara para entender o canteiro. Não para transformar isso em negócio.',
    'Ser bom engenheiro e ter um negócio de engenharia lucrativo são habilidades diferentes.',
    'Engenheiros civis que constroem receita recorrente não são os melhores tecnicamente. São os mais estruturados.',
  ],
  GESTORES: [
    'Gestor de obra proativo e reativo fazem a mesma visita ao canteiro. O que muda é o que fazem com o que veem.',
    'Dado sem decisão não é gestão. É registro.',
    'A diferença entre gerir uma obra e apagar incêndio nela é a semana de antecedência.',
  ],
  DIRETORES: [
    'Diretor que sabe do resultado mas não sabe do processo está sempre chegando tarde.',
    'Governança de obra começa antes do problema aparecer — e isso requer dado semanal.',
    'Crescer o portfólio sem crescer o processo é a receita mais comum para compressão de margem.',
  ],
  DOR_OPERACIONAL: [
    'O custo da improvisação em obra nunca aparece em uma única linha do orçamento.',
    'Prazo, custo e qualidade raramente andam juntos sem processo. Com processo, os três são possíveis.',
    'O gargalo entre planejamento, compras e execução é onde a margem da obra vai embora.',
  ],
}

export function agentCopywriterLinkedIn(input: AgentInput): LinkedInResult {
  const ganchos = GANCHOS_LINKEDIN[input.icp] ?? GANCHOS_LINKEDIN['DOR_OPERACIONAL']
  const gancho = ganchos[Math.floor(Math.random() * ganchos.length)]

  const cta = getCta(input.objetivo)

  const post = `${gancho}

${input.tema}.

Quando ${ICP_LABEL[input.icp] ?? 'construtoras'} não têm processo estruturado para isso, a consequência aparece nos números antes de aparecer nos relatórios.

A decisão é tomada tarde. A correção custa mais do que custaria prevenir. E o ciclo se repete.

O problema não está nas pessoas envolvidas. Está na ausência de método que permita identificar o desvio antes de ele se tornar custo.

Construtoras que resolvem isso de forma consistente não fazem por talento. Fazem por processo.

Método. Rotina. Dado. Decisão.

${cta}`

  const variacaoCurta = `${gancho}

${input.tema}.

O padrão mais comum: problema identificado quando já é custo.

O que construtoras bem geridas fazem diferente: processo que sinaliza o desvio antes.

${cta}`

  return {
    tituloInterno: `LinkedIn — ${(input.tema ?? '').slice(0, 60)}`,
    post,
    cta,
    hashtags: getHashtags(input.icp),
    comentarioFixo: `A EAP atua com construtoras em todo o Brasil com assessoria executiva de gestão de obras. Franqueados especializados em ${ICP_LABEL[input.icp] ?? 'gestão de obras'}. Fale com a unidade da sua região.`,
    variacaoCurta,
    objetivo: OBJETIVO_LABEL[input.objetivo] ?? input.objetivo,
    icp: ICP_LABEL[input.icp] ?? input.icp,
  }
}

// ---------------------------------------------------------------------------
// Agente 3 — Roteirista de Carrossel Instagram
// ---------------------------------------------------------------------------

interface PainelCarrossel {
  numero: number
  texto: string
  direcaoVisual: string
}

interface CarrosselResult {
  titulo: string
  subtitulo: string
  paineis: PainelCarrossel[]
  legenda: string
  cta: string
  hashtags: string[]
  promptCapa: string
  promptImagens: string
  observacoesDesign: string
}

const DIRECOES_VISUAIS: Record<string, string[]> = {
  OBRAS_PUBLICAS: [
    'Canteiro de obra pública, planilha de medição, homens com capacete em reunião',
    'Obra grande em andamento, maquinário pesado, cena de execução estrutural',
    'Engenheiro com prancheta analisando cronograma no canteiro',
    'Reunião de equipe técnica com planta na mesa',
    'Cena de obra parada, contraste com obra em movimento',
    'Dado em tela de computador sendo analisado por engenheiro',
    'Canteiro organizado, com identificação de frentes de serviço',
    'Equipe EAP em visita técnica, foto profissional de campo',
    'Logotipo EAP em fundo navy com CTA claro',
  ],
  MULTIPLAS_OBRAS: [
    'Vista aérea de múltiplos canteiros simultâneos',
    'Dashboard com dados de obras em tela de notebook',
    'Engenheiro em reunião de alinhamento com equipe de campo',
    'Cronograma físico-financeiro sendo atualizado',
    'Construtora bem organizada com processos visíveis',
    'Dado de obra sendo revisado por diretor',
    'Canteiro com organização e controle visíveis',
    'Equipe EAP em reunião estratégica com cliente',
    'Logotipo EAP em fundo navy com CTA claro',
  ],
  ENGENHEIROS: [
    'Engenheiro civil em campo com tablet e prancheta',
    'Home office de assessor executivo com laptop e planta',
    'Reunião de assessoria com dono de construtora',
    'Engenheiro analisando dado de campo em canteiro',
    'Notebook com planilha de controle de obra',
    'Assessor em visita técnica formal com cliente',
    'Engenheiro com apresentação de resultado para diretoria',
    'Rotina profissional de assessor EAP em campo e escritório',
    'Logotipo EAP com CTA para franqueados',
  ],
}

export function agentRotaristaCarrossel(input: AgentInput): CarrosselResult {
  const cta = getCta(input.objetivo)
  const icpLabel = ICP_LABEL[input.icp] ?? 'construtoras'
  const visuais = DIRECOES_VISUAIS[input.icp] ?? DIRECOES_VISUAIS['MULTIPLAS_OBRAS']

  const paineis: PainelCarrossel[] = [
    {
      numero: 1,
      texto: `${input.tema}`,
      direcaoVisual: visuais[0] ?? 'Canteiro de obras, cena de campo profissional',
    },
    {
      numero: 2,
      texto: `A maioria de ${icpLabel} que encontramos tem esse desafio — mas poucas sabem nomear com precisão.`,
      direcaoVisual: visuais[1] ?? 'Cena de obra em andamento com contexto de desafio operacional',
    },
    {
      numero: 3,
      texto: `O problema real: sem processo definido, esse ponto se torna uma fonte constante de custo não previsto.`,
      direcaoVisual: visuais[2] ?? 'Engenheiro identificando problema no canteiro',
    },
    {
      numero: 4,
      texto: `O erro mais comum: tentar resolver com mais pessoas, mais pressão ou mais horas — sem mudar o processo.`,
      direcaoVisual: visuais[3] ?? 'Cena de equipe sob pressão sem organização clara',
    },
    {
      numero: 5,
      texto: `A consequência prática: o problema volta. Diferente de forma, igual de resultado.`,
      direcaoVisual: visuais[4] ?? 'Dado de obra mostrando desvio ou atraso',
    },
    {
      numero: 6,
      texto: `O diagnóstico correto: o gargalo está no processo, não nas pessoas. E processo é algo que se constrói.`,
      direcaoVisual: visuais[5] ?? 'Engenheiro analisando dado com foco e clareza',
    },
    {
      numero: 7,
      texto: `O caminho correto: método, rotina e dado semanal. Identificar o desvio antes de virar custo.`,
      direcaoVisual: visuais[6] ?? 'Canteiro organizado com processos visíveis e equipe alinhada',
    },
    {
      numero: 8,
      texto: `É isso que a EAP faz. Assessoria executiva semanal para que ${icpLabel} entreguem mais, com menos risco e margem preservada.`,
      direcaoVisual: visuais[7] ?? 'Equipe EAP em visita técnica profissional com cliente',
    },
    {
      numero: 9,
      texto: cta,
      direcaoVisual: visuais[8] ?? 'Logotipo EAP em fundo navy, CTA claro e objetivo',
    },
  ]

  const legenda = `${input.tema}.\n\nEsse é um dos pontos que mais vemos em ${icpLabel} que atendemos.\n\nO problema não está nas pessoas. Está no processo.\n\nSalva esse carrossel se fizer sentido pra sua realidade.\n\n${cta}\n\n${getHashtags(input.icp).join(' ')}`

  const promptCapa = `Foto profissional em canteiro de obras brasileiro, estilo editorial. Engenheiro com capacete e EPIs, analisando documento ou tablet. Luz natural, composição 4:5, sem filtros saturados. Texto sobreposto: "${(input.tema ?? '').slice(0, 50)}..." em fonte bold, branca, sobre overlay navy semitransparente. Estilo premium, sem caricatura, sem banco de imagem genérico.`

  const promptImagens = `Série de 9 imagens para carrossel Instagram (4:5). Estética consistente: paleta navy (#070D1C), dourado (#B88A2A) e branco. Canteiro de obras, engenharia, gestão, dados, reuniões técnicas. Sem filtros genéricos, sem pessoas sorridentes sem contexto, sem estética motivacional. Tom: profissional, executivo, realista.`

  return {
    titulo: (input.tema ?? '').slice(0, 80),
    subtitulo: `O que ${icpLabel} precisam saber sobre isso`,
    paineis,
    legenda,
    cta,
    hashtags: getHashtags(input.icp),
    promptCapa,
    promptImagens,
    observacoesDesign: 'Paleta: navy (#070D1C) + dourado (#B88A2A) + branco. Fonte: bold sem serifa. Painel 1 = capa impactante. Painéis 2-8 = fundo branco com texto escuro. Painel 9 = fundo navy com logotipo EAP e CTA dourado.',
  }
}

// ---------------------------------------------------------------------------
// Agente 4 — Gerador de Legendas Instagram
// ---------------------------------------------------------------------------

interface LegendasResult {
  legendaFinal: string
  primeiraLinha: string
  cta: string
  hashtags: string[]
  versaoCurta: string
  versaoTecnica: string
}

export function agentGeradorLegendas(input: AgentInput): LegendasResult {
  const cta = getCta(input.objetivo)
  const icpLabel = ICP_LABEL[input.icp] ?? 'construtoras'
  const hashtags = getHashtags(input.icp)

  const primeiraLinha = `${input.tema}.`

  const legendaFinal = `${primeiraLinha}

É um dos pontos que mais aparecem quando conversamos com ${icpLabel}.

Não por falta de competência. Por falta de processo que sustente a decisão certa no momento certo.

O que muda quando existe método: menos urgência, mais previsibilidade. Menos retrabalho, mais margem.

${cta}

${hashtags.join(' ')}`

  const versaoCurta = `${primeiraLinha}

Falta processo, não competência.

${cta}

${hashtags.slice(0, 3).join(' ')}`

  const versaoTecnica = `${primeiraLinha}

Do ponto de vista técnico, o que vemos com frequência em ${icpLabel}: ausência de rotina de controle semanal, dado fragmentado entre áreas, e decisões tomadas com informação atrasada.

O resultado é previsível: desvio identificado tarde, correção com custo extra, e o ciclo se repete.

A abordagem da EAP é estruturar esse processo de forma que o dado chegue no momento em que ainda é possível agir preventivamente.

${cta}

${hashtags.join(' ')}`

  return {
    legendaFinal,
    primeiraLinha,
    cta,
    hashtags,
    versaoCurta,
    versaoTecnica,
  }
}

// ---------------------------------------------------------------------------
// Agente 5 — Gerador de Prompt de Imagem
// ---------------------------------------------------------------------------

interface ImagemResult {
  promptImagem: string
  proporcao: string
  estiloVisual: string
  elementosCena: string
  textoCapa: string
  orientacaoComposicao: string
  restricoes: string
}

const PROPORCOES: Record<string, string> = {
  CARROSSEL: '4:5 (1080x1350px)',
  REELS: '9:16 (1080x1920px)',
  POST_TECNICO: '4:5 ou 1:1',
  POST_AUTORIDADE: '4:5 ou 1:1',
  POST_DIAGNOSTICO: '4:5 ou 1:1',
  POST_OPINIAO: '4:5 ou 1:1',
  POST_DADO: '4:5 ou 1.91:1',
  POST_ROTINA: '4:5 ou 9:16',
  POST_CASE: '4:5 ou 1:1',
  POST_INSTITUCIONAL: '1:1 ou 4:5',
  BASTIDOR: '4:5 ou 9:16',
  PROVA_TECNICA: '4:5 ou 1:1',
  LEGENDA: '4:5 ou 1:1',
}

const CENAS_ICP: Record<string, string> = {
  OBRAS_PUBLICAS: 'grande canteiro de obra pública, maquinário pesado, andaimes, equipe com EPIs completos, documentação visível',
  ALTO_PADRAO: 'obra de alto padrão em fase de acabamento, materiais premium, arquitetura contemporânea, profissionais em traje formal no canteiro',
  INCORPORADORAS: 'empreendimento residencial em construção, escritório de vendas ao fundo, engenheiro com planta e tablet',
  MULTIPLAS_OBRAS: 'vista de múltiplos canteiros, gestão operacional, reunião de alinhamento com equipe técnica',
  DONOS: 'escritório executivo de construtora, dono em reunião estratégica com equipe, ambiente profissional',
  ENGENHEIROS: 'engenheiro civil em campo com equipamento técnico, escritório home office de assessor, reunião de assessoria',
  GESTORES: 'gestor de obra no canteiro com tablet e prancheta, reunião de equipe de campo, checklist de obra',
  DIRETORES: 'sala de reunião executiva, diretoria analisando dashboard de obras, ambiente corporativo premium',
  DOR_OPERACIONAL: 'canteiro de obra com foco em processo e dado, engenheiro identificando ponto crítico, reunião técnica',
}

export function agentGeradorImagem(input: AgentInput): ImagemResult {
  const proporcao = PROPORCOES[input.formato] ?? '4:5'
  const cena = CENAS_ICP[input.icp] ?? CENAS_ICP['DOR_OPERACIONAL']
  const temaSlug = (input.tema ?? '').slice(0, 50)

  const promptImagem = `Fotografia editorial profissional. Contexto: ${cena}. Luz natural ou estúdio controlado. Estilo: profissional, premium, realista, sem filtros artificiais. Paleta de tons: neutros quentes + navy (#070D1C). Composição ${proporcao}. Tema visual: "${temaSlug}". Pessoas com capacete e EPIs quando em canteiro. Sem banco de imagem genérico, sem sorrisos forçados, sem elementos motivacionais.`

  return {
    promptImagem,
    proporcao,
    estiloVisual: 'Fotográfico realista, profissional, premium. Paleta neutra quente + navy. Sem filtros, sem caricatura, sem estética infantil.',
    elementosCena: cena,
    textoCapa: temaSlug,
    orientacaoComposicao: `Composição ${proporcao}. Sujeito principal no terço superior. Texto sobreposto com overlay navy semitransparente no terço inferior. Logotipo EAP no canto inferior direito.`,
    restricoes: 'Sem banco de imagem genérico. Sem pessoas sorridentes sem contexto. Sem filtros saturados. Sem estética motivacional ou coach. Sem elementos genéricos de "sucesso". Sem emoji ou ilustração.',
  }
}

// ---------------------------------------------------------------------------
// Agente 6 — Adaptador de Canal
// ---------------------------------------------------------------------------

interface AdaptadorResult {
  versaoLinkedIn: LinkedInResult
  carrosselInstagram: CarrosselResult
  legendaInstagram: LegendasResult
  roteiroCurto: ReelsResult
  ctaDirect: string
  ctaDiagnostico: string
}

interface ReelsResult {
  gancho: string
  roteiro: string
  textoTeleprompter: string
  sugestaoTakes: string
  legenda: string
  cta: string
  hashtags: string[]
  observacoesGravacao: string
}

export function agentRotaristaReels(input: AgentInput): ReelsResult {
  const cta = getCta(input.objetivo)
  const icpLabel = ICP_LABEL[input.icp] ?? 'construtoras'

  const gancho = `Você consegue dizer, agora, o que está atrasado na sua obra?`

  const roteiro = `[0-3s] GANCHO: ${gancho}
[3-8s] Se a resposta demorar mais de 2 minutos, existe um problema de processo a resolver.
[8-15s] A maioria de ${icpLabel} que acompanhamos tinha esse mesmo cenário: decisões tomadas com dado atrasado.
[15-22s] O que muda com método: ${input.tema}.
[22-27s] Não é complexo. É processo. E processo se constrói.
[27-30s] ${cta}`

  const textoTeleprompter = `Você consegue dizer, agora, o que está atrasado na sua obra?\n\nSe a resposta demorar mais de 2 minutos — existe um problema de processo a resolver.\n\nA maioria de ${icpLabel} que acompanhamos tinha esse mesmo cenário.\n\nO que muda com método: ${input.tema}.\n\nNão é complexo. É processo.\n\n${cta}`

  const legenda = `${input.tema}.\n\nEssa pergunta simples revela muito sobre como uma obra está sendo gerida.\n\n${cta}\n\n${getHashtags(input.icp).join(' ')}`

  return {
    gancho,
    roteiro,
    textoTeleprompter,
    sugestaoTakes: '1. Close no rosto falando para câmera (gancho e CTA). 2. B-roll de canteiro ou escritório (meio do vídeo). 3. Texto animado sobre imagem de campo para reforçar ponto principal.',
    legenda,
    cta,
    hashtags: getHashtags(input.icp),
    observacoesGravacao: 'Grave em ambiente profissional: escritório, canteiro ou sala de reunião. Iluminação frontal. Roupas profissionais. Tom direto, sem exaltação. Duração: 25-30 segundos. Subtítulos obrigatórios.',
  }
}

export function agentAdaptadorCanal(input: AgentInput): AdaptadorResult {
  return {
    versaoLinkedIn: agentCopywriterLinkedIn(input),
    carrosselInstagram: agentRotaristaCarrossel(input),
    legendaInstagram: agentGeradorLegendas(input),
    roteiroCurto: agentRotaristaReels(input),
    ctaDirect: 'Manda uma mensagem aqui no direct com "DIAGNÓSTICO" que entramos em contato.',
    ctaDiagnostico: getCta('CONVIDAR_DIAGNOSTICO'),
  }
}

// ---------------------------------------------------------------------------
// Dispatcher principal
// ---------------------------------------------------------------------------

export function gerarConteudo(input: AgentInput): object {
  const key = `${input.canal}:${input.formato}`
  switch (key) {
    case 'LINKEDIN:POST_TECNICO':
    case 'LINKEDIN:POST_AUTORIDADE':
    case 'LINKEDIN:POST_DIAGNOSTICO':
    case 'LINKEDIN:POST_OPINIAO':
    case 'LINKEDIN:POST_DADO':
    case 'LINKEDIN:POST_ROTINA':
    case 'LINKEDIN:POST_CASE':
      return agentCopywriterLinkedIn(input)

    case 'INSTAGRAM:CARROSSEL':
      return agentRotaristaCarrossel(input)

    case 'INSTAGRAM:LEGENDA':
    case 'INSTAGRAM:POST_INSTITUCIONAL':
    case 'INSTAGRAM:BASTIDOR':
    case 'INSTAGRAM:PROVA_TECNICA':
      return agentGeradorLegendas(input)

    case 'INSTAGRAM:REELS':
      return agentRotaristaReels(input)

    default:
      // Fallback: adaptar para ambos os canais
      return agentAdaptadorCanal(input)
  }
}

// ---------------------------------------------------------------------------
// Agentes ChatGPT da EAP
// ---------------------------------------------------------------------------

export const AGENTES = {
  BIA: {
    nome: 'Bia',
    subtitulo: 'Agente de Textos Técnicos EAP',
    emoji: '✍️',
    link: 'https://chatgpt.com/g/g-69fb4956518881919738eca9da3f3cd3-bia-textos-tecnicos',
    instrucaoUso: 'Abra a Bia no ChatGPT, cole o prompt abaixo e envie.',
  },
  CLAUDIO: {
    nome: 'Cláudio',
    subtitulo: 'Agente de Carrosséis Virais EAP',
    emoji: '🎠',
    link: 'https://chatgpt.com/g/g-69fb4670b8808191a51689e95bfac64a-claudio-carrosseis-virais',
    instrucaoUso: 'Abra o Cláudio no ChatGPT, cole o prompt abaixo e envie.',
  },
}

export interface PromptAgenteResult {
  agente: typeof AGENTES.BIA | typeof AGENTES.CLAUDIO | null
  prompt: string
}

// Bloco padrão de identidade visual para imagens Instagram
function blocoVisualIG(icp: string, proporcao = '4:5 (1080x1350px)'): string {
  const cena = CENAS_ICP[icp] ?? CENAS_ICP['DOR_OPERACIONAL']
  return `IDENTIDADE VISUAL EAP:
- Paleta: navy (#070D1C) + dourado (#B88A2A) + branco
- Estilo: fotografia editorial profissional, premium, sem filtros artificiais
- Proporção: ${proporcao}
- Cenário de referência: ${cena}
- Pessoas com capacete e EPIs quando em canteiro
- SEM banco de imagem genérico, SEM sorrisos forçados, SEM estética motivacional ou coach`
}

// Bloco padrão de identidade visual para imagens LinkedIn
function blocoVisualLI(icp: string): string {
  const cena = CENAS_ICP[icp] ?? CENAS_ICP['DONOS']
  return `IDENTIDADE VISUAL EAP:
- Paleta: navy (#070D1C) + dourado (#B88A2A) + branco
- Estilo: fotografia editorial executiva, profissional, sem filtros
- Proporção: 1:1 ou 4:5 (1080x1080px ou 1080x1350px)
- Cenário de referência: ${cena}
- SEM banco de imagem genérico, SEM sorrisos forçados, SEM estética motivacional`
}

export function gerarPromptAgente(input: AgentInput): PromptAgenteResult {
  const icpLabel      = ICP_LABEL[input.icp] ?? input.icp
  const objetivoLabel = OBJETIVO_LABEL[input.objetivo] ?? input.objetivo
  const cta           = getCta(input.objetivo)
  const temaLivre     = (input.tema ?? '').trim()

  const blocoTema = (canal: string) => temaLivre
    ? `Tema: ${temaLivre}`
    : canal === 'LINKEDIN'
      ? `Tema: Escolha o tema mais relevante para ${icpLabel.toLowerCase()} no LinkedIn que posicione o assessor EAP como referência técnica. Informe o tema escolhido antes de iniciar.`
      : `Tema: Escolha o tema mais relevante e com maior potencial de engajamento para ${icpLabel.toLowerCase()} no Instagram. Informe o tema escolhido antes de iniciar.`

  const blocoEAP = `Contexto EAP: A EAP (Engenharia e Performance) é uma rede de franquias de assessoria executiva de gestão de obras. O assessor acompanha obras semanalmente trazendo método, dado e rotina para que construtoras entreguem mais com menos risco. Unidade: ${input.cidade}.`

  const tomIG = `Tom: técnico, direto, sem clichês motivacionais.
NÃO usar: "incrível", "fantástico", "sucesso", tom de coach, promessas genéricas.
USAR: diagnóstico preciso, linguagem do setor, dados reais, experiência de campo.`

  const tomLI = `Tom: técnico, executivo, direto — sem clichês nem frases motivacionais.
NÃO usar: "incrível", "fantástico", "sucesso", tom de coach, promessas vagas, linguagem genérica de marketing.
USAR: diagnóstico preciso, linguagem de mercado, experiência de campo, dados e consequências reais.`

  // ── LinkedIn → Bia (TODOS os formatos LinkedIn) ─────────────────────────
  if (input.canal === 'LINKEDIN') {
    const prompt = `Vamos criar um post para LinkedIn da EAP. Siga as etapas na ordem e aguarde minha confirmação entre elas.

━━━ ESPECIFICAÇÕES ━━━
ICP: ${icpLabel} — construtoras, engenheiros e gestores do setor de construção civil brasileiro
Objetivo: ${objetivoLabel}
${blocoTema('LINKEDIN')}
${blocoEAP}

━━━ ETAPA 1 — TEXTO DO POST ━━━
${tomLI}

Estrutura:
1. Gancho forte (1-2 linhas que prendem a atenção)
2. Contexto do problema (2-3 linhas)
3. Conflito ou erro mais comum (2-3 linhas)
4. Diagnóstico técnico (2-3 linhas)
5. Implicação prática (1-2 linhas)
6. Fechamento com autoridade (1-2 linhas)
7. CTA: "${cta}"

Entregue:
- Post completo (versão principal)
- Variação curta (para teste A/B)
- Hashtags (6-8 tags do setor)
- Sugestão de comentário fixado`

    return { agente: AGENTES.BIA, prompt }
  }

  // ── Instagram → Cláudio (TODOS os formatos Instagram) ───────────────────
  if (input.canal === 'INSTAGRAM') {

    // ── Carrossel ───────────────────────────────────────────────────────────
    if (input.formato === 'CARROSSEL') {
      const prompt = `Vamos criar um carrossel completo para Instagram da EAP. Siga as etapas na ordem e aguarde minha confirmação entre elas.

━━━ ESPECIFICAÇÕES ━━━
ICP: ${icpLabel} — construtoras, engenheiros e gestores de obras no Brasil
Objetivo: ${objetivoLabel}
${blocoTema('INSTAGRAM')}
${blocoEAP}

━━━ ETAPA 1 — TEXTOS DOS 9 PAINÉIS ━━━
${tomIG}

Estrutura dos painéis:
P1 — Capa / Gancho (frase impactante que prende sem entregar o conteúdo)
P2 — Contexto (por que esse tema importa para o público)
P3 — O problema real (o que de fato acontece)
P4 — O erro mais comum (o que as pessoas fazem de errado)
P5 — A consequência prática (o que acontece quando não se resolve)
P6 — O diagnóstico técnico (a causa raiz)
P7 — O caminho correto (o que funciona)
P8 — Como a EAP resolve (presença semanal, método, dado)
P9 — CTA: "${cta}"

Para cada painel entregue:
- Número (P1, P2…)
- Título / frase principal (até 8 palavras, impacto máximo)
- Texto de apoio (2-3 linhas, direto ao ponto)

━━━ ETAPA 2 — LEGENDA E HASHTAGS (após aprovação dos textos) ━━━
Quando eu confirmar os textos, gere:
- Legenda completa para o Instagram (com quebras de linha para legibilidade)
- 10-15 hashtags do setor de construção civil`

      return { agente: AGENTES.CLAUDIO, prompt }
    }

    // ── Reels ────────────────────────────────────────────────────────────────
    if (input.formato === 'REELS') {
      const prompt = `Vamos criar um Reels para Instagram da EAP. Siga as etapas na ordem e aguarde minha confirmação entre elas.

━━━ ESPECIFICAÇÕES ━━━
ICP: ${icpLabel} — construtoras, engenheiros e gestores de obras no Brasil
Objetivo: ${objetivoLabel}
${blocoTema('INSTAGRAM')}
${blocoEAP}

━━━ ETAPA 1 — ROTEIRO DO REELS (30 segundos) ━━━
${tomIG}

Estrutura do roteiro:
[0-3s] Gancho — pergunta ou afirmação que prende imediatamente
[3-8s] Problema — o que de fato acontece com ${icpLabel.toLowerCase()}
[8-18s] Desenvolvimento — diagnóstico + o que muda com método EAP
[18-25s] Prova / dado — evidência concreta
[25-30s] CTA: "${cta}"

Entregue:
- Roteiro completo com marcações de tempo
- Texto para teleprompter (corrido, sem marcações)
- Sugestão de takes / b-roll

━━━ ETAPA 2 — LEGENDA E HASHTAGS (após aprovação do roteiro) ━━━
- Legenda completa com o gancho expandido e CTA
- 10-15 hashtags do setor de construção civil`

      return { agente: AGENTES.CLAUDIO, prompt }
    }

    // ── Post / Legenda / Bastidor / Prova técnica / Institucional ───────────
    const fmtNome: Record<string, string> = {
      LEGENDA: 'legenda de post', POST_INSTITUCIONAL: 'post institucional',
      BASTIDOR: 'post de bastidor', PROVA_TECNICA: 'prova técnica / case',
    }
    const nomeFormato = fmtNome[input.formato] ?? 'post para Instagram'

    const prompt = `Vamos criar um ${nomeFormato} para Instagram da EAP. Siga as etapas na ordem e aguarde minha confirmação entre elas.

━━━ ESPECIFICAÇÕES ━━━
ICP: ${icpLabel} — construtoras, engenheiros e gestores de obras no Brasil
Objetivo: ${objetivoLabel}
${blocoTema('INSTAGRAM')}
${blocoEAP}

━━━ ETAPA 1 — TEXTO DO POST ━━━
${tomIG}

Entregue:
- Legenda principal (com gancho forte na primeira linha, corpo direto e CTA ao final)
- CTA: "${cta}"
- Versão curta (para teste)
- 10-15 hashtags do setor de construção civil`

    return { agente: AGENTES.CLAUDIO, prompt }
  }

  // Fallback improvável — canal desconhecido
  return { agente: null, prompt: `Crie um conteúdo para ${input.canal} / ${input.formato} com foco em ${icpLabel}. Objetivo: ${objetivoLabel}. CTA: "${cta}".` }
}

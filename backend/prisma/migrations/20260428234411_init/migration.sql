-- CreateTable
CREATE TABLE "UnidadeFranqueada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVA',
    "cidade" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeEmpresa" TEXT NOT NULL,
    "nomeContato" TEXT NOT NULL,
    "telefone" TEXT,
    "scoreIcp" INTEGER NOT NULL DEFAULT 0,
    "temperatura" TEXT NOT NULL DEFAULT 'FRIO',
    "diasParado" INTEGER NOT NULL DEFAULT 0,
    "estagioPipeline" TEXT NOT NULL DEFAULT 'NOVO_LEAD',
    "origem" TEXT NOT NULL DEFAULT 'CADASTRO_MANUAL',
    "nichoObra" TEXT NOT NULL DEFAULT 'OUTRO',
    "qtdObrasSimultaneas" INTEGER NOT NULL DEFAULT 1,
    "unidadeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "UnidadeFranqueada" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Oportunidade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "estagio" TEXT NOT NULL DEFAULT 'NOVO_LEAD',
    "valor" REAL,
    "leadId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Oportunidade_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Oportunidade_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "UnidadeFranqueada" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "descricao" TEXT NOT NULL,
    "dataVencimento" DATETIME NOT NULL,
    "observacoes" TEXT,
    "tentativaNum" INTEGER NOT NULL DEFAULT 1,
    "leadId" TEXT NOT NULL,
    "oportunidadeId" TEXT,
    "unidadeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tarefa_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tarefa_oportunidadeId_fkey" FOREIGN KEY ("oportunidadeId") REFERENCES "Oportunidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tarefa_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "UnidadeFranqueada" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotaInteracao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "resultado" TEXT,
    "leadId" TEXT NOT NULL,
    "oportunidadeId" TEXT,
    "tarefaId" TEXT,
    "unidadeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotaInteracao_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NotaInteracao_oportunidadeId_fkey" FOREIGN KEY ("oportunidadeId") REFERENCES "Oportunidade" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "NotaInteracao_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "UnidadeFranqueada" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UnidadeFranqueada_email_key" ON "UnidadeFranqueada"("email");

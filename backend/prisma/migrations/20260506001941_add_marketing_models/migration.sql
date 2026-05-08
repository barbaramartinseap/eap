-- CreateTable
CREATE TABLE "ConteudoMarketing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unidadeId" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "formato" TEXT NOT NULL,
    "icp" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PRONTO',
    "dataPublicacao" DATETIME,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "ConteudoMarketing_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "UnidadeFranqueada" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CalendarioEditorial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unidadeId" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "canal" TEXT NOT NULL,
    "formato" TEXT,
    "tema" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IDEIA',
    "conteudoId" TEXT,
    "observacoes" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "CalendarioEditorial_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "UnidadeFranqueada" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ConteudoMarketing_unidadeId_idx" ON "ConteudoMarketing"("unidadeId");

-- CreateIndex
CREATE INDEX "CalendarioEditorial_unidadeId_idx" ON "CalendarioEditorial"("unidadeId");

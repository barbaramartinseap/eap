-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeEmpresa" TEXT NOT NULL,
    "nomeContato" TEXT NOT NULL,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "cidade" TEXT,
    "instagram" TEXT,
    "site" TEXT,
    "nichoObra" TEXT NOT NULL DEFAULT 'OUTRO',
    "qtdObrasSimultaneas" INTEGER NOT NULL DEFAULT 1,
    "faturamentoEstimado" TEXT,
    "temSocio" BOOLEAN NOT NULL DEFAULT false,
    "equipePropia" BOOLEAN NOT NULL DEFAULT false,
    "qtdEngenheiros" INTEGER NOT NULL DEFAULT 0,
    "dorPrincipal" TEXT NOT NULL DEFAULT 'OUTRO',
    "origem" TEXT NOT NULL DEFAULT 'CADASTRO_MANUAL',
    "scoreIcp" INTEGER NOT NULL DEFAULT 0,
    "scoreUrgencia" INTEGER NOT NULL DEFAULT 0,
    "temperatura" TEXT NOT NULL DEFAULT 'FRIO',
    "estagioPipeline" TEXT NOT NULL DEFAULT 'NOVO_LEAD',
    "chanceFechamento" INTEGER NOT NULL DEFAULT 0,
    "diasParado" INTEGER NOT NULL DEFAULT 0,
    "responsavel" TEXT,
    "motivoPerda" TEXT,
    "primeiraAcaoEm" DATETIME,
    "observacoes" TEXT,
    "unidadeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "UnidadeFranqueada" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("chanceFechamento", "cidade", "createdAt", "diasParado", "dorPrincipal", "email", "equipePropia", "estagioPipeline", "faturamentoEstimado", "id", "instagram", "motivoPerda", "nichoObra", "nomeContato", "nomeEmpresa", "observacoes", "origem", "primeiraAcaoEm", "qtdEngenheiros", "qtdObrasSimultaneas", "responsavel", "scoreIcp", "site", "telefone", "temSocio", "temperatura", "unidadeId", "updatedAt", "whatsapp") SELECT "chanceFechamento", "cidade", "createdAt", "diasParado", "dorPrincipal", "email", "equipePropia", "estagioPipeline", "faturamentoEstimado", "id", "instagram", "motivoPerda", "nichoObra", "nomeContato", "nomeEmpresa", "observacoes", "origem", "primeiraAcaoEm", "qtdEngenheiros", "qtdObrasSimultaneas", "responsavel", "scoreIcp", "site", "telefone", "temSocio", "temperatura", "unidadeId", "updatedAt", "whatsapp" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

/**
 * seed.ts — Seed de desenvolvimento (reset completo + recria os 3 usuários).
 * Usar: npm run db:seed
 */
import { PrismaClient } from '@prisma/client'
import { runAutoSeed } from '../src/lib/autoSeed'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed (reset completo)...')

  await prisma.calendarioEditorial.deleteMany()
  await prisma.conteudoMarketing.deleteMany()
  await prisma.notaInteracao.deleteMany()
  await prisma.tarefa.deleteMany()
  await prisma.oportunidade.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.unidadeFranqueada.deleteMany()

  await runAutoSeed(prisma)

  console.log('\n📋 Credenciais de acesso:')
  console.log('  bernardo@eapia.com.br / E@P2026#  (Salvador)')
  console.log('  gabriel@eapia.com.br  / E@P2026#  (Belo Horizonte)')
  console.log('  vagner@eapia.com.br   / E@P2026#  (São Paulo)')
  console.log('\n🚀 Seed concluído!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

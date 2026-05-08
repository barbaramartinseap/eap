import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import prismaPlugin from './plugins/prisma'
import authPlugin from './plugins/auth'
import healthRoute from './routes/health'
import authRoute from './routes/auth'
import painelRoute from './routes/painel'
import leadsRoute from './routes/leads'
import dashboardRoute from './routes/dashboard'
import marketingRoute from './routes/marketing'

const fastify = Fastify({ logger: true })

async function bootstrap() {
  await fastify.register(cors, { origin: '*' })
  await fastify.register(prismaPlugin)
  await fastify.register(authPlugin)

  await fastify.register(healthRoute)
  await fastify.register(authRoute, { prefix: '/auth' })
  await fastify.register(painelRoute, { prefix: '/painel' })
  await fastify.register(leadsRoute, { prefix: '/leads' })
  await fastify.register(dashboardRoute, { prefix: '/dashboard' })
  await fastify.register(marketingRoute, { prefix: '/marketing' })

  // Auto-seed: cria os dados iniciais se o banco estiver vazio
  const unitCount = await fastify.prisma.unidadeFranqueada.count()
  if (unitCount === 0) {
    fastify.log.info('🌱 Banco vazio — executando seed inicial...')
    const { runAutoSeed } = await import('./lib/autoSeed')
    await runAutoSeed(fastify.prisma)
  }

  const port = Number(process.env.PORT ?? 3333)
  await fastify.listen({ port, host: '0.0.0.0' })
}

bootstrap().catch(err => {
  fastify.log.error(err)
  process.exit(1)
})

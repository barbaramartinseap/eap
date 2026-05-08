import { FastifyPluginAsync } from 'fastify'

const healthRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => ({ ok: true, ts: new Date().toISOString() }))
}

export default healthRoute

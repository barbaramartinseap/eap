import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'

export interface JwtPayload {
  unidadeId: string
  email: string
  nome: string
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    user: JwtPayload
  }
}

const authPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET não configurado no .env')

  await fastify.register(fastifyJwt, { secret })

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.code(401).send({ error: 'Token inválido ou expirado' })
    }
  })
})

export default authPlugin

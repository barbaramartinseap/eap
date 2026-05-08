import { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcryptjs'

const authRoute: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: { email: string; senha: string } }>('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string' },
          senha: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { email, senha } = request.body

    const unidade = await fastify.prisma.unidadeFranqueada.findUnique({
      where: { email },
    })

    if (!unidade) {
      return reply.code(401).send({ error: 'Credenciais inválidas' })
    }

    const senhaValida = await bcrypt.compare(senha, unidade.senha)
    if (!senhaValida) {
      return reply.code(401).send({ error: 'Credenciais inválidas' })
    }

    const token = fastify.jwt.sign(
      { unidadeId: unidade.id, email: unidade.email, nome: unidade.nome },
      { expiresIn: '8h' }
    )

    return {
      token,
      unidade: { id: unidade.id, nome: unidade.nome, cidade: unidade.cidade },
    }
  })
}

export default authRoute

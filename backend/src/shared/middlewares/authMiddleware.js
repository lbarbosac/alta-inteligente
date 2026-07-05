const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { UnauthorizedError } = require('../errors/UnauthorizedError');

/**
 * Middleware de autenticação JWT.
 *
 * Fluxo:
 *  1. Extrai o token do header Authorization (formato: "Bearer <token>").
 *  2. Verifica a assinatura e a expiração com a chave secreta do .env.
 *  3. Pendura o payload decodificado em req.usuario.
 *  4. Chama next() para seguir para o controller.
 *
 * Em qualquer falha, lança UnauthorizedError (status 401)
 * que é capturado pelo errorHandler global.
 *
 * Express 5: erros lançados em funções async propagam automaticamente.
 *
 * Uso nas rotas:
 *   router.get('/rota', authMiddleware, controller);
 *
 * req.usuario terá a estrutura:
 *   { id, nome, email, role: 'admin' | 'professional', iat, exp }
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Verifica se o header existe e segue o formato "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token de autenticação não fornecido.');
  }

  const token = authHeader.split(' ')[1];

  // Verifica o token — jwt.verify lança JsonWebTokenError ou TokenExpiredError
  // se inválido. O errorHandler global trata esses dois casos.
  const decoded = jwt.verify(token, env.JWT_SECRET);

  // Pendura os dados do usuário na requisição para uso nos controllers
  req.usuario = decoded;

  next();
}

module.exports = { authMiddleware };
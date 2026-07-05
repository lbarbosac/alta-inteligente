const { ForbiddenError } = require('../errors/ForbiddenError');

/**
 * Middleware de autorização por perfil (role-based access control).
 *
 * É uma factory: recebe os perfis permitidos e retorna o middleware.
 * Deve ser usado SEMPRE após o authMiddleware, pois depende de req.usuario.
 *
 * Express 5: erros lançados em funções sync também propagam automaticamente.
 *
 * Uso nas rotas:
 *   router.post('/professionals', authMiddleware, roleMiddleware(['admin']), controller);
 *   router.get('/patients',       authMiddleware, roleMiddleware(['professional']), controller);
 *   router.get('/dashboard',      authMiddleware, roleMiddleware(['admin', 'professional']), controller);
 *
 * @param {string[]} perfisPermitidos - Ex: ['admin'], ['professional'], ['admin', 'professional']
 * @returns {Function} Middleware do Express
 */
function roleMiddleware(perfisPermitidos) {
  return (req, res, next) => {
    const role = req.usuario?.role;

    if (!role || !perfisPermitidos.includes(role)) {
      throw new ForbiddenError(
        `Acesso negado. Esta ação é permitida apenas para: ${perfisPermitidos.join(', ')}.`
      );
    }

    next();
  };
}

module.exports = { roleMiddleware };
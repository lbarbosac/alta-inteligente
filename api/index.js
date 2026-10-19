// Função da Vercel: no site publicado, toda requisição para /api/* cai aqui
// (ver "rewrites" no vercel.json) e é atendida pelo mesmo app Express do backend.
module.exports = require('../backend/src/app');

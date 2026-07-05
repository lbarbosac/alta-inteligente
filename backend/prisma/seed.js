const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ── Administrador padrão ────────────────────────────────────────────────
  const senhaHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.administrador.upsert({
    where:  { email: 'admin@altainteligente.com' },
    update: {},
    create: {
      nome:  'Administrador',
      email: 'admin@altainteligente.com',
      senha: senhaHash,
      ativo: true,
    },
  });

  console.log(`✅ Administrador criado: ${admin.email}`);

  // ── Profissional de exemplo (opcional para testes) ──────────────────────
  const senhaProfHash = await bcrypt.hash('prof123', 10);

  const profissional = await prisma.profissional.upsert({
    where:  { email: 'profissional@altainteligente.com' },
    update: {},
    create: {
      nome:          'Dr. João Silva',
      especialidade: 'Cirurgia Odontológica',
      email:         'profissional@altainteligente.com',
      telefone:      '51999999999',
      senha:         senhaProfHash,
      ativo:         true,
    },
  });

  console.log(`✅ Profissional criado: ${profissional.email}`);
  console.log('');
  console.log('─────────────────────────────────────────');
  console.log('🔑 Credenciais de acesso para testes:');
  console.log('   Admin:       admin@altainteligente.com  /  admin123');
  console.log('   Profissional: profissional@altainteligente.com  /  prof123');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
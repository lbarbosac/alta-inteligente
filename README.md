# AltaInteligente

Acompanhamento de pós-operatório. O profissional de saúde cadastra o paciente, vincula um protocolo de
recuperação e acompanha os check-ins diários. O paciente responde por um link único, no celular, sem
login e sem instalar nada.

## Como funciona

1. O profissional cria um **protocolo**: quantos dias dura a recuperação e o que o paciente faz em cada dia.
2. Cadastra o **paciente** e inicia o **tratamento** com a data do procedimento. O Dia 1 é a data do procedimento.
3. O sistema gera um link único (`/p/:token`). O paciente abre no celular e faz o **check-in do dia**: nível de
   dor de 1 a 10, as tarefas do dia, uma observação e até 3 fotos.
4. O profissional vê a evolução da dor, as fotos e o histórico no perfil do paciente.
5. Quando a dor chega a 7, ou piora 2 pontos de um dia para o outro, o profissional recebe um **alerta por e-mail**.
6. O paciente que aceitou receber lembrete ganha uma mensagem por dia enquanto não fizer o check-in.

## O que o sistema já faz

- **Pacientes e tratamentos** com status clínico calculado a partir do último check-in.
- **Protocolos versionados**: editar dias ou tarefas cria uma versão nova, e os tratamentos em andamento
  continuam na versão em que começaram.
- **Portal do paciente** por link, sem senha: tarefas do dia, escala de dor e envio de fotos.
- **Fotos do check-in**: até 3 por dia, reprocessadas no servidor (metadados e GPS removidos) e servidas só
  por link assinado que expira em 15 minutos.
- **Notificações**: alerta de dor por e-mail para o profissional e lembrete diário para o paciente, por
  e-mail ou WhatsApp. Sem SMTP ou sem conta da Meta configurada, o envio é simulado e aparece no log.
- **LGPD**: consentimento do paciente versionado e revogável, política de privacidade e termos de uso,
  aceite dos termos pelo profissional, registro de acesso, exportação e anonimização dos dados do paciente.
- **Contas**: login por perfil (administrador e profissional), recuperação de senha por e-mail e limite de
  tentativas. O administrador cadastra, edita e bloqueia profissionais.

## Stack

| Camada | Tecnologias |
|---|---|
| Backend | Node.js, Express 5, Prisma ORM, MySQL, JWT, bcrypt, Zod, multer, sharp, nodemailer |
| Frontend | React 18, Vite, Tailwind CSS, React Router, React Hook Form, Zod, Recharts, Lucide |

O backend é organizado por domínio: cada módulo em `src/modules/<dominio>/` tem `routes`, `controller`,
`service`, `repository` e `validation`.

## Requisitos

- Node.js 20 ou mais novo (desenvolvido no 24)
- MySQL 8

## Como rodar

### Backend

```bash
cd backend
```

```bash
npm install
```

Copie `.env.example` para `.env` e preencha `DATABASE_URL` e `JWT_SECRET`. Depois:

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed
```

```bash
npm run dev
```

A API sobe em `http://localhost:3000` e o health check fica em `/health`.

O seed cria duas contas **de desenvolvimento** — trocar antes de qualquer uso real:

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | admin@altainteligente.com | admin123 |
| Profissional | profissional@altainteligente.com | prof123 |

### Frontend

```bash
cd frontend
```

```bash
npm install
```

Copie `.env.example` para `.env` e ajuste `VITE_API_URL` se a API não estiver na porta 3000.

```bash
npm run dev
```

O painel sobe em `http://localhost:5173`.

### Scripts

| Onde | Comando | O que faz |
|---|---|---|
| backend | `npm run dev` | API com recarga automática |
| backend | `npm run db:migrate` | cria uma migration nova a partir do schema |
| backend | `npm run db:studio` | abre o Prisma Studio |
| backend | `npm test` | testes unitários |
| frontend | `npm run build` | build de produção |
| frontend | `npm run lint` | ESLint |

## Variáveis de ambiente

Todas estão documentadas nos arquivos `.env.example`. As que mais importam:

| Variável | Onde | Para quê |
|---|---|---|
| `DATABASE_URL`, `JWT_SECRET` | backend | banco e assinatura do token. Obrigatórias |
| `FRONTEND_URL` | backend | CORS e os links que vão nos e-mails |
| `STORAGE_DIR` | backend | pasta das fotos dos check-ins. Vazio usa `backend/storage` |
| `SMTP_*` | backend | envio de e-mail. Sem `SMTP_HOST` o envio é simulado |
| `WHATSAPP_*` | backend | WhatsApp Cloud API. Sem token o envio é simulado |
| `TRUST_PROXY` | backend | quantos proxies confiar para obter o IP real do cliente |
| `VITE_API_URL` | frontend | endereço da API |
| `VITE_EMPRESA_*` | frontend | dados de quem opera a plataforma, usados na política de privacidade e nos termos |

## Estrutura

```
backend/
  prisma/            schema, migrations e seed
  src/
    modules/         auth, patients, protocols, treatments, checkins, photos,
                     notifications, patient-portal, account, admins, audit, dashboard
    shared/          config, middlewares, erros, storage das fotos
    routes/          junta os módulos em /api/v1
frontend/
  src/
    pages/           telas do profissional, do administrador e do portal do paciente
    components/      botão, campo, modal, select, cards, gráfico de dor
    layouts/         painel do profissional, administrador e portal
    services/        chamadas à API
    hooks/           dados das telas
```

## API

Base: `/api/v1`. Tudo em JSON, com envelope `{ success, message, data }`.

| Rota | Para quê |
|---|---|
| `/auth` | login, logout, esqueci a senha, redefinir senha |
| `/account` | preferências de notificação e aceite dos termos |
| `/patients` | pacientes, exportação e anonimização |
| `/protocols` | protocolos e versões |
| `/treatments` | tratamentos |
| `/checkins` | envio do check-in (com fotos) e histórico |
| `/patient/access/:token` | portal do paciente, sem login |
| `/fotos/:id` | foto do check-in, só por link assinado |
| `/professionals` | cadastro de profissionais (administrador) |
| `/dashboard` | resumo do dia do profissional |

## Segurança

- Senhas com bcrypt e sessão por JWT.
- Limite de requisições por IP, com limite mais apertado no login e na recuperação de senha.
- O check-in do paciente é identificado pelo token do link — nunca por id vindo do navegador.
- As fotos não têm URL pública: são servidas por link assinado que expira em 15 minutos, e o servidor
  regrava cada imagem para remover metadados e localização.
- Os dados do paciente só são acessíveis ao profissional dono do cadastro, e cada acesso fica registrado.

## Antes de colocar no ar

- Preencher `VITE_EMPRESA_*` e revisar a política de privacidade e os termos de uso com apoio jurídico.
- Configurar `SMTP_*` para o envio de e-mail.
- Criar a conta na Meta e aprovar o modelo de mensagem do WhatsApp, com três variáveis no corpo:
  `{{1}}` primeiro nome, `{{2}}` dia da recuperação e `{{3}}` link do check-in.
- Servir por HTTPS, manter o servidor sempre ligado (o lembrete diário roda dentro dele) e fazer backup
  do banco junto com a pasta das fotos.

## Licença

GPL-3.0. Veja o arquivo [LICENSE](LICENSE).

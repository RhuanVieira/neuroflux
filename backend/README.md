# API Neuroflux

## Configuração

1. Crie um banco MariaDB chamado `neuroflux`.
2. Copie `.env.example` para `.env` e configure `DATABASE_URL` e `JWT_SECRET`.
3. Instale as dependências com `npm install`.
4. Execute `npm run prisma:migrate -- --name init`, `npm run prisma:generate` e `npm run prisma:seed`.
5. Inicie a API com `npm run dev:api` (porta 3333).

O seed cria o Master definido em `MASTER_EMAIL`/`MASTER_PASSWORD`; se não forem informados, use `master@neuroflux.local` e altere a senha padrão antes de publicar.

## Estrutura MVC

```
backend/
├── prisma/                 # schema e seed (models do banco)
└── server/
    ├── config/             # Prisma e upload
    ├── controllers/        # regras de negócio
    ├── middlewares/        # autenticação, autorização e erros
    ├── routes/             # definição das rotas HTTP
    ├── schemas/            # validação dos dados de entrada
    ├── types/ e utils/     # tipos e seletores reutilizáveis
    └── index.ts            # composição da aplicação Express
```

## Autorização

Envie `Authorization: Bearer <token>` nas rotas protegidas.

| Papel | Permissão |
| --- | --- |
| `MASTER` | Cria, edita e remove administradores; administra todos os materiais. |
| `ADMIN` | Cria materiais e edita/remove apenas os próprios. |
| `STUDENT` | Consulta materiais publicados. |

## Rotas

| Método | Rota | Acesso | Finalidade |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Público | Cria aluno. |
| POST | `/api/auth/login` | Público | Retorna usuário e JWT. |
| GET | `/api/auth/me` | Logado | Dados da sessão. |
| GET/POST | `/api/users` | Master | Lista/cria ADMs. |
| PATCH/DELETE | `/api/users/:id` | Master | Edita/remove ADM. |
| GET | `/api/materials` | Logado | Aluno vê publicados; ADM/Master pode usar `?all=true`. |
| GET | `/api/materials/:id` | Logado | Lê um material. |
| POST | `/api/materials` | ADM/Master | Cria material. |
| PATCH/DELETE | `/api/materials/:id` | ADM/Master | Edita/remove material. |
| POST | `/api/materials/upload` | ADM/Master | Envia arquivo no campo multipart `file`. |

O corpo de material aceita `title`, `description`, `subject`, `grade` (1–3), `content`, `fileUrl` e `status` (`DRAFT` ou `PUBLISHED`). Primeiro envie o arquivo para `/api/materials/upload`; depois use o `fileUrl` recebido ao criar ou atualizar o material.

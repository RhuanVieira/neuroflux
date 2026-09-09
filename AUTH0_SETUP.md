# Configuração Auth0 — Neuroflux

O frontend e backend usam o Audience `https://api.neuroflux.local`.

## 1. Criar a API

No painel Auth0, abra **Applications → APIs → Create API** e use:

- Name: `Neuroflux API`
- Identifier: `https://api.neuroflux.local`
- Signing Algorithm: `RS256`

## 2. Configurar a aplicação SPA

Em **Applications → Applications → sua SPA → Settings**, configure:

- Allowed Callback URLs: `http://localhost:5173`
- Allowed Logout URLs: `http://localhost:5173`
- Allowed Web Origins: `http://localhost:5173`

Inclua a URL HTTPS de produção nos três campos antes de publicar.

## 3. Incluir perfil no token da API

Abra **Actions → Library → Build Custom → Post Login**. Crie, publique e adicione ao fluxo **Login** a Action abaixo:

```js
exports.onExecutePostLogin = async (event, api) => {
  api.accessToken.setCustomClaim("https://neuroflux.app/email", event.user.email);
  api.accessToken.setCustomClaim("https://neuroflux.app/name", event.user.name || event.user.nickname);
};
```

## 4. Habilitar provedores sociais

Em **Authentication → Social**, habilite **Google / Gmail** e **Microsoft Account** e marque esta aplicação em cada conexão.

## 5. Aplicar a migração local

No diretório `backend`, execute:

```powershell
npx prisma migrate deploy
```

Ela adiciona `auth0Id` aos usuários para vincular a conta Auth0 ao aluno local.

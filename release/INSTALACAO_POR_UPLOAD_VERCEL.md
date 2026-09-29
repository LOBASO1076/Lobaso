# Instalação do pacote completo no Vercel

## O que foi entregue

O arquivo `SEAFOODS_PREMIUM_VERCEL_INSTALL.zip` contém o código-fonte completo do SFP-OS, `vercel.json`, entrypoint serverless `api/[...path].ts`, frontend, backend, schema, migrations, testes, scripts de deploy, documentação e artefatos de release. O pacote não contém `node_modules`, `.git`, `dist`, `.env`, tokens ou valores de secrets.

O Vercel deve ser configurado para **Node.js 22.x** em **Project Settings → Build and Deployment → Node.js Version**. O `package.json` também declara `22.x`; o Vercel disponibiliza a versão minor/patch segura mais recente da linha 22.

O endereço público planejado é:

```text
https://pedidos.sfppedidos.app
```

O deployment Vercel existente `index2-seafoods-premium-producao-mo-phi.vercel.app` é um storefront separado. Não importe este pacote sobre ele sem confirmar que esse é o projeto SFP-OS.

## Opção A — Upload pelo dashboard

1. Acesse Vercel e escolha **Add New → Project**.
2. Selecione a opção de importar um projeto local/arquivo, se disponível na sua conta. Se o dashboard aceitar apenas Git, use a Opção B.
3. Extraia `SEAFOODS_PREMIUM_VERCEL_INSTALL.zip` em uma pasta local; selecione a pasta extraída, não o ZIP, como diretório do projeto.
4. Confirme que o diretório contém `package.json`, `pnpm-lock.yaml`, `vercel.json`, `api/`, `client/`, `server/` e `drizzle/`.
5. Use **Install Command** `pnpm install --frozen-lockfile` e **Build Command** `pnpm build`. O `vercel.json` já contém essas opções e `dist/public` como saída estática.
6. Faça primeiro um deployment **Preview**. Não selecione Production antes de confirmar as variáveis e o projeto.
7. Configure as variáveis no Vercel antes do primeiro redeploy. Os nomes obrigatórios e o escopo estão no runbook `VERCEL_INSTALLATION_FINAL_PT-BR.md`.
8. Acesse `/`, `/checkout`, `/api/trpc/dashboard.stagingTenantStatus` e `/api/webhooks/whatsapp`. Em Preview, espere `noindex`, `no-store`, tenant de staging, webhook desligado e catálogo RED bloqueado.

## Opção B — CLI recomendada para um diretório local

Abra um terminal em uma máquina confiável. O token fica somente em memória da sessão:

```bash
unzip SEAFOODS_PREMIUM_VERCEL_INSTALL.zip -d seafoods-premium-saas
cd seafoods-premium-saas

corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build

read -r -s -p "VERCEL_TOKEN: " VERCEL_TOKEN; printf '\n'
export VERCEL_TOKEN
npx --yes vercel@59.22.0 whoami --token="$VERCEL_TOKEN"
```

Confira o projeto correto no painel e defina os identificadores apenas depois dessa confirmação:

```bash
export VERCEL_ORG_ID='<team-id-ou-slug-correto>'
export VERCEL_PROJECT_ID='<project-id-ou-slug-do-sfp-os>'

npx --yes vercel@59.22.0 link \
  --yes \
  --team="$VERCEL_ORG_ID" \
  --project="$VERCEL_PROJECT_ID" \
  --token="$VERCEL_TOKEN"

cat .vercel/project.json
```

Faça o Preview:

```bash
./scripts/vercel-go-live.sh preview
```

O script executa `link`, `pull`, `build` e `deploy --prebuilt`. Ele não cria outro projeto, não escolhe automaticamente uma equipe e não publica Production.

## Variáveis mínimas de Preview

Configure no Vercel **Preview**. Não use valores reais neste documento:

```text
APP_RELEASE_CHANNEL=staging
APP_TENANT_SLUG=seafoods-premium-staging
APP_ALLOW_PERSISTENCE=true
APP_ALLOW_CABRAL_REPRESENTATION=true
APP_CANONICAL_ORIGIN=https://<preview-host>
APP_ALLOWED_ORIGINS=https://<preview-host>
VITE_RELEASE_CHANNEL=staging
VITE_PUBLIC_ORIGIN=https://<preview-host>
DATABASE_URL=<secret no Vercel>
JWT_SECRET=<secret novo no Vercel>
```

Inclua também os valores Manus/OAuth exigidos pelo projeto. Mantenha `WHATSAPP_ENABLED=false` até revogar as credenciais da VPS antiga e configurar novamente o app oficial da Meta.

### AI Gateway

O pacote atual usa o gateway interno Manus por meio de `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY`, sempre no servidor. `AI_GATEWAY_API_KEY` não é consumida pelo código deste release; não cadastre uma chave Vercel AI Gateway esperando que ela altere o comportamento do produto. Para ativar um provider Vercel AI Gateway no futuro, implemente primeiro um adapter server-side, adicione a variável no ambiente Vercel e cubra o adapter com testes — nunca exponha essa chave em `VITE_*`.

## Domínio

Depois que o Preview estiver saudável, associe `pedidos.sfppedidos.app` em **Project → Settings → Domains** ou pela CLI:

```bash
npx --yes vercel@59.22.0 domains add pedidos.sfppedidos.app \
  --scope="$VERCEL_ORG_ID" --token="$VERCEL_TOKEN"
npx --yes vercel@59.22.0 domains inspect pedidos.sfppedidos.app \
  --scope="$VERCEL_ORG_ID" --token="$VERCEL_TOKEN"
```

Use somente os registros retornados por `domains inspect`. Não copie IP ou CNAME de outro deployment e não altere Registro.br antes de confirmar o projeto.

## Production somente após rotação e gates

Antes de Production, execute `INCIDENT_ROTATION_VERCEL.md`, revogue tokens n8n/Z-API, troque `DATABASE_URL` se necessário, gere novo `JWT_SECRET`, revise Meta/AI Gateway, configure backup/restore e valide catálogo, estoque, pagamento e entrega. O runtime falhará fechado se houver variável de ambiente legada n8n/Z-API ou configuração de produção incompleta.

O comando de Production exige a aprovação explícita do script:

```bash
CONFIRM_PRODUCTION_DEPLOY=SEAFOODS_PRODUCTION_APPROVED \
VERCEL_TOKEN="$VERCEL_TOKEN" \
VERCEL_ORG_ID="$VERCEL_ORG_ID" \
VERCEL_PROJECT_ID="$VERCEL_PROJECT_ID" \
APP_CANONICAL_ORIGIN=https://pedidos.sfppedidos.app \
APP_ALLOWED_ORIGINS=https://pedidos.sfppedidos.app,https://www.sfppedidos.app \
APP_TENANT_SLUG=<tenant-operacional-aprovado> \
APP_ALLOW_PERSISTENCE=true \
./scripts/vercel-go-live.sh production
```

Não execute esse comando apenas para testar o pacote. O estado atual é release candidate de staging; a rotação de secrets e a identificação de equipe/projeto Vercel ainda são gates externos.

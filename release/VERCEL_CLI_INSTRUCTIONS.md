# Vercel CLI — Autenticação e deploy controlado

Este guia prepara o deploy do SaaS no projeto Vercel correto. **Não execute produção** antes de catálogo aprovado, backup/restore, provider de pagamento, WhatsApp Business e DNS revisados.

## 1. Obter identificadores e token

No painel Vercel, crie um token com menor privilégio possível e validade curta. No projeto alvo, copie os IDs de organização e projeto. Nunca cole token em chat, repositório, CSV, HTML, `.env` versionado ou argumento de terminal.

```bash
export VERCEL_TOKEN='<token-via-segredo-local>'
export VERCEL_ORG_ID='<org-id>'
export VERCEL_PROJECT_ID='<project-id>'
```

## 2. Validar autenticação e projeto

```bash
npx vercel@latest whoami --token="$VERCEL_TOKEN"
npx vercel@latest projects ls --token="$VERCEL_TOKEN" --scope="$VERCEL_ORG_ID"
```

Confirme que o projeto listado é o host do **SFP-OS**. O storefront Vercel existente não prova que ele é o projeto correto para Commerce Core/Express/tRPC.

## 3. Configurar staging no painel Vercel

Cadastre no ambiente **Preview/Staging**, via Settings → Environment Variables:

```text
APP_RELEASE_CHANNEL=staging
APP_TENANT_SLUG=seafoods-premium-staging
APP_ALLOW_PERSISTENCE=true
APP_ALLOW_CABRAL_REPRESENTATION=true
```

A persistência acima é **técnica de staging**. O guard server-side continua devolvendo demo para `TESTE-*` e referências `RED/blocked`; não promove catálogo nem cria venda comercial sem produtos aprovados.

## 4. Deploy de staging

Na raiz do projeto:

```bash
VERCEL_TOKEN="$VERCEL_TOKEN" \
VERCEL_ORG_ID="$VERCEL_ORG_ID" \
VERCEL_PROJECT_ID="$VERCEL_PROJECT_ID" \
./scripts/vercel-go-live.sh staging
```

Após a URL de preview, valide: login, `dashboard.stagingTenantStatus`, RBAC, catalog guard, headers noindex/no-store e logs sem segredos.

## 5. Domínio e produção — ainda bloqueados

O domínio planejado para o aplicativo é `https://sfppedidos.app`, com `https://www.sfppedidos.app` como origem opcional. O domínio raiz já foi informado pelo proprietário, mas ainda não foi associado a um projeto Vercel verificável nesta sessão. A disponibilidade de compra no Vercel retornou indisponível, o que é compatível com um domínio já registrado fora do Vercel.

No projeto Vercel correto, adicione primeiro `sfppedidos.app` e, se desejado, `www.sfppedidos.app` em **Settings → Domains**. Copie exclusivamente os registros exibidos por esse projeto. Não use records de outro deployment ou tutorial.

Antes de executar `./scripts/vercel-go-live.sh production`, obtenha: catálogo aprovado por SKU; contrato Cabral; backup/restore/rollback comprovados; providers configurados; `sfppedidos.app` adicionado ao projeto Vercel; records exatos do painel Vercel aplicados no DNS; TLS emitido; e aprovação final do payload de produção.

O script exige `CONFIRM_PRODUCTION_DEPLOY=SEAFOODS_PRODUCTION_APPROVED`, origem HTTPS, allowlist e tenant operacional. Essa confirmação impede publicação acidental, mas não substitui os gates operacionais.

> Para domínio apex e subdomínio, copie apenas os registros mostrados em **Vercel → Project → Settings → Domains**. Não use IP/CNAME de outro projeto ou tutorial.

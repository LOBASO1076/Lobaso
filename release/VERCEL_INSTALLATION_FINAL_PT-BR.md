# Instalação final do SFP-OS no Vercel

## 0. Escopo e regra de segurança

Este runbook instala o projeto local `seafoods-premium-saas` no Vercel e prepara o endereço público de pedidos:

```text
https://pedidos.sfppedidos.app
```

O endereço atualmente informado pelo proprietário,
`https://index2-seafoods-premium-producao-mo-phi.vercel.app/`, é um deployment existente de storefront. **Não substitua esse projeto automaticamente pelo SaaS**: primeiro confirme no painel Vercel se ele é o projeto correto. O Commerce Core/tRPC deste repositório pode ser um projeto diferente.

O processo abaixo não compra domínio, não altera DNS automaticamente, não envia campanhas e não habilita WhatsApp outbound. A publicação de produção só deve ocorrer depois de validar o projeto, catálogo, pagamento, estoque, logística, backup, OAuth e domínio.

---

## 1. Pré-requisitos

Você precisa ter:

1. Acesso à conta/equipe Vercel que administra o domínio `sfppedidos.app`.
2. O `team ID/slug` ou escopo da conta Vercel.
3. O `project ID/slug` do projeto que hospedará o SFP-OS.
4. Acesso ao DNS autoritativo do domínio `sfppedidos.app`.
5. O banco gerenciado e os secrets necessários configurados somente no Vercel.
6. O repositório local em `/home/ubuntu/seafoods-premium-saas` ou uma cópia segura dele.

O token Vercel deve ser criado com o menor escopo e menor validade possível. **Nunca coloque o token em arquivo, Git, CSV, HTML, `.env` versionado ou no chat.**

---

## 2. Preparar a máquina local

Execute em uma máquina segura, na raiz do projeto:

```bash
cd /home/ubuntu/seafoods-premium-saas

node --version
pnpm --version
corepack enable
pnpm install --frozen-lockfile

pnpm check
pnpm test
pnpm build
```

Resultado esperado: TypeScript aprovado, suíte aprovada e build concluído. O último ciclo validado deste projeto passou com **24 arquivos e 54 testes**.

Opcionalmente, valide o pacote de release:

```bash
python3 -m json.tool docs/SAAS_STATUS.json >/dev/null
unzip -t release/SEAFOODS_PREMIUM_GO_LIVE_CANDIDATE.zip
```

---

## 3. Autenticar na CLI Vercel sem expor o token

### Opção A — login interativo

```bash
npx --yes vercel@59.22.0 login
```

Escolha o método de login no navegador. Depois confirme:

```bash
npx --yes vercel@59.22.0 whoami
```

### Opção B — token temporário em memória do shell

Use apenas em uma sessão local segura:

```bash
read -r -s -p "VERCEL_TOKEN: " VERCEL_TOKEN
printf '\n'
export VERCEL_TOKEN

npx --yes vercel@59.22.0 whoami --token="$VERCEL_TOKEN"
```

Não use `export VERCEL_TOKEN='...'` com o valor real em um script salvo ou no histórico do shell.

---

## 4. Descobrir a equipe e o projeto corretos

Liste as equipes/projetos acessíveis:

```bash
npx --yes vercel@59.22.0 teams ls --token="$VERCEL_TOKEN"
npx --yes vercel@59.22.0 project ls --scope="<TEAM_ID_OU_SLUG>" --token="$VERCEL_TOKEN"
```

Se o comando `teams ls` não estiver disponível na versão instalada, use o dashboard Vercel e copie o **Team ID/slug** em **Settings → General**. O projeto local ainda não possui `.vercel/project.json`, então não há vínculo confiável salvo nesta sessão.

Defina os identificadores somente depois de conferir visualmente que o projeto corresponde ao SFP-OS:

```bash
export VERCEL_ORG_ID='<team-id-ou-slug-correto>'
export VERCEL_PROJECT_ID='<project-id-ou-slug-do-sfp-os>'
```

Faça o vínculo não interativo:

```bash
cd /home/ubuntu/seafoods-premium-saas

npx --yes vercel@59.22.0 link \
  --yes \
  --team="$VERCEL_ORG_ID" \
  --project="$VERCEL_PROJECT_ID" \
  --token="$VERCEL_TOKEN"

cat .vercel/project.json
```

O arquivo `.vercel/project.json` deve conter `orgId` e `projectId` do projeto aprovado. Se o projeto exibido for o storefront existente e a intenção for manter storefront e SaaS separados, pare e escolha o projeto correto antes de continuar.

---

## 5. Configurar variáveis no Vercel

> **Incidente da VPS:** antes de usar Production, execute [`INCIDENT_ROTATION_VERCEL.md`](./INCIDENT_ROTATION_VERCEL.md). Revogue no provedor de origem e substitua no Vercel qualquer credencial que esteve na VPS/n8n/Z-API antiga. O runtime bloqueia a inicialização de produção quando encontra variáveis preenchidas com prefixo `N8N_`, `ZAPI_` ou `Z_API_`.

Liste apenas nomes/ambientes, sem imprimir valores:

```bash
npx --yes vercel@59.22.0 env ls \
  --scope="$VERCEL_ORG_ID" \
  --token="$VERCEL_TOKEN"
```

### Variáveis base do SFP-OS

Configure no painel Vercel em **Settings → Environment Variables** ou com `vercel env add`:

```text
DATABASE_URL
JWT_SECRET
VITE_APP_ID
OAUTH_SERVER_URL
VITE_OAUTH_PORTAL_URL
OWNER_OPEN_ID
OWNER_NAME
BUILT_IN_FORGE_API_URL
BUILT_IN_FORGE_API_KEY
VITE_FRONTEND_FORGE_API_URL
VITE_FRONTEND_FORGE_API_KEY
```

Os valores de banco, autenticação e Forge são secrets do ambiente. O prefixo `VITE_` só deve ser usado para valores que podem ser públicos; nunca coloque uma chave privada em `VITE_*`.

### Staging/Preview

Para o primeiro deploy, configure no ambiente **Preview**:

```text
APP_RELEASE_CHANNEL=staging
APP_TENANT_SLUG=seafoods-premium-staging
APP_ALLOW_PERSISTENCE=true
APP_ALLOW_CABRAL_REPRESENTATION=true
APP_CANONICAL_ORIGIN=https://<url-de-preview-gerada-pelo-vercel>
APP_ALLOWED_ORIGINS=https://<url-de-preview-gerada-pelo-vercel>
VITE_RELEASE_CHANNEL=staging
VITE_PUBLIC_ORIGIN=https://<url-de-preview-gerada-pelo-vercel>
```

A persistência de staging é técnica. O guard do servidor mantém fixtures `TESTE-*` e referências `RED/blocked` fora do catálogo vendável.

### WhatsApp Business — somente quando as credenciais estiverem aprovadas

O endpoint existente deste projeto usa estes nomes:

```text
WHATSAPP_ENABLED=true
WHATSAPP_VERIFY_TOKEN=<token-aleatório, somente servidor>
WHATSAPP_APP_SECRET=<App Secret da Meta, somente servidor>
WHATSAPP_PHONE_NUMBER_ID=<Phone Number ID da Meta>
```

O callback é:

```text
https://pedidos.sfppedidos.app/api/webhooks/whatsapp
```

O endpoint atual recebe/verifica webhook, valida HMAC e cria inbox/notificações. **Outbound permanece desabilitado no código atual.** Não use `WHATSAPP_API_TOKEN` nem o exemplo Next.js do briefing como se fossem parte deste projeto Express/tRPC sem uma implementação adicional aprovada.

Para inserir um secret sem escrever o valor no comando:

```bash
printf '%s' "$WHATSAPP_VERIFY_TOKEN" | \
  npx --yes vercel@59.22.0 env add WHATSAPP_VERIFY_TOKEN preview \
  --scope="$VERCEL_ORG_ID" --token="$VERCEL_TOKEN"
```

Confirme na ajuda da CLI e no painel o ambiente escolhido antes de repetir para cada secret:

```bash
npx --yes vercel@59.22.0 env add --help
```

---

## 6. Deploy de preview/staging

O script versionado do projeto faz `link`, `pull`, `build` e `deploy --prebuilt`:

```bash
cd /home/ubuntu/seafoods-premium-saas
chmod +x scripts/vercel-go-live.sh

VERCEL_TOKEN="$VERCEL_TOKEN" \
VERCEL_ORG_ID="$VERCEL_ORG_ID" \
VERCEL_PROJECT_ID="$VERCEL_PROJECT_ID" \
./scripts/vercel-go-live.sh preview
```

Alternativamente, usando a sequência direta da CLI:

```bash
npx --yes vercel@59.22.0 pull \
  --yes \
  --environment=preview \
  --scope="$VERCEL_ORG_ID" \
  --token="$VERCEL_TOKEN"

npx --yes vercel@59.22.0 build \
  --scope="$VERCEL_ORG_ID" \
  --token="$VERCEL_TOKEN"

PREVIEW_URL=$(npx --yes vercel@59.22.0 deploy \
  --prebuilt \
  --scope="$VERCEL_ORG_ID" \
  --token="$VERCEL_TOKEN")

echo "$PREVIEW_URL"
```

Valide a preview antes de produção:

```bash
npx --yes vercel@59.22.0 curl / --deployment "$PREVIEW_URL" \
  --token="$VERCEL_TOKEN"
npx --yes vercel@59.22.0 logs --deployment "$PREVIEW_URL" --level error \
  --token="$VERCEL_TOKEN"
```

Também valide manualmente:

```text
/
/checkout
/api/trpc/dashboard.stagingTenantStatus
/api/webhooks/whatsapp
```

O ambiente deve apresentar `noindex`, `no-store`, tenant staging, catálogo bloqueado e nenhuma credencial no HTML ou bundle público.

---

## 7. Associar `pedidos.sfppedidos.app`

Com o diretório já vinculado ao projeto correto:

```bash
cd /home/ubuntu/seafoods-premium-saas

npx --yes vercel@59.22.0 domains ls \
  --scope="$VERCEL_ORG_ID" \
  --token="$VERCEL_TOKEN"

npx --yes vercel@59.22.0 domains add pedidos.sfppedidos.app \
  --scope="$VERCEL_ORG_ID" \
  --token="$VERCEL_TOKEN"

npx --yes vercel@59.22.0 domains inspect pedidos.sfppedidos.app \
  --scope="$VERCEL_ORG_ID" \
  --token="$VERCEL_TOKEN"
```

O `inspect` é a fonte da verdade para os registros. Não invente CNAME, A ou TXT.

### Se o DNS estiver fora do Vercel

1. Copie o record exato mostrado por `domains inspect`.
2. No provedor DNS do domínio, crie o record para o host `pedidos`.
3. Preserve MX, SPF, DKIM e DMARC existentes.
4. Aguarde propagação.
5. Execute novamente:

```bash
npx --yes vercel@59.22.0 domains inspect pedidos.sfppedidos.app \
  --scope="$VERCEL_ORG_ID" \
  --token="$VERCEL_TOKEN"

npx --yes vercel@59.22.0 certs ls \
  --scope="$VERCEL_ORG_ID" \
  --token="$VERCEL_TOKEN"
```

Não use o IP de outro deployment. Para subdomínio, o valor CNAME deve vir do projeto Vercel correto.

---

## 8. Produção — executar somente depois dos gates

Antes de habilitar produção, confirme todos estes pontos:

- O `.vercel/project.json` aponta para o projeto SFP-OS correto.
- A preview foi testada no fluxo catálogo → carrinho → checkout.
- O catálogo comercial real foi aprovado por SKU, custo, estoque, lote, validade, fornecedor, foto, impostos e logística.
- As referências `RED/blocked` não entram no checkout.
- Pagamento, entrega, estoque e backup/restore foram testados.
- `pedidos.sfppedidos.app` está verificado e com TLS emitido.
- OAuth, cookies, CORS e callback WhatsApp foram validados no domínio final.
- O proprietário aprovou explicitamente o payload de produção.

Configure no ambiente **Production**:

```text
APP_RELEASE_CHANNEL=production
APP_TENANT_SLUG=<tenant-operacional-aprovado>
APP_ALLOW_PERSISTENCE=true
APP_ALLOW_CABRAL_REPRESENTATION=true
APP_CANONICAL_ORIGIN=https://pedidos.sfppedidos.app
APP_ALLOWED_ORIGINS=https://pedidos.sfppedidos.app,https://www.sfppedidos.app
VITE_RELEASE_CHANNEL=production
VITE_PUBLIC_ORIGIN=https://pedidos.sfppedidos.app
```

Depois execute o gate explícito do script:

```bash
cd /home/ubuntu/seafoods-premium-saas

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

Verifique a produção:

```bash
curl -fsSIL https://pedidos.sfppedidos.app/
curl -fsS https://pedidos.sfppedidos.app/robots.txt

npx --yes vercel@59.22.0 logs \
  --environment=production \
  --level=error \
  --since=5m \
  --scope="$VERCEL_ORG_ID" \
  --token="$VERCEL_TOKEN"
```

O link público esperado, após o domínio estar verificado, será:

```text
https://pedidos.sfppedidos.app/
```

---

## 9. Rollback

Se a produção apresentar erro, não apague deployment nem banco. Primeiro liste e inspecione os deployments:

```bash
npx --yes vercel@59.22.0 ls "$VERCEL_PROJECT_ID" \
  --scope="$VERCEL_ORG_ID" \
  --token="$VERCEL_TOKEN"
```

Promova somente um deployment anterior conhecido e validado, pelo painel Vercel ou pelo comando de promoção disponível na versão instalada. Depois valide novamente `/`, `/checkout`, OAuth, CORS e logs.

Se o problema for apenas funcional, desabilite a flag de feature no ambiente antes de fazer rollback de código. Não execute `rm -rf`, `DROP TABLE`, reset destrutivo ou alteração de DNS como tentativa de correção.

---

## 10. Estado conhecido desta sessão

O código local do SFP-OS está validado com TypeScript, 55 testes e build de produção. O pacote importável também contém `vercel.json`, `api/[...path].ts`, `package.json` com Node `22.x`, `.nvmrc` local com Node 22.18.0 e `.vercelignore`. O projeto local ainda não possui vínculo `.vercel/project.json`. O conector Vercel está autenticado, mas a sessão atual não listou equipes/projetos e o dashboard web abriu a tela de login. Portanto, ainda faltam exatamente:

1. login/acesso à conta Vercel correta;
2. `VERCEL_ORG_ID`/team e `VERCEL_PROJECT_ID` do projeto alvo;
3. associação de `pedidos.sfppedidos.app` ao projeto;
4. records DNS exibidos pelo Vercel e validação TLS;
5. aprovação dos gates comerciais e de produção.

Referências oficiais consultadas:

- [Project linking via Vercel CLI](https://vercel.com/docs/cli/project-linking)
- [Deploying a project from the CLI](https://vercel.com/docs/projects/deploy-from-cli)
- [Setting up a custom domain](https://vercel.com/docs/domains/set-up-custom-domain)

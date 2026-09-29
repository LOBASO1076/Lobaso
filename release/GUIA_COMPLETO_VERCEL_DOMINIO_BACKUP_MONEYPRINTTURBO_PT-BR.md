# SFP-OS — Guia Completo de Instalação, Domínio, Backup e Expansão

## 1. Pacote

Use o arquivo `SFP_OS_AUTO_DEPLOY_2026-09-21.zip`. Ele contém o projeto completo, a configuração Vercel, backend serverless, frontend, testes, documentação e scripts. Não contém credenciais reais, `.env`, `node_modules`, `dist` ou `.git`.

## 2. Importação sem CLI

1. Acesse `https://vercel.com/new` com a conta/equipe correta.
2. Escolha **file** ou arraste o ZIP para a área de upload.
3. Se a interface exigir pasta, extraia o ZIP e arraste a pasta que contém diretamente `package.json`, `vercel.json`, `api/`, `client/`, `server/` e `drizzle/`.
4. Selecione o projeto SFP-OS existente ou crie um projeto novo com nome `sfp-os`.
5. Use root directory `./`.
6. Framework: `Other`.
7. Install Command: `pnpm install --frozen-lockfile`.
8. Build Command: `pnpm build`.
9. Node.js: `22.x`.
10. Faça primeiro **Preview**, nunca Production.

## 3. Variáveis do Preview

No painel: **Project → Settings → Environment Variables → Preview → Add**.

Cadastre os valores reais somente no painel Vercel, nunca no ZIP ou no chat.

| Variável | Preview | Tipo | Observação |
|---|---:|---|---|
| `DATABASE_URL` | Sim | Secret | Banco MySQL/TiDB compatível; nunca frontend |
| `JWT_SECRET` | Sim | Secret | Novo valor aleatório; não reutilizar VPS |
| `VITE_APP_ID` | Sim | Público de build | App ID OAuth, não é token secreto |
| `OAUTH_SERVER_URL` | Sim | Configuração | `https://api.manus.im` quando aplicável |
| `VITE_OAUTH_PORTAL_URL` | Sim | Público de build | URL oficial do portal OAuth |
| `OWNER_OPEN_ID` | Sim | Configuração | Identidade operacional aprovada |
| `OWNER_NAME` | Sim | Configuração | Nome operacional |
| `BUILT_IN_FORGE_API_URL` | Sim | Secret/configuração | URL do serviço interno |
| `BUILT_IN_FORGE_API_KEY` | Sim | Secret | Somente server-side |
| `VITE_FRONTEND_FORGE_API_URL` | Somente se exigida | Público | Não usar para segredos |
| `VITE_FRONTEND_FORGE_API_KEY` | Somente se exigida | Sensível | Evitar; todo segredo deve permanecer server-side |
| `VITE_ANALYTICS_ENDPOINT` | Opcional | Público | Pode ficar vazio |
| `VITE_ANALYTICS_WEBSITE_ID` | Opcional | Público | Pode ficar vazio |
| `APP_RELEASE_CHANNEL` | Sim | Configuração | `staging` |
| `APP_ALLOW_PERSISTENCE` | Sim | Configuração | `true` apenas se o banco de Preview estiver validado |
| `APP_ALLOW_CABRAL_REPRESENTATION` | Sim | Configuração | `true` somente para testes internos aprovados |
| `APP_TENANT_SLUG` | Sim | Configuração | `seafoods-premium-staging` |
| `APP_CANONICAL_ORIGIN` | Sim | Configuração | URL Preview exata da Vercel |
| `APP_ALLOWED_ORIGINS` | Sim | Configuração | Mesma URL Preview, separada por vírgulas |
| `VITE_RELEASE_CHANNEL` | Sim | Público de build | `staging` |
| `VITE_PUBLIC_ORIGIN` | Sim | Público de build | URL Preview exata |
| `WHATSAPP_ENABLED` | Sim | Configuração | `false` até validar Meta oficial |

### Não cadastrar neste release

`AI_GATEWAY_API_KEY` não é consumida pelo código atual. Não a adicione esperando ativar IA. O release usa `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY` server-side.

Não cadastrar tokens `N8N_*`, `ZAPI_*`, `Z_API_*`, credenciais da VPS comprometida, chaves antigas, tokens de telefones ou segredos em qualquer variável `VITE_*`.

## 4. Redeploy do Preview

Depois de salvar as variáveis:

1. Acesse **Deployments**.
2. Escolha **Redeploy** no deployment de Preview.
3. Aguarde `Ready`.
4. Abra os Build Logs e confirme que não há erro TypeScript, módulo ausente ou falha de build.
5. Teste a URL Preview antes de associar o domínio.

## 5. Domínio `pedidos.sfppedidos.app`

1. Abra **Project → Settings → Domains**.
2. Clique em **Add Domain**.
3. Digite `pedidos.sfppedidos.app`.
4. Copie exatamente os registros DNS mostrados pela Vercel.
5. No Registro.br, crie somente os registros exibidos pela Vercel.
6. Não invente IP, A record ou CNAME de outro projeto.
7. Preserve MX, SPF, DKIM e DMARC existentes.
8. Aguarde a verificação e o certificado HTTPS.
9. Após HTTPS estar ativo, no ambiente de Production use:

```text
APP_RELEASE_CHANNEL=production
APP_TENANT_SLUG=seafoods-premium
APP_CANONICAL_ORIGIN=https://pedidos.sfppedidos.app
APP_ALLOWED_ORIGINS=https://pedidos.sfppedidos.app,https://www.sfppedidos.app
VITE_RELEASE_CHANNEL=production
VITE_PUBLIC_ORIGIN=https://pedidos.sfppedidos.app
```

Não mude o canal para Production apenas porque o domínio resolveu. Primeiro conclua os gates de catálogo, banco, credenciais, rollback e smoke test.

## 6. Domínio por CLI opcional

Somente em máquina confiável e com token mantido em memória:

```bash
read -r -s -p "VERCEL_TOKEN: " VERCEL_TOKEN; printf '\n'
export VERCEL_TOKEN
export VERCEL_ORG_ID='<team-id-ou-slug-confirmado>'
export VERCEL_PROJECT_ID='<project-id-ou-slug-confirmado>'
npx --yes vercel@59.22.0 whoami --token="$VERCEL_TOKEN"
npx --yes vercel@59.22.0 domains add pedidos.sfppedidos.app --scope="$VERCEL_ORG_ID" --token="$VERCEL_TOKEN"
npx --yes vercel@59.22.0 domains inspect pedidos.sfppedidos.app --scope="$VERCEL_ORG_ID" --token="$VERCEL_TOKEN"
```

Nunca coloque o token em arquivo, ZIP, commit, script persistido ou captura de tela.

## 7. Backup e rollback

Antes de cada alteração importante:

1. Salve o deployment atual como referência no painel.
2. Baixe o ZIP validado e guarde-o offline.
3. Guarde o checksum SHA-256 junto do ZIP.
4. Exporte ou registre os nomes e ambientes das variáveis, sem registrar os valores.
5. Registre o domínio, DNS exibido e status TLS.
6. Faça um checkpoint do banco conforme o provedor.
7. Após cada mudança, crie um novo deployment de Preview.
8. Só promova o artefato aprovado; se falhar, use **Rollback** para o deployment anterior.

Não faça backup de secrets em texto puro. Para credenciais, o backup correto é revogar e gerar novos valores no provedor.

## 8. Smoke test mínimo

- Homepage carrega.
- Login nativo funciona.
- `/api` sem sessão não expõe dados.
- Rotas n8n/Z-API/VPS permanecem bloqueadas.
- Catálogo e carrinho funcionam.
- Referências RED permanecem bloqueadas.
- Dashboard exige autenticação e RBAC.
- Nenhuma chave aparece no HTML, JavaScript ou logs.
- Banco salva e recupera apenas dados do tenant correto.
- Rollback do deployment anterior está disponível.

## 9. Reutilização em `/moneyprintturbo`

Não copie o banco, secrets ou tenant de Seafoods Premium diretamente. A expansão correta é criar um segundo tenant/projeto isolado, reutilizando somente componentes genéricos:

- autenticação e RBAC;
- layout do dashboard;
- ledger de eventos;
- mecanismo de catálogo;
- funil de leads;
- relatórios de receita;
- trilha de auditoria;
- bloqueios Zero Trust.

O SaaS de artesanato precisa de `APP_TENANT_SLUG` próprio, banco/schema isolado, domínio próprio, catálogo próprio e variáveis próprias. O mesmo deployment só deve atender múltiplos tenants depois de uma revisão explícita de isolamento.

## 10. Funil orgânico sem investimento inicial

Comece com conteúdo orgânico: bastidores, preparo do Seafood Boil, comparação de calibres, prova social autorizada, perguntas e respostas e chamadas para pedido pelo domínio oficial. Registre leads manualmente no painel, sem importar listas ou enviar mensagens em massa. Use WhatsApp apenas para atendimento iniciado pelo cliente ou comunicação autorizada.

A primeira meta é validar conversão e operação; anúncios pagos, automações externas e integrações adicionais devem ser considerados somente após receita real e aprovação do proprietário.

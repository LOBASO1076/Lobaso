# Rotação de credenciais após incidente da VPS

**Escopo:** Seafoods Premium OS / SFP-OS no Vercel.  
**Objetivo:** revogar credenciais da VPS/n8n/Z-API antiga, substituir secrets no ambiente Vercel e manter a aplicação disponível somente com integrações aprovadas.  
**Regra:** não cole segredos em Git, arquivos, chat, CSV, HTML, histórico de shell ou screenshots.

## 1. Antes da rotação

Use uma sessão local confiável e obtenha o projeto e a equipe corretos no Vercel. O conector desta sessão está autenticado, porém ainda não revelou equipe ou projeto; por isso esta rotação **não foi executada automaticamente**.

```bash
cd /home/ubuntu/seafoods-premium-saas
read -r -s -p "VERCEL_TOKEN: " VERCEL_TOKEN; printf '\n'
export VERCEL_TOKEN
export VERCEL_ORG_ID='<team-id-ou-slug>'
export VERCEL_PROJECT_ID='<project-id-ou-slug>'

npx --yes vercel@59.22.0 whoami --token="$VERCEL_TOKEN"
npx --yes vercel@59.22.0 project ls --scope="$VERCEL_ORG_ID" --token="$VERCEL_TOKEN"
npx --yes vercel@59.22.0 env ls --scope="$VERCEL_ORG_ID" --token="$VERCEL_TOKEN"
```

Confirme visualmente que o projeto é o **SFP-OS**, e não o storefront independente. Registre apenas os nomes de variáveis e os ambientes; não imprima valores.

## 2. Revogar primeiro no provedor de origem

A substituição no Vercel não revoga uma credencial que o atacante já possui. Execute a revogação no provedor antes de alterar o runtime.

| Origem potencialmente afetada | Ação de revogação | Ação no Vercel |
|---|---|---|
| VPS/n8n/Z-API | Desabilitar workflows, remover webhooks e revogar tokens/sessões da VPS comprometida. | Remover quaisquer variáveis `N8N_*`, `ZAPI_*` e `Z_API_*`; o SFP-OS recusará startup em produção se alguma permanecer ativa. |
| Banco gerenciado | Criar novo usuário/senha ou rotacionar a DSN no provedor de banco. | Substituir `DATABASE_URL` em Preview e Production e redeployar. |
| Sessão/OAuth do app | Gerar um segredo JWT novo e invalidar sessões existentes. | Substituir `JWT_SECRET` em Preview e Production. |
| Meta WhatsApp | Rotacionar App Secret/verify token e revisar o número/webhook no app Meta. | Substituir `WHATSAPP_APP_SECRET` e `WHATSAPP_VERIFY_TOKEN`; manter `WHATSAPP_ENABLED=false` até handshake validado. |
| Outbox futura | Revogar endpoint/secret comprometidos. | Substituir `OUTBOX_SIGNING_SECRET`; manter `OUTBOX_PROVIDER` vazio enquanto não houver adapter aprovado. |
| IA externa | Revogar chaves de OpenAI/Gemini/AI Gateway que tenham passado pela VPS. | O repositório atual usa `BUILT_IN_FORGE_API_KEY`; não use chaves externas sem implementação server-side aprovada. Remova variáveis antigas não usadas. |

`NEXTAUTH_SECRET`, `AI_GATEWAY_API_KEY` e `WHATSAPP_PERMANENT_TOKEN` não são consumidas pelo código atual. Se existirem no Vercel por herança da VPS, remova-as após confirmar que nenhum outro projeto depende delas.

## 3. Rotacionar no Vercel sem exibir valores

Para cada segredo ativo, remova a versão antiga e insira a nova por stdin. Repita para `preview` e `production` após a validação do ambiente correspondente.

```bash
# Exemplo: Production. A remoção pede confirmação; --yes evita interação adicional.
npx --yes vercel@59.22.0 env rm JWT_SECRET production \
  --scope="$VERCEL_ORG_ID" --token="$VERCEL_TOKEN" --yes

read -r -s -p "Novo JWT_SECRET: " JWT_SECRET; printf '\n'
printf '%s' "$JWT_SECRET" | npx --yes vercel@59.22.0 env add JWT_SECRET production \
  --scope="$VERCEL_ORG_ID" --token="$VERCEL_TOKEN"
unset JWT_SECRET
```

Execute a mesma sequência para `DATABASE_URL`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` e `OUTBOX_SIGNING_SECRET` quando aplicável. Para gerar um JWT novo localmente sem salvá-lo:

```bash
openssl rand -base64 48
```

Nunca use um valor em argumento de linha de comando; use a entrada oculta ou stdin.

## 4. Remover herança da VPS

No painel Vercel ou por CLI, remova cada variável legada confirmada no projeto alvo:

```bash
npx --yes vercel@59.22.0 env rm N8N_WEBHOOK_URL production \
  --scope="$VERCEL_ORG_ID" --token="$VERCEL_TOKEN" --yes
npx --yes vercel@59.22.0 env rm ZAPI_TOKEN production \
  --scope="$VERCEL_ORG_ID" --token="$VERCEL_TOKEN" --yes
```

Use os nomes que aparecerem no `env ls`. Não invente ou remova nomes de outro projeto. O runtime rejeita a inicialização de produção se detectar qualquer variável preenchida com prefixo `N8N_`, `ZAPI_` ou `Z_API_`.

## 5. Configuração mínima do SFP-OS

| Ambiente | Valores de canal | Persistência |
|---|---|---|
| Preview | `APP_RELEASE_CHANNEL=staging`, tenant staging, origem da preview | Técnica; catálogo `RED/blocked` continua fora de venda. |
| Production | `APP_RELEASE_CHANNEL=production`, `APP_CANONICAL_ORIGIN=https://pedidos.sfppedidos.app`, `APP_ALLOWED_ORIGINS` contendo o host final, tenant aprovado | Somente após catálogo, estoque, pagamento, backup/restore e domínio aprovados. |

Em produção, o bootstrap falha fechado se faltarem `DATABASE_URL`, `JWT_SECRET`, `APP_TENANT_SLUG`, `APP_CANONICAL_ORIGIN` ou `APP_ALLOWED_ORIGINS`, se o canal não for `production`, ou se o host final não estiver na allowlist.

## 6. Redeploy e validação

Depois de cada ambiente receber as novas variáveis, gere um deployment novo. Variáveis alteradas não atualizam funções já em execução.

```bash
cd /home/ubuntu/seafoods-premium-saas
VERCEL_TOKEN="$VERCEL_TOKEN" \
VERCEL_ORG_ID="$VERCEL_ORG_ID" \
VERCEL_PROJECT_ID="$VERCEL_PROJECT_ID" \
./scripts/vercel-go-live.sh preview
```

Na preview, verifique:

```bash
curl -fsSIL https://<preview-host>/
curl -sS -o /dev/null -w '%{http_code}\n' https://<preview-host>/api/n8n/webhook
curl -sS -o /dev/null -w '%{http_code}\n' -X POST https://<preview-host>/api/scheduled/outbox
```

Os resultados esperados são **410** para rota n8n e **401** para outbox sem token. Confirme também que `/api/webhooks/whatsapp` continua em 503 até que a Meta esteja reconfigurada e validada.

## 7. Encerramento do incidente

Preserve os logs relevantes e registre a hora de revogação, o provedor e o responsável — sem incluir o valor de nenhum segredo. Revogue sessões persistentes ao trocar `JWT_SECRET`. Revise membros, deploy hooks, integrações, tokens pessoais e permissões da equipe Vercel. Não responda ao atacante, não acesse a VPS comprometida e não bloqueie clientes legítimos apenas por serem novos.

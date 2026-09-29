# Sea System ERP / SFP-OS — API

## Convenção

A API usa tRPC sob `/api/trpc`. Inputs passam por Zod, o backend é autoridade comercial e o tenant jamais é aceito do frontend como fonte de verdade. O tenant público é resolvido por `APP_TENANT_SLUG` no runtime; acesso privado exige `tenantMemberships` para o usuário autenticado.

| Procedimento | Tipo | Proteção | Escopo |
|---|---|---|---|
| `commerce.catalog` | query | pública | Catálogo ativo do tenant configurado; retorna fixture demo sem tenant/catálogo real. |
| `commerce.funnelEvent` | mutation | pública | Só persiste se o tenant está configurado; evento sem tenant retorna demo. |
| `commerce.createOrder` | mutation | pública | Rate limit persistido; total recalculado no servidor; só persiste para tenant e catálogo real. |
| `commerce.getOrder` | query | protegida | Pedido filtrado pelo tenant do membership. |
| `commerce.controlTower` | query | protegida | Sinais filtrados pelo tenant; fallback demo sem membership. |
| `commerce.updatePayment` | mutation | protegida | Atualiza pagamento e eventos somente no tenant do membership. |
| `commerce.updateDelivery` | mutation | protegida | Atualiza entrega e eventos somente no tenant do membership. |
| `inventory.createMovement` | mutation | protegida | Verifica tenant e pertencimento do produto antes de gravar. |
| `dashboard.summary` | query | pública | Mostra dados do tenant somente a usuário membro; sem isso retorna demo. |
| `dashboard.salesAnalytics` | query | pública | Resolve tenant pela sessão e agrega vendas por período, canal, status e valor mínimo. Sem tenant retorna vazio, sem métricas fictícias. |
| `dashboard.growthTargets` | query | pública | Metas B2C/B2B e funil reverso como referência fornecida; não retorna faturamento realizado. |
| `dashboard.b2bGrowthTargets` | query | pública | Meta B2B diária, ticket, conversões, CPL/CAC implícitos e gate de margem de contribuição. |
| `dashboard.cabralPolicy` | query | pública | Regras operacionais B2B Cabral sem tabela/custo: +18%, desconto ≤10%, pacote 5–6 kg, comissão 2–5% e separação de valor representado. |
| `dashboard.cabralMetrics` | protegida | protected | Agrega termos Cabral por tenant: valor representado, margem reconhecida, margem projetada e comissões; staging mostra fixture explicitamente rotulada sem criar venda. |
| `dashboard.catalogReconciliation` | query | protegida | Exige membership; retorna backlog tenant-scoped e campos pendentes de SKU, custo, estoque e foto. |
| `dashboard.stagingTenantStatus` | query | pública | Retorna somente configuração booleana do tenant, canal e persistência; não expõe catálogo ou dados privados. |
| `whatsapp.status` | query | pública | Expõe somente o estado técnico da integração, sem credenciais. |
| `whatsapp.inbox` | query | pública | Retorna mensagens do tenant apenas para usuário com membership; sem membership retorna vazio. |
| `whatsapp.notifications` | query | pública | Retorna notificações internas não lidas do tenant apenas para usuário com membership. |
| `commerce.recordCabralCommission` | mutation | protegida | Owner/admin/operator registram comissão recebida dentro do limite esperado no tenant. |

A mutation legada `sales.create` está bloqueada para impedir que `totalCents` seja aceito como preço/total autoritativo de frontend. A criação de venda deve ocorrer via `commerce.createOrder`.

## WhatsApp Business Cloud API

O endpoint `GET /api/webhooks/whatsapp` executa a verificação da Meta: compara `hub.verify_token` ao segredo server-side e, se o ambiente estiver explicitamente habilitado, devolve `hub.challenge`. O endpoint `POST /api/webhooks/whatsapp` recebe bytes JSON puros, valida o HMAC-SHA256 de `X-Hub-Signature-256`, limita o payload a 3 MB, confere o `phone_number_id` e deduplica pelo par `tenantId + messageId`. A implementação considera lotes e redeliveries previstos pela documentação oficial.[1][2]

Mensagens criam registros de inbox e notificações internas de oportunidade; elas **não** registram receita, baixam estoque ou geram resposta automática. A venda é derivada somente quando um pagamento de pedido autoritativo é confirmado, criando uma `sales` vinculada ao `orderId` e uma notificação de venda confirmada. Isso mantém WhatsApp como canal de captura e acompanhamento, não como autoridade financeira.

O endpoint permanece desligado em staging sem `WHATSAPP_ENABLED=true`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_PHONE_NUMBER_ID`, tenant, catálogo e permissão de persistência explicitamente aprovados. Nenhum token, secret ou URL de provider chega ao frontend.

## Analytics diário

`dashboard.salesAnalytics` aceita `periodDays` de 7, 14 ou 30 dias, `channel`, `status` e `minTotalCents`. Todas as cláusulas incluem o tenant resolvido no servidor antes das agregações. A resposta contém receita, pedidos, ticket médio, margem, série diária e mix de canais; a UI mostra estado vazio em vez de preencher os gráficos com demonstração.

## Reconciliação de catálogo e B2B

`dashboard.catalogReconciliation` só retorna dados a um usuário com membership no tenant configurado. Aceita filtro server-side de `channel=all|b2b` e `trafficLight=all|red`. A fila `catalogReconciliationItems` retém referências comerciais com status `blocked` e semáforo RED/YELLOW/GREEN até haver SKU, custo posto, estoque, lote, validade, fornecedor, foto, impostos, logística e evidência aprovados; ela não ativa produtos e não altera `products`. `dashboard.b2bGrowthTargets` calcula quatro pedidos diários para a meta de R$ 5.000/dia com ticket assumido de R$ 1.250. As taxas de conversão, CPL, CAC e orçamento são premissas de planejamento e o endpoint declara bloqueio de escala enquanto não houver margem de contribuição comprovada.

## Pedido e idempotência

Itens aceitam `productId` e `quantity`. O servidor busca SKU, unidade e `sellPriceCents` do tenant, grava snapshots e recalcula o subtotal. `discountCents` é validado; frete não é inventado. Se o catálogo conectado for somente `TESTE-*`, a resposta é `mode=demo` e `persisted=false`. Para `channel=b2b`, são obrigatórios CNPJ, pacote de 5–6 kg que coincida com a soma real dos itens, desconto de 0–10% e comissão de 2–5%. A persistência B2B Cabral exige a flag adicional `APP_ALLOW_CABRAL_REPRESENTATION=true`; o valor representado não é convertido em receita Seafoods.

## Outbox e job gerenciado

`POST /api/scheduled/outbox` existe como callback serverless. Ele autentica a identidade da plataforma com `sdk.authenticateRequest`, aceita apenas `isCron=true`, resolve o tenant pelo `taskUid` registrado em `scheduledJobs` e processa somente eventos desse tenant. O adapter webhook, quando explicitamente configurado, exige URL HTTPS, segredo HMAC, timeout e `Idempotency-Key`; a outbox faz claim condicional, auditoria e backoff exponencial até cinco tentativas. Não há cron ativo nem provider configurado nesta entrega. Um job só pode ser criado depois de deploy do release candidate e autorização explícita.

## Segurança HTTP

O servidor aplica CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` e CORS por allowlist em `APP_ALLOWED_ORIGINS`. O ambiente precisa validar OAuth, CORS e assets no domínio efetivamente publicado antes de ativar DNS.

## Referências

[1]: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint/ "Meta — Create a webhook endpoint"
[2]: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages "Meta — Messages webhook reference"

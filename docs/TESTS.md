# Sea System ERP / SFP-OS — Testes e evidências

## Resultado verificado

`pnpm check`, `pnpm test` e `pnpm build` passaram após a contenção do incidente, incluindo bloqueio de rotas n8n/Z-API, rate limit fail-closed no webhook, anti-replay temporal, política 401/403, entrypoint serverless Vercel e runbook de rotação Vercel. A suíte concluiu **24 arquivos e 55 testes**. O build Vite/Node passou; há apenas um aviso não bloqueante de bundle JavaScript maior que 500 kB, a ser tratado por code splitting em um ciclo futuro.

| Arquivo | Cobertura verificada |
|---|---|
| `server/auth.logout.test.ts` | Limpeza do cookie de sessão. |
| `server/dashboard.test.ts` | Contrato das métricas e modo demonstrativo público. |
| `server/whatsapp.test.ts` | Cenários do simulador. |
| `server/commerce.test.ts` | Catálogo autoritativo, carrinho de nove itens, idempotency key e bloqueio da Control Tower sem membership. |
| `server/tenantSafety.test.ts` | Demo sem tenant, ausência de tenant privado, funil sem escopo e outbox sem adapter. |
| `server/scheduledOutbox.test.ts` | Callback retorna 401 sem autenticação e 403 sem identidade cron autorizada. |
| `server/tenantAccess.test.ts` | RBAC de viewer/operator e assinatura HMAC determinística. |
| `server/outboxProcessor.test.ts` | Provider fake plugável, claim concorrente, publicação, retry/backoff, falha terminal e auditoria. |
| `server/stagingPolicy.test.ts` | Canal preview/staging e persistência comercial bloqueada por padrão. |
| `server/whatsappWebhook.test.ts` | HMAC Meta, classificação de intenção, status deferred e janela anti-replay temporal. |
| `server/runtimeSecurity.test.ts` | Bootstrap fail-closed para env legada n8n/Z-API e configuração de produção incompleta. |
| `server/securityEvents.test.ts` | Ledger de segurança sem corpo, cookie, Authorization ou token; origem somente em hash. |
| `server/releaseDeliverables.test.ts` | Plano 72h, demo, gráfico financeiro e runbook de rotação do incidente dentro do pacote de release. |
| `server/whatsappHttp.test.ts` | Endpoint retorna 503 quando desligado e devolve challenge somente com ativação/verify token válidos. |
| `server/salesAnalytics.test.ts` | Analytics retorna vazio sem tenant, sem preencher gráfico com dados fictícios. |
| `server/growthTargets.test.ts` | Soma canônica de R$ 1.828,54 e engenharia reversa B2C como referência, não realizado. |
| `server/b2bGrowthTargets.test.ts` | Meta B2B de quatro pedidos/dia, 54 leads/dia, CAC implícito e bloqueio sem margem de contribuição. |
| `server/catalogReconciliation.test.ts` | Nenhuma referência de catálogo é exposta sem tenant operacional autorizado. |
| `server/stagingTenantStatus.test.ts` | Status público de staging confirma tenant configurado sem habilitar persistência comercial. |
| `server/b2bPolicy.test.ts` | +18%, desconto máximo de 10%, comissão 2–5%, pacote 5–6 kg e separação de receita reconhecida/potencial. |
| `server/b2bCommerce.test.ts` | CNPJ B2B, peso autoritativo do pacote, termos Cabral retornados em demo e bloqueios de entrada inválida. |
| `server/cabralMetrics.test.ts` | Simulação Cabral em staging, fixture rotulada, valor representado segregado, comissão pendente e receita própria reconhecida em zero. |
| `server/releaseArtifacts.test.ts` | Manifesto de 151 referências RED e presença dos códigos `CABRAL-IMP-123` a `CABRAL-IMP-151`. |

O catálogo canônico de demonstração soma **R$ 1.828,54** para nove itens. O request de carrinho não envia preço unitário; o servidor continua sendo a autoridade no modo live.

## Verificações de ambiente

A inspeção SQL confirmou banco conectado, 24 tabelas, `whatsappMessages`, `dashboardNotifications`, `sales.orderId`, `catalogReconciliationItems` e `b2bCabralTerms`, além de `scheduledJobs`, `outboxEvents.status` com estado `processing`, `outboxEvents.lastError` e escopo `tenantId`. As migrations `0002` a `0012` foram aplicadas. O tenant `seafoods-premium-staging` tem owner configurado e 151 itens de reconciliação bloqueados RED: 17 B2C, 13 B2B e 121 documentais sem canal. Nenhum é produto ativo; SKU, custo posto, estoque, lote, validade, foto, impostos e logística permanecem pendentes. O endpoint leve confirmou `configured=true`, `releaseChannel=staging` e `persistenceEnabled=false`.

Na URL pública de preview, foram confirmados CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, robots e sitemap. `https://pedidos.sfppedidos.app` recebeu CORS com credenciais; uma origem não autorizada não recebeu cabeçalhos de permissão. O callback de outbox anônimo retornou 401; `/api/n8n/webhook` e `/api/z-api/webhook` retornaram 410 sem alcançar o parser ou o tRPC. O POST WhatsApp desligado retornou 503. Localmente, `X-Frame-Options: DENY` também foi confirmado; publicamente, `frame-ancestors 'none'` do CSP fornece a proteção anti-frame.

Capturas revisaram o dashboard em **Visão demonstrativa** com filtros avançados, analytics vazio honesto, Control Tower B2C/B2B e painel WhatsApp deferred em desktop/mobile; o checkout também foi validado em desktop/mobile com aviso de fixture, frete a confirmar e jornada progressiva.

Staging também foi preparado para responder `X-Robots-Tag: noindex, nofollow, noarchive`, `Cache-Control: no-store`, robots com `Disallow: /` e sitemap sem URLs. `APP_ALLOW_CABRAL_REPRESENTATION=true` e `APP_ALLOW_PERSISTENCE=true` ativam a simulação e o armazenamento técnico do staging; o guard server-side continua impedindo `TESTE-*` e referências `RED/blocked` de se tornarem catálogo comercial. O domínio oficial não é anunciado nessa camada.

## Lacunas de aceite de produção

Ainda faltam teste de aceitação com catálogo real/tenant real, isolamento A/B contra dados comerciais, idempotência concorrente com provider, baixa transacional de estoque, pagamento, entrega, handshake/POST reais do webhook Meta, job efetivamente agendado, acessibilidade, backup, restore e rollback. Essas lacunas são gates externos ou de integração e não foram mascaradas por fixtures.

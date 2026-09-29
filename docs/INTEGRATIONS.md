# Sea System ERP / SFP-OS — Integrações

## WhatsApp Business Cloud API

**Status: ENDPOINT IMPLEMENTADO, CONEXÃO EXTERNA DESLIGADA.** A aplicação agora disponibiliza `GET` e `POST /api/webhooks/whatsapp`. O GET executa o handshake de verificação da Meta; o POST usa raw body, valida `X-Hub-Signature-256` com HMAC-SHA256, aceita até 3 MB, confere o `phone_number_id`, resolve o tenant no servidor e deduplica `tenantId + messageId`. Mensagens recebidas persistem em `whatsappMessages` e geram `dashboardNotifications` internas.[1]

A integração só pode ser ativada com `WHATSAPP_ENABLED=true`, `APP_ALLOW_PERSISTENCE=true`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_PHONE_NUMBER_ID`, tenant configurado e host HTTPS de staging. Como esses insumos não foram fornecidos, o endpoint de preview retorna 503 e não recebe eventos. Não existe token, app Meta, número, callback inscrito, mensagem real enviada ou credencial no código.

O painel exibe status da conexão, URL do callback, notificações internas e inbox do tenant. Mensagens são oportunidades, **não vendas automáticas**: preço, estoque, frete, pedido e pagamento não são inferidos de texto. Uma notificação de “Nova venda confirmada” só é criada quando `commerce.updatePayment` confirma um pagamento do pedido autoritativo; a venda derivada é única por `tenantId + orderId`.

O componente `WhatsAppSimulator.tsx` é preservado como UX de treinamento. Ele continua sem ler, enviar ou armazenar mensagens reais.

## Manus OAuth

**Status: IMPLEMENTADO NO SCAFFOLD.** O callback é atendido pelo runtime do projeto. A aplicação usa `ctx.user` e o cookie de sessão do template. Configuração detalhada de client ID e URLs deve permanecer nas variáveis do runtime.

## LLM e IA

**Status: INFRAESTRUTURA DISPONÍVEL; USO DE IA NO FLUXO ATUAL NÃO VERIFICADO.** O scaffold contém helpers server-side para LLM, mas o simulador WhatsApp usa regras e fixtures determinísticas. Truth Mode, Financial Analysis e Hormozi são playbooks de conteúdo no router e na interface; não são agentes MCP externos.

## Pagamentos

**Status: CORE PREPARADO; PROVIDER NÃO IMPLEMENTADO.** O Commerce Core possui entidade e transição de pagamento, porém não há Stripe, gateway PIX, cartão ou conciliação configurados. A confirmação depende de fluxo operacional autorizado; é essa confirmação que deriva a venda contabilizada.

## CRM e analytics

**Status: ANALYTICS INTERNO IMPLEMENTADO; CRM EXTERNO NÃO IMPLEMENTADO.** `dashboard.salesAnalytics` calcula receita, pedidos, ticket médio, margem, série diária e mix por canal no servidor. Os filtros são período (7/14/30 dias), canal, status e valor mínimo, todos depois do escopo de tenant. Sem tenant/vendas reais a interface mostra estado vazio, não métricas fictícias. Não existe connector CRM verificado.

## Meta Ads e Google Ads

**Status: PLAYBOOK PREPARADO; CONTAS E CONECTORES DESLIGADOS.** O plano B2B propõe Instant Forms e conversas no WhatsApp para Meta, além de Search por intenção no Google. As duas plataformas permanecem sem conta conectada, orçamento, campanha, criativo, pixel, conversão ou gasto publicados. O playbook exige aprovação de catálogo, claims, consentimento, margem de contribuição, teto de CAC e revisão humana antes da publicação.

Claims de certificação, entrega no mesmo dia, desconto por volume e disponibilidade não podem ser usados até existir evidência e política operacional aprovada. O documento [`B2B_ACQUISITION_PLAYBOOK.md`](./B2B_ACQUISITION_PLAYBOOK.md) contém a estrutura, scripts e checklist de lançamento.

## Armazenamento de imagens

**Status: INFRAESTRUTURA S3 DISPONÍVEL NO TEMPLATE; ASSOCIAÇÃO DO ACERVO SFP A PRODUTOS NÃO VERIFICADA.** O handoff preserva Acervo SFP, Fotos Reais, ProductPoster, Offer Hero e PromoFlyer como módulos congelados, sem alterar a implementação aprovada.

## Automações

**Status: OUTBOX PREPARADA; JOB EXTERNO NÃO AGENDADO.** Não há cron, worker persistente ou tarefa agendada ativa. O callback serverless `/api/scheduled/outbox` aceita somente cron identity da plataforma e taskUid registrado. O dashboard usa polling de leitura a cada 30 segundos para inbox/notificações, sem disparar chamadas externas.

## Referências

[1]: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint/ "Meta — Create a webhook endpoint"

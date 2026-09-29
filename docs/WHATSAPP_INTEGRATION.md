# Sea System ERP / SFP-OS — Integração WhatsApp Business Cloud API

## Estado deste corte

O endpoint oficial está implementado em `/api/webhooks/whatsapp`, mas permanece **desligado**. Não há token, número, app Meta, callback publicado ou mensagem de saída configurados. A aplicação apenas está pronta para receber mensagens em staging depois de um tenant, catálogo, secrets e autorização específicos.

## Fluxo protegido

```text
Meta Cloud API → POST assinado → validação HMAC/raw body → tenant configurado
  → deduplicação tenantId + messageId → whatsappMessages → dashboardNotifications
  → operador cria/confirmar pedido → pagamento confirmado → sales + notificação de venda
```

Uma conversa WhatsApp nunca é autoridade para preço, estoque, frete, pagamento ou receita. Ela entra como inbox e oportunidade. Receita só nasce de um pedido com preços do servidor e confirmação de pagamento.

## Pré-requisitos antes de ativar staging

| Item | Necessidade |
|---|---|
| App Meta | App criado com o caso de uso WhatsApp e permissões aplicáveis. |
| WhatsApp Business Account | Conta e número de teste vinculados ao app. |
| Token | Token de system user armazenado somente no runtime quando for necessário enviar mensagens; não é exigido para receber no endpoint atual. |
| Callback HTTPS | Host de staging com TLS válido, nunca URL local ou certificado autoassinado. |
| Verify token | String aleatória exclusiva em `WHATSAPP_VERIFY_TOKEN`, registrada também no painel Meta. |
| App secret | `WHATSAPP_APP_SECRET` armazenado exclusivamente como secret server-side. |
| Phone number ID | `WHATSAPP_PHONE_NUMBER_ID` do número de staging. |
| Tenant | `APP_TENANT_SLUG` e membership de operador/admin criados no ambiente isolado. |
| Persistência | `APP_ALLOW_PERSISTENCE=true` somente após o checklist de staging; sem dados pessoais de produção. |

## Configuração controlada

Definir `WHATSAPP_ENABLED=true` apenas depois de preencher os três secrets/identificadores e ativar o ambiente de staging. Na configuração Meta, usar o callback `https://<host-staging>/api/webhooks/whatsapp`, fornecer o mesmo verify token e assinar o campo `messages`. O GET só retorna o challenge quando a configuração está completa; o POST só aceita payload autenticado por `X-Hub-Signature-256`.

A Meta pode reenviar notificações e enviar atualizações em lote; a aplicação trata duplicatas por mensagem e tenant. Responder 200 apenas depois do registro da mensagem/notificação; respostas inválidas retornam 4xx e não acessam dados comerciais. O limite do endpoint é 3 MB conforme o teto declarado pela Meta.[1]

## Notificações e analytics

O dashboard consulta inbox e notificações a cada 30 segundos por tRPC. O polling é somente de leitura do banco do próprio tenant e não executa chamadas externas. A série de analytics usa vendas derivadas de pagamento confirmado, com filtros de período, canal, status e valor mínimo; sem tenant ou vendas, a tela fica vazia de forma explícita.

## Não implementado deliberadamente

Envio de mensagens, templates, campanhas, resposta automática, sincronização de histórico, consentimento/opt-out de marketing, mídia, CRM externo, pagamentos WhatsApp e mTLS de borda não foram habilitados. Para ativá-los, avaliar privacidade/LGPD, janela de atendimento, templates aprovados, provider e novos testes. O app não deve criar resposta ou cobrança automática sem autorização futura.

## Referências

[1]: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint/ "Meta — Create a webhook endpoint"

# Referência externa — WhatsApp Business Platform Webhooks

Fonte oficial consultada em 27/09/2026:
https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint/

Pontos usados na implementação:

- O endpoint precisa aceitar GET e POST em servidor público com TLS/SSL válido.
- A verificação GET usa `hub.mode=subscribe`, `hub.challenge` e `hub.verify_token`; o token recebido deve ser comparado com o segredo do servidor e, se válido, o endpoint responde HTTP 200 com o challenge.
- POSTs trazem JSON e o header `X-Hub-Signature-256: sha256=...`; a assinatura é HMAC-SHA256 calculada sobre o corpo bruto com o App Secret.
- POST inválido deve receber resposta 4xx; válido deve receber 200.
- Meta pode agrupar até 1000 updates por POST e pode reenviar eventos por até 7 dias; deduplicação é obrigatória.
- Meta não fornece API para consultar histórico de webhooks; os payloads relevantes precisam ser capturados conforme a necessidade do negócio.
- mTLS é uma camada opcional de segurança adicional.

Aplicação no Seafoods Premium OS:

- Exceção pública mínima somente para `/api/webhooks/whatsapp`.
- Corpo bruto limitado e validado antes de parsear JSON.
- HMAC e token com comparação resistente a timing.
- IDs de telefone explícitos por configuração.
- Mensagens duplicadas ignoradas por chave única.
- Mensagens não textuais são registradas como bloqueadas sem baixar ou armazenar arquivo.
- Webhooks legados, n8n e Z-API permanecem bloqueados.

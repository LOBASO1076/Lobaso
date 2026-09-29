# Operação integrada — WhatsApp → pedido → cozinha → logística → financeiro

**Projeto:** Seafoods Premium OS  
**Data:** 28/09/2026  
**Modelo:** custo-zero no núcleo; integrações externas somente quando houver contrato, credenciais e homologação.

## O que está funcionando no SaaS

1. **Webhook oficial Meta WhatsApp** em `/api/webhooks/whatsapp`.
2. Verificação GET por `hub.verify_token` e `hub.challenge`.
3. Verificação POST por `X-Hub-Signature-256` usando HMAC-SHA256.
4. Deduplicação por `tenantId + messageId`.
5. Validação de idade do evento; mensagens antigas ou com relógio inválido são descartadas.
6. Somente mensagens de texto entram no inbox. Imagens, documentos, áudio, vídeo e demais tipos são registrados como bloqueados sem download, execução ou armazenamento de bytes.
7. Mensagem recebida vira **oportunidade**, nunca receita automática.
8. A **Central Operacional** em `/operacao` permite ao operador selecionar a conversa, escolher itens do catálogo, definir pagamento e logística e criar o pedido.
9. O pedido é recalculado no servidor, grava cliente, itens, pagamento pendente, entrega pendente, eventos de domínio, outbox e auditoria.
10. O pedido guarda o `whatsappMessageId` de origem.
11. Pedidos com SKU `BOIL-*` respeitam o limite de **10 pedidos não cancelados por tenant no dia comercial de Brasília**. Ao atingir a capacidade, o sistema orienta o próximo dia.

## Fluxo operacional recomendado

```text
WhatsApp Meta
  → webhook autenticado
  → inbox e notificação
  → operador revisa conversa
  → seleciona SKU/quantidade reais
  → pedido provisório
  → pagamento confirmado
  → cozinha prepara
  → logística cotada/confirmada
  → entrega rastreada
  → baixa e auditoria
```

A aprovação humana é deliberada: uma mensagem como “quero camarão” não contém SKU, quantidade, endereço ou confirmação de pagamento suficientes para criar uma venda correta.

## Cozinha, financeiro e logística

- **Financeiro:** novo pedido começa com pagamento `pending`; venda reconhecida só nasce após `confirmed`.
- **Cozinha:** o status do pedido é a fonte operacional (`new`, `confirming`, `confirmed`, `preparing`, `shipped`, `delivered`). A cozinha deve iniciar preparo após confirmação do pagamento e disponibilidade.
- **Logística:** cada pedido cria uma entrega pendente; o operador pode escolher `uber_direct`, `99_corp`, `99_food`, `manual` ou `pickup`.
- **Código e seguro:** a entrega deve manter o número do pedido como referência, o responsável/courier, custo, status e o código/link de rastreamento quando o provedor devolver esses dados. O núcleo atual não inventa código nem confirma entrega sem evento ou ação do operador.

## Uber Direct e 99

Os adaptadores estão em modo **pronto/configurado, mas sem chamadas outbound automáticas**. Isso evita contratar uma corrida, gerar custo ou compartilhar endereço sem confirmação explícita.

### Uber Direct

A documentação oficial consultada descreve:

- `POST /v1/eats/deliveries/orders` para criar uma entrega;
- OAuth 2.0 com escopo `eats.deliveries`;
- `external_order_id`, itens, retirada, destino e verificação de retirada/entrega;
- resposta com `order_id` e `order_tracking_url`;
- possível exigência de aprovação escrita da Uber.

Fonte oficial: <https://developer.uber.com/docs/deliveries/direct/api/v1/post-eats-deliveries-orders>

### 99Food

A plataforma aberta oficial informa API de pedidos, sandbox, certificação, depuração, teste/aceitação e autorização do serviço.

Fonte oficial: <https://developer-food.99app.com/>

## Configuração server-side do WhatsApp

Nunca colocar segredos no React, no navegador, em `client/public`, em mensagem de chat ou em commit.

```env
WHATSAPP_ENABLED=true
APP_ALLOW_PERSISTENCE=true
WHATSAPP_VERIFY_TOKEN=<token longo escolhido no servidor>
WHATSAPP_APP_SECRET=<App Secret da Meta>
WHATSAPP_PHONE_NUMBER_IDS=<id1,id2>
```

Depois de publicar o projeto, registrar na Meta:

- **Callback URL:** `https://SEU_DOMINIO/api/webhooks/whatsapp`
- **Verify token:** exatamente o valor de `WHATSAPP_VERIFY_TOKEN`
- **Campo inscrito:** `messages`

O callback não deve ser aberto para n8n, Z-API ou endpoints legados. O gateway preserva esses caminhos como bloqueados.

## Segurança contra documentos, malware, vírus e invasores

- O webhook só aceita corpo JSON bruto de até 256 KB.
- A assinatura é validada antes do parse e antes de qualquer persistência.
- Tipos não textuais não são baixados, armazenados nem encaminhados.
- URLs dentro de mensagens textuais são neutralizadas (`hxxp://` e `www[.]`) para revisão humana sem autoabertura.
- Identificadores de telefone, mensagem e tenant são validados no servidor.
- O evento é deduplicado dentro de transação.
- A origem externa não recebe sessão SaaS.
- A resposta outbound automática do WhatsApp permanece desligada.
- Rotas legadas n8n/Z-API continuam retornando bloqueio.
- O sistema mantém notificação e auditoria para investigação.

## Checklist de lançamento

- [ ] Cadastrar e verificar o app Meta Business.
- [ ] Configurar os cinco envs server-side acima.
- [ ] Executar o GET de verificação da Meta.
- [ ] Enviar uma mensagem de texto de teste e confirmar que ela aparece em `/operacao`.
- [ ] Confirmar manualmente um pedido com produto e quantidade reais.
- [ ] Confirmar pagamento antes de preparar.
- [ ] Testar entrega manual primeiro; somente depois homologar Uber/99.
- [ ] Não habilitar chamadas outbound de courier sem revisar custo, endereço, janela, seguro e confirmação operacional.

## Referências do negócio

- WhatsApp operacional: **(61) 99955-0179**
- Instagram: **@seafoodspremium**
- Atendimento: Brasília e entorno
- Capacidade comercial informada: **10 Boils/dia**, com próximo dia quando a agenda fechar
- Site público consultado: <https://seafoods-premium-brasilia.sfpsobalo.chatgpt.site/#contato>

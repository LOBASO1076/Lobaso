# Sea System ERP / SFP-OS — Arquitetura de produto

## Estratégia

A Seafoods Premium é o **case zero** e laboratório de validação, não o limite do produto. O Sea System ERP / SFP-OS deve servir operações B2C, B2B e Systems com infraestrutura compartilhada quando isso for seguro. O objetivo é primeiro operar uma empresa real; depois provar resultado, gerar case, criar demo fictícia, padronizar onboarding e só então escalar tenants e monetização SaaS.

## Separação de camadas

| Camada | Conteúdo | Estado |
|---|---|---|
| Core reutilizável | Commerce, CRM, estoque, financeiro, logística, marketing, BI, segurança e automação | Commerce/CRM/estoque/eventos em implementação inicial; demais módulos planejados |
| Configuração do tenant | Marca, catálogo, preço, regras, origens, canais, fornecedores e receitas | `tenants.settingsJson` preparado; configuração comercial real não carregada |
| Dados do tenant | Usuários, produtos, clientes, pedidos, estoque, pagamentos, entrega, eventos e auditoria | `tenantId` e índices aplicados ao Commerce Core |
| Integrações | WhatsApp, pagamento, logística, CRM, IA, MCP e marketing | Fronteiras/adapter/outbox preparados; integrações externas não ativadas |

## Multi-tenant realizado neste corte

`tenants` e `tenantMemberships` foram criados. `APP_TENANT_SLUG` resolve o tenant da superfície pública no servidor; `resolveTenantForUser` exige membership para leitura e transição privada. O RBAC permite leitura ao papel `viewer` e restringe pagamento, entrega e estoque a `owner`, `admin` ou `operator`. Catálogo, pedidos, clientes, pagamentos, entregas, Control Tower, dashboard, funil e outbox aplicam filtro de tenant. O cliente não escolhe tenant por payload. SKU e chave de idempotência foram modelados no escopo do tenant.

O isolamento ainda não está certificado para múltiplas empresas com dados reais: faltam dados A/B de staging, teste de leitura/escrita negativa contra o banco, policy de troca de tenant, tela de administração, `tenant_settings` tipado e migração das tabelas legadas remanescentes. Billing, planos, trial, upgrade e downgrade permanecem deliberadamente fora deste corte.

## Demo comercial

A demo deve usar exclusivamente dados fictícios. O SFP-OS já entra em modo demonstrativo sem tenant e sem catálogo comercial. O catálogo `TESTE-*` existe apenas para testar a jornada e nunca deve ser apresentado como estoque, preço ou cliente real. A demo futura poderá mostrar ERP, CRM, B2B, B2C, estoque, compras, financeiro, logística, marketing, Control Tower, MCP e automação sem expor Seafoods Premium.

## Aquisição, SEO e receita

O core registra caminho futuro `source → campaign → lead → customer → order → revenue → repeat_purchase`. A preparação de domínio canônico favorece páginas B2C de produto/categoria/receita/pedido, B2B de fornecimento/cotação/pedido e Systems de ERP/CRM/automação. Métrica norteadora é receita e recompra, não somente tráfego. Nenhum tráfego pago deve ser escalado antes de tracking e conversão confiáveis.

## Ordem de escala

A ordem é: operar Seafoods; provar pedido, pagamento, entrega e CRM; transformar em case; criar demo fictícia; vender os primeiros clientes; padronizar onboarding; concluir isolamento tenant; e só então lançar planos e billing. Essa sequência evita construir ERP genérico sem uso ou produto preso a um único case.

# Sea System ERP / SFP-OS — Banco de dados

## Fonte de verdade

O banco MySQL/TiDB gerenciado é a fonte de verdade para operações reais. Frontend, localStorage, cookies, WhatsApp, planilhas, IA e MCP não são autoridade para preço, estoque, pedido, pagamento, frete, margem ou status. O frontend envia intenção; a API valida e grava apenas no servidor.

## Núcleo e escopo

| Domínio | Tabelas | Regra de isolamento |
|---|---|---|
| Identidade | `users`, `tenants`, `tenantMemberships` | Usuário global; acesso privado exige membership no tenant configurado. |
| Catálogo/estoque | `products`, `inventoryMovements` | Produtos e movimentos carregam `tenantId`; SKU é único por tenant. |
| Reconciliação de catálogo | `catalogReconciliationItems` | Referências B2C/B2B/documentais permanecem RED e bloqueadas até SKU, custo posto, estoque, lote, validade, fornecedor, foto, impostos, logística e evidência serem aprovados. |
| CRM/Commerce | `customers`, `orders`, `orderItems` | Cliente e pedido são localizados pelo tenant antes de qualquer leitura ou escrita. |
| Financeiro/logística | `payments`, `deliveries`, `sales` | Venda é derivada da confirmação de pagamento e vinculada a `orderId`; não é criada pelo frontend ou mensagem. |
| Representação B2B | `b2bCabralTerms` | Valor de tabela, +18%, desconto, margem adicional, comissão e valor representado ficam separados; representado não é receita própria Seafoods. |
| WhatsApp/painel | `whatsappMessages`, `dashboardNotifications` | Mensagens são únicas por tenant + messageId; oportunidades e vendas confirmadas geram notificações internas. |
| Eventos | `domainEvents`, `outboxEvents`, `auditEvents`, `idempotencyKeys`, `funnelEvents`, `scheduledJobs` | Eventos, outbox, auditoria, idempotência e jobs possuem escopo de tenant. |
| Proteção | `rateLimitEvents` | Janela de limite de taxa persistida, sem memória de processo. |

As colunas `tenantId` permanecem inicialmente anuláveis para preservar linhas legadas e fixtures existentes. Registros operacionais novos do Commerce Core são gravados com tenant obrigatório. Antes de converter colunas para `NOT NULL`, uma migração de dados autorizada deve associar apenas registros comerciais reais a um tenant; fixtures não devem ser promovidas silenciosamente.

## Migrations aplicadas

| Migration | Conteúdo | Estado |
|---|---|---|
| `0002_clear_xorn.sql` | Commerce Core | Aplicada |
| `0003_eminent_reaper.sql` | `tenants` e `tenantMemberships` | Aplicada |
| `0004_useful_changeling.sql` | `rateLimitEvents` | Aplicada |
| `0005_magical_robin_chapel.sql` | tenantId e índices de escopo | Aplicada |
| `0006_perfect_big_bertha.sql` | SKU único por tenant | Aplicada |
| `0007_outstanding_impossible_man.sql` | `scheduledJobs`, estado `processing` e `lastError` de outbox | Aplicada |
| `0008_ancient_namora.sql` | `whatsappMessages` e `dashboardNotifications` | Aplicada |
| `0009_brave_kitty_pryde.sql` | `sales.orderId` e unicidade por tenant/pedido | Aplicada |
| `0010_amusing_quasar.sql` | `catalogReconciliationItems` e índices de revisão por tenant | Aplicada |
| `0011_daffy_the_professor.sql` | `b2bCabralTerms`, status e índices de termos por pedido | Aplicada |
| `0012_narrow_proemial_gods.sql` | Intake, semáforo RED/YELLOW/GREEN, lote, validade, foto candidata, impostos e logística | Aplicada |

A inspeção SQL do ciclo confirmou conexão e 24 tabelas, incluindo Commerce Core, tenants, rate limiting, `scheduledJobs`, `whatsappMessages`, `dashboardNotifications`, `catalogReconciliationItems` e `b2bCabralTerms`. A outbox suporta os estados `pending`, `processing`, `published` e `failed`, com `lastError` para auditoria de retry. O catálogo persistido contém apenas `TESTE-01` a `TESTE-09`; ele não é disponibilidade comercial nem autorização de venda. O backlog do tenant staging contém 151 referências `RED/blocked`; 121 vêm do DOCX e não possuem canal atribuído. Nenhuma linha é um produto publicado.

## Integridade operacional

`commerce.createOrder` usa transação, recalcula itens pelo catálogo do tenant e cria cliente, pedido, itens, pagamento pendente, entrega pendente, evento de domínio, outbox, auditoria e idempotência. Uma mesma chave é única por tenant + escopo + chave. O frete sem cotação é `NULL` e o estado é `to_confirm`.

## Próxima evolução segura

Criar tenant e membership reais em staging, associar catálogo autorizado ao tenant, executar pedido de aceitação, provar idempotência, então adicionar foreign keys e migrar `tenantId` para obrigatório de forma gradual. A baixa de estoque deve acontecer em uma transação auditável somente na transição de negócio aprovada; ela não está implementada ainda.

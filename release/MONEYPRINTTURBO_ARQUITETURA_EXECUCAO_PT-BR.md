# MoneyPrintTurbo — Arquitetura e Execução Isolada

## Decisão executiva

O `/moneyprintturbo` deve começar como **um projeto Vercel separado, com banco separado, secrets separados e tenant próprio**. Não deve compartilhar o banco de Seafoods Premium no lançamento inicial.

Essa escolha reduz o risco de vazamento entre operações, facilita rollback e permite validar o produto sem alterar o funil de vendas já protegido da Seafoods Premium. A reutilização deve ser por código-base revisado, não por banco, credenciais ou dados.

> **Objetivo de negócio:** colocar uma primeira oferta vendável no ar com segurança e validar receita. Nenhuma arquitetura garante receita imediata; a receita depende de oferta, aquisição, conversão, entrega e atendimento.

## Auditoria dos ZIPs recebidos

| Pacote | Decisão | Motivo |
|---|---|---|
| `SEAFOODS_PREMIUM_MASTER_RC1_VERCEL_POWERSHELL.zip` | Não usar como base de produção sem comparação adicional | Pacote RC recebido; pode conter convenções e configurações diferentes da base de segurança validada |
| `SFP_OS_AUTO_DEPLOY_2026-09-21(7).zip` | Base canônica do SFP-OS | Contém `vercel.json`, serverless, migrations, guards de tenant, testes e documentação de segurança |

Nenhum dos dois ZIPs deve ser publicado diretamente como MoneyPrintTurbo. O nome, tenant, domínio, banco, OAuth e secrets precisam ser próprios.

## Topologia recomendada

```text
Vercel Project: sfp-os
  └── Seafoods Premium
      ├── DB: seafoods-premium-production
      ├── tenant: seafoods-premium
      └── domínio: pedidos.sfppedidos.app

Vercel Project: moneyprintturbo
  └── MoneyPrintTurbo
      ├── DB: moneyprintturbo-production
      ├── tenant: moneyprintturbo
      └── domínio próprio a definir
```

Cada projeto deve possuir:

- `DATABASE_URL` próprio;
- `JWT_SECRET` próprio;
- OAuth/app ID próprio ou redirect URI separado;
- `APP_TENANT_SLUG` próprio;
- `APP_CANONICAL_ORIGIN` próprio;
- `APP_ALLOWED_ORIGINS` próprio;
- bucket/storage próprio, se habilitado;
- variáveis Preview e Production separadas;
- backups e rollback independentes.

## Fase 0 — Congelar a Seafoods Premium

Antes de iniciar o segundo produto:

1. Não alterar o banco Seafoods Premium para criar tabelas do MoneyPrintTurbo.
2. Guardar o ZIP canônico e seu SHA-256.
3. Registrar o deployment saudável atual.
4. Registrar apenas nomes e ambientes das variáveis, nunca valores.
5. Confirmar que o Preview e o rollback da Seafoods continuam disponíveis.
6. Manter n8n, Z-API, VPS antiga e credenciais herdadas bloqueados.

**Gate:** o SFP-OS continua restaurável sem depender do MoneyPrintTurbo.

## Fase 1 — Criar os recursos isolados

Na Vercel:

1. Criar um projeto novo chamado `moneyprintturbo`.
2. Não importar sobre `sfp-os` ou qualquer projeto Seafoods.
3. Usar Node.js 22.x.
4. Conectar o repositório ou fazer upload de uma cópia revisada do código.
5. Criar um banco gratuito separado para desenvolvimento/Preview.
6. Criar o banco de Production separado; não reutilizar `DATABASE_URL` da Seafoods.
7. Criar ou registrar um OAuth app com callback próprio.
8. Escolher um domínio próprio posteriormente; não usar `pedidos.sfppedidos.app` para dois produtos.

**Gate:** uma consulta de credenciais e uma consulta de dados no MoneyPrintTurbo não podem alcançar o banco Seafoods.

## Fase 2 — Isolar o código

Copiar somente componentes genéricos depois de revisão:

- autenticação e RBAC;
- layout de dashboard;
- trilha de auditoria;
- gateway Zero Trust;
- estrutura tRPC;
- componentes de catálogo;
- métricas genéricas;
- testes de tenant.

Não copiar:

- catálogo Seafoods;
- clientes Seafoods;
- pedidos Seafoods;
- tokens Meta/WhatsApp;
- secrets;
- fixtures comerciais Cabral;
- migrations aplicadas no banco Seafoods sem revisão.

Renomear e configurar:

```text
APP_RELEASE_CHANNEL=staging
APP_TENANT_SLUG=moneyprintturbo-staging
APP_ALLOW_PERSISTENCE=false
APP_ALLOW_CABRAL_REPRESENTATION=false
APP_CANONICAL_ORIGIN=https://<preview-moneyprintturbo>
APP_ALLOWED_ORIGINS=https://<preview-moneyprintturbo>
VITE_RELEASE_CHANNEL=staging
VITE_PUBLIC_ORIGIN=https://<preview-moneyprintturbo>
```

## Fase 3 — Modelo de dados

Mesmo com banco separado, manter `tenantId` nas tabelas de negócio como defesa em profundidade. Toda query de negócio deve receber o tenant do contexto autenticado e nunca do corpo do request.

Tabelas mínimas para o primeiro produto:

| Domínio | Tabelas iniciais |
|---|---|
| Identidade | `users`, `sessions`, `tenant_memberships` |
| Catálogo | `products`, `product_prices`, `product_media` |
| Leads | `leads`, `lead_events`, `consents` |
| Funil | `offers`, `funnels`, `funnel_events` |
| Vendas | `orders`, `order_items`, `order_status_events` |
| Auditoria | `audit_events`, `security_events` |
| Operação | `settings`, `feature_flags` |

Regras obrigatórias:

- chave composta ou índice por `tenantId` nas tabelas de negócio;
- filtros tenant-scoped em toda leitura e escrita;
- `tenantId` derivado da sessão/RBAC;
- proibição de aceitar `tenantId` livre do frontend;
- testes negativos tentando acessar tenant diferente;
- migrations versionadas e reversíveis;
- nenhum dado de Seafoods usado como fixture.

## Fase 4 — Primeiro produto vendável

Para gerar receita mais rapidamente, não começar com um SaaS enorme. Lançar uma oferta mínima:

1. Página pública com uma proposta clara.
2. Cadastro de lead.
3. Catálogo de uma única oferta principal.
4. Checkout ou solicitação de pedido sem cartão inicialmente.
5. Área do cliente ou confirmação manual.
6. Dashboard simples de leads, propostas e conversões.
7. Registro de origem do lead.
8. Exportação de pedidos e contatos autorizados.

Exemplo de primeira oferta: um pacote de presença digital, catálogo e funil para pequenos artesãos. O produto deve ser cobrado somente quando a forma de pagamento estiver implementada e validada; até lá, usar contratação manual e registro de proposta.

## Fase 5 — Segurança antes da receita

Checklist obrigatório:

- sessão nativa e RBAC ativos;
- CSRF/origin checks ativos;
- headers de segurança ativos;
- rate limit e auditoria sem armazenar payloads sensíveis;
- endpoints de admin protegidos;
- nenhum segredo no client bundle;
- webhook desativado até existir provedor oficial e assinatura verificada;
- n8n/Z-API/VPS antiga ausentes;
- logs sem tokens, cookies ou Authorization;
- backup e rollback testados;
- tentativa de acesso cross-tenant retorna 403/404 neutro.

## Fase 6 — Testes e gates

Antes de Production:

```bash
pnpm check
pnpm test
pnpm build
```

Testes adicionais obrigatórios:

- usuário do tenant A não lê produto do tenant B;
- usuário do tenant A não altera pedido do tenant B;
- administrador de A não administra B;
- request sem sessão retorna 401;
- origem não autorizada é rejeitada;
- payload grande ou suspeito é rejeitado;
- secrets não aparecem no bundle;
- build limpo funciona sem `.env` local;
- migration sobe em banco vazio;
- rollback restaura a versão anterior.

## Fase 7 — Backups

Para cada ambiente:

1. Backup do banco antes de migrations.
2. Retenção de pelo menos três pontos: anterior, atual e candidato.
3. ZIP imutável com checksum.
4. Registro do commit/deployment usado.
5. Registro dos nomes das variáveis e ambiente, sem valores.
6. Procedimento de restauração testado em banco separado.
7. Rollback de aplicação testado na Vercel.

Secrets não devem ser exportados para backup em texto. O backup correto de um secret é sua rotação controlada.

## Fase 8 — Funil orgânico de aquisição

Com custo zero:

1. Publicar conteúdo demonstrando uma dor específica do artesão.
2. Usar uma chamada única: “receba uma avaliação do seu catálogo/funil”.
3. Capturar consentimento e origem do lead.
4. Fazer diagnóstico manual em até 24 horas.
5. Apresentar uma oferta simples com escopo fechado.
6. Registrar proposta e conversão no painel.
7. Pedir depoimento somente após entrega autorizada.
8. Reinvestir parte do lucro em infraestrutura ou mídia apenas depois de vendas reais.

Não fazer disparo em massa, scraping, compra de listas ou automação de spam. O WhatsApp deve ser usado com consentimento e atendimento legítimo.

## Definition of Done

O MoneyPrintTurbo só pode ser chamado de pronto quando:

- existe projeto Vercel separado;
- existe banco separado;
- existe tenant separado;
- secrets são separados;
- migrations funcionam em banco vazio;
- testes cross-tenant passam;
- Preview está funcional;
- domínio próprio está validado;
- backup/restore foi testado;
- oferta inicial está publicada;
- primeiro lead é registrado sem tocar na Seafoods;
- rollback está documentado;
- Production só é ativada após revisão manual do proprietário.

## O que não fazer

- Não alterar `DATABASE_URL` da Seafoods para apontar para o MoneyPrintTurbo.
- Não criar `moneyprintturbo` como apenas um `APP_TENANT_SLUG` no mesmo banco no primeiro lançamento.
- Não copiar secrets ou dados reais.
- Não compartilhar o domínio de pedidos entre produtos.
- Não declarar receita antes de uma venda confirmada.
- Não ativar pagamentos, anúncios ou integrações externas sem implementação e aprovação próprias.

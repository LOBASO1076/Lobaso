# Sea System ERP / SFP-OS — Infraestrutura gerenciada e portável

## Decisão arquitetural

O Sea System ERP não depende de VPS, SSH permanente, PM2, Docker hospedado, banco instalado manualmente ou worker que permaneça ligado. A implementação é desenhada para hosting gerenciado, APIs server-side, banco gerenciado, storage gerenciado, autenticação, segredos de ambiente, jobs gerenciados, observabilidade e backup. A aplicação atual usa o ambiente WebDev com React, Express, tRPC, Drizzle e MySQL/TiDB gerenciado.

| Responsabilidade | Diretriz | Estado atual |
|---|---|---|
| Aplicação/API | Processo serverless/gerenciado e contratos tRPC | Implementado |
| Banco | MySQL/TiDB gerenciado como fonte de verdade | Implementado e inspecionado |
| Storage | Serviço gerenciado via adapter do scaffold | Preparado; não usado pelo checkout |
| Auth | Manus OAuth gerenciado | Implementado no scaffold |
| Segredos | Variáveis server-side do runtime | Implementado; sem segredo no repositório |
| Outbox | Banco + função acionada por job gerenciado | Adapter webhook HMAC, claim concorrente, retry/auditoria e job por `taskUid` preparados; não ativados |
| Jobs | HTTP cron gerenciado sob `/api/scheduled/*` | Arquitetura documentada; não publicado/não agendado |
| Backup | Exportação externa, checksum, restore e rollback | Pendente |
| Staging | Canal separado, noindex/no-store, CORS restrito e persistência opt-in | Preparado; não publicado |

## Portabilidade

A camada de negócio não deve depender do provedor. Application, database, storage, auth, integrations, jobs e secrets têm fronteiras distintas. `server/outboxAdapter.ts` contém uma fronteira webhook portátil com HMAC, URL HTTPS, `Idempotency-Key` e timeout server-side. `server/outbox.ts` faz claim condicional, evita entrega duplicada em invocações concorrentes, registra auditoria e usa backoff exponencial até cinco tentativas. Nenhuma integração externa é chamada até que provedor, credenciais e endpoint sejam aprovados.

## Resiliência

Pedidos persistentes não dependem de WhatsApp, IA, MCP, CRM, marketing ou provedor de pagamentos estarem disponíveis. Quando existir catálogo real, o pedido é salvo antes de o outbox preparar entregas futuras. A indisponibilidade externa deve deixar o pedido com estado correto e o evento pendente para reprocessamento, sem perda de dados.

## Domínio oficial — preparação sem publicação

O domínio canônico planejado é `https://seafoodspremium.com.br/`. A aplicação contém canonical, Open Graph, robots, sitemap e um contrato de rotas/planned origins em `shared/runtimeConfig.ts`. Os subdomínios `pedidos`, `prontos`, `natura`, `boil` e `b2b` são somente planejados. Nenhum DNS, Registro.br, redirect, domínio customizado ou subdomínio foi ativado.

Staging usa `APP_RELEASE_CHANNEL=staging`, `APP_ALLOW_PERSISTENCE=false`, `X-Robots-Tag: noindex, nofollow, noarchive`, `Cache-Control: no-store`, canonical relativo à própria origem e sitemap vazio. A política de persistência é opt-in: sem `APP_ALLOW_PERSISTENCE=true`, catálogo e pedidos ficam em demo mesmo que um tenant esteja configurado.

OAuth continua usando `window.location.origin` no frontend para callbacks, pois o domínio de execução não deve ser inferido pelo backend. Cookies continuam host-only; não foi definido `cookie domain` compartilhado.

## CORS e headers

O servidor configurou `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` e CSP. CORS só reflete origins listadas em `APP_ALLOWED_ORIGINS`, cujo default é o domínio oficial e `www`. Antes de deploy, validar a política no domínio efetivamente publicado para evitar bloquear OAuth, callbacks ou assets necessários.

## Custos e limite de escopo

Nenhuma nova infraestrutura paga foi adicionada. Não foram criados cron jobs, hosts reservados ou serviços externos. Antes de criar qualquer integração recorrente, avaliar se o banco, a API gerenciada e jobs gerenciados já atendem ao requisito. Billing, VPS e worker permanente ficam fora do caminho crítico.

## Próximo critério de aceite

Em staging publicado, registrar a `taskUid` em `scheduledJobs` para o tenant, criar um job gerenciado autenticado que escoe a outbox e registrar tentativa, resposta, retry e auditoria; depois executar o [runbook de backup](./BACKUP_RUNBOOK.md), checksum, restauração isolada e rollback documentado. Nada disso deve ser ativado na URL de preview.

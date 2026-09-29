# Sea System ERP / SFP-OS — Handoff técnico

O ponto de entrada é [`MASTER_DOCUMENTATION.md`](./MASTER_DOCUMENTATION.md). O conjunto abaixo distingue capacidade implementada, simulação segura, evidência verificada e gate externo; nenhum documento presume que preview é produção.

| Documento | Finalidade |
|---|---|
| [`SAAS_STATUS.json`](./SAAS_STATUS.json) | Estado de release candidate, banco verificado, simulados e pré-requisitos externos. |
| [`FORENSIC_REPORT.md`](./FORENSIC_REPORT.md) | Relatório do ciclo com escopo preservado, segurança, evidências e riscos residuais. |
| [`MASTER_DOCUMENTATION.md`](./MASTER_DOCUMENTATION.md) | Arquitetura ERP-first, fluxo comercial, isolamento tenant, domínio e gates de ativação. |
| [`PRODUCT_ARCHITECTURE.md`](./PRODUCT_ARCHITECTURE.md) | Holding, produto reutilizável, core/configuração/dados/integrações e escala SaaS. |
| [`INFRASTRUCTURE.md`](./INFRASTRUCTURE.md) | Hosting gerenciado sem VPS, portabilidade, outbox, jobs, domínio e CORS. |
| [`BACKUP_RUNBOOK.md`](./BACKUP_RUNBOOK.md) | Backup exportável, checksum, restore isolado e rollback antes de dados comerciais. |
| [`STAGING_RUNBOOK.md`](./STAGING_RUNBOOK.md) | Preparação de staging sem publicação, DNS, indexação ou persistência comercial acidental. |
| [`GO_LIVE_AUDIT_REPORT.md`](./GO_LIVE_AUDIT_REPORT.md) | Auditoria dos cinco gates de produção; estado atual NO-GO, evidências e condições exatas para nova validação. |
| [`INCIDENT_CONTAINMENT_2026-09-17.md`](./INCIDENT_CONTAINMENT_2026-09-17.md) | Contenção da VPS comprometida, bloqueio de integrações legadas, webhook Meta e lacunas de rotação externa. |
| [`WHATSAPP_INTEGRATION.md`](./WHATSAPP_INTEGRATION.md) | Endpoint Meta assinado, inbox, notificações, limites e processo de ativação controlada. |
| [`COMMERCIAL_REFERENCE.md`](./COMMERCIAL_REFERENCE.md) | Preços B2C/B2B, Boil, carrinho canônico e metas V3 como referência não publicada. |
| [`B2B_CABRAL_POLICY.md`](./B2B_CABRAL_POLICY.md) | Representação B2B Cabral, preço, comissão, reconhecimento de receita e gates de aprovação. |
| [`CATALOG_INTAKE_REPORT.md`](./CATALOG_INTAKE_REPORT.md) | Inventário do DOCX e mídias, classificação RED/YELLOW/GREEN e gates de promoção. |
| [`B2B_ACQUISITION_PLAYBOOK.md`](./B2B_ACQUISITION_PLAYBOOK.md) | Meta, Google Search, outbound, unit economics e KPIs B2B com gates de contribuição e claims. |
| [`DATABASE.md`](./DATABASE.md) | Schema, migrations, tenant isolation, fixtures e integridade. |
| [`API.md`](./API.md) | tRPC, checkout, idempotência, tenant server-side, rate limit e callback de outbox. |
| [`INTEGRATIONS.md`](./INTEGRATIONS.md) | Integrações existentes, simuladas e pendentes. |
| [`TESTS.md`](./TESTS.md) | Evidências automatizadas, inspeções HTTP/visuais e lacunas conscientes. |
| [`BACKLOG.md`](./BACKLOG.md) | Evolução priorizada. |
| [`ENVIRONMENT.example`](./ENVIRONMENT.example) | Nomes de variáveis sem valores secretos. |

O storefront Vercel informado pelo proprietário está em uso e não foi alterado. A preparação de `seafoodspremium.com.br` não publicou DNS, TLS, redirect nem subdomínio. Consultor, Seafood Boil, Simulador de WhatsApp, Hormozi Offer, Acervo SFP, Fotos Reais, ProductPoster, Offer Hero, PromoFlyer e a estrutura visual aprovada permanecem congelados.

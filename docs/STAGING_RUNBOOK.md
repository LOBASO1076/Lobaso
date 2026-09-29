# Sea System ERP / SFP-OS — Runbook de staging

## Objetivo

Preparar um ambiente de aceite técnico sem publicar o domínio oficial, alterar DNS, indexar páginas ou persistir pedidos comerciais por acidente. O staging deve validar build, autenticação, banco, isolamento, checkout demo, headers, rotas e jobs, mas não deve ser tratado como produção.

## Política padrão

| Controle | Staging autorizado |
|---|---|
| `APP_RELEASE_CHANNEL` | `staging` |
| `APP_ALLOW_PERSISTENCE` | `false` |
| `APP_CANONICAL_ORIGIN` | URL temporária/isolada do staging |
| `APP_ALLOWED_ORIGINS` | Somente a origem de staging necessária |
| `APP_TENANT_SLUG` | ausente até existir tenant de staging aprovado |
| `VITE_RELEASE_CHANNEL` | `staging` |
| `VITE_PUBLIC_ORIGIN` | URL de staging, não o domínio oficial |
| `OUTBOX_PROVIDER` | ausente |
| `OUTBOX_WEBHOOK_URL` | ausente |
| `OUTBOX_SIGNING_SECRET` | ausente |
| DNS/Registro.br | não tocar |
| robots/canonical | `noindex`, `nofollow`, `noarchive`; canonical relativo à origem de staging |

A persistência só pode ser habilitada com `APP_ALLOW_PERSISTENCE=true` depois de criar um tenant de staging, carregar um catálogo de teste não comercial, verificar membership e aprovar o teste de pedido. Mesmo nesse caso, o staging não recebe dados pessoais ou financeiros reais.

## Checklist de aceite técnico

Primeiro, publicar apenas o artefato em um host de staging autorizado e confirmar que a origem aparece na allowlist CORS. Depois, validar OAuth/login, logout, dashboard com rótulo de demonstração, checkout com fixtures, frete a confirmar, pedido não persistente, Control Tower protegida por membership, RBAC de viewer/operator, rate limit, `X-Robots-Tag`, CSP, `X-Frame-Options`/`frame-ancestors`, robots e sitemap vazio.

Em seguida, rodar `pnpm check`, `pnpm test` e `pnpm build`. Validar migrations no banco isolado e confirmar as tabelas `tenants`, `tenantMemberships`, `scheduledJobs`, `outboxEvents` e `rateLimitEvents`. Não conectar WhatsApp, pagamento, logística, CRM ou outbox externa. O callback `/api/scheduled/outbox` deve retornar 403 sem identidade cron e 409 sem job `taskUid` autorizado.

Por fim, registrar screenshots e respostas HTTP, manter a URL fora de campanhas e motores de busca, e guardar o resultado no handoff. A saída do staging é um release candidate aprovado tecnicamente; ela não autoriza DNS, produção, cobrança ou uso de catálogo real.

## Critério de promoção

Promover somente após receber catálogo comercial autorizado, criar tenant/membership em ambiente alvo, aprovar providers, configurar secrets server-side, executar backup/restore/rollback e receber autorização explícita para publicação. A promoção deve criar um novo checkpoint; não transformar a URL de staging em produção por mudança de variável informal.

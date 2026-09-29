# Relatório de contenção — incidente da VPS antiga

**Data:** 17 de setembro de 2026  
**Sistema:** Seafoods Premium OS / SFP-OS  
**Classificação:** incidente de credenciais e integrações legadas potencialmente comprometidas

## Situação conhecida

O proprietário informou que a VPS antiga foi comprometida e que terceiros podem ter acesso a dados do n8n/Z-API antigo. Não há evidência, nesta auditoria local, de que o código atual possua uma integração Z-API ou n8n ativa. Os conectores n8n encontrados na sessão estão desabilitados; não foi encontrado conector Z-API.

## Bloqueios aplicados no código

O servidor mantém o webhook oficial da Meta em `/api/webhooks/whatsapp`, antes do parser JSON, com verificação do `X-Hub-Signature-256` por HMAC timing-safe, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` e `WHATSAPP_PHONE_NUMBER_ID`. Assinatura inválida retorna HTTP 401; integração desabilitada retorna HTTP 503; o endpoint recebe somente payloads JSON dentro do limite configurado. Eventos fora da janela temporal são descartados e message IDs permanecem deduplicados por tenant.

Rotas com padrões de n8n, Z-API, `api/legacy` e `api/integrations/old` foram tombstonadas antes do parser JSON e retornam HTTP 410 sem alcançar tRPC ou operações de negócio. Nenhum handler antigo foi encontrado no inventário atual.

O bootstrap do processo rejeita a inicialização em produção quando variáveis ativas de integrações legadas n8n/Z-API são encontradas ou quando faltam `DATABASE_URL`, `JWT_SECRET`, tenant, origem canônica e allowlist de origem. As tentativas bloqueadas geram um ledger mínimo tenant-scoped com hash de origem, endpoint, método, request ID quando disponível, classificação e resultado; corpo, cookies, Authorization e secrets não são registrados. Alertas internos são deduplicados em uma janela de cinco minutos.

O endpoint interno de outbox retorna HTTP 401 sem autenticação válida e HTTP 403 quando a identidade autenticada não é uma tarefa cron autorizada. Procedimentos tRPC protegidos continuam retornando HTTP 401 sem sessão válida e HTTP 403 sem autorização suficiente.

A rota Meta agora usa rate limit persistente fail-closed: se o armazenamento de rate limit estiver indisponível, o webhook não processa o payload. HSTS é emitido no canal de produção; `X-Frame-Options: DENY`, CSP, `nosniff`, `no-store` em preview e `X-Robots-Tag` permanecem ativos. CORS fica restrito às origens oficiais `https://sfppedidos.app` e `https://pedidos.sfppedidos.app` por padrão.

## Secrets e rotação

A aplicação lê secrets no servidor via `process.env` e não há arquivos `.env`, credenciais ou valores secretos rastreados no Git. A auditoria não possui acesso para invalidar tokens da VPS, Meta, banco, Vercel ou provedores externos. Portanto, a rotação efetiva ainda precisa ser executada pelo proprietário nos respectivos painéis: revogar tokens n8n/Z-API, trocar `DATABASE_URL` se a senha foi exposta, trocar `JWT_SECRET`, trocar `WHATSAPP_APP_SECRET`/verify token e revisar chaves de AI Gateway. Não registrar valores novos neste arquivo.

## Validação

- [x] Inventário de rotas e referências n8n/Z-API no código.
- [x] HMAC Meta e verify token preservados.
- [x] Bloqueio explícito de rotas legadas.
- [x] Política 401/403 para autenticação/autorização.
- [x] Rate limit fail-closed em webhook crítico.
- [x] Anti-replay temporal e idempotência por message ID.
- [x] Busca de secrets no client e no Git sem valores encontrados.
- [x] Bootstrap de produção fail-closed para configuração incompleta ou variável legada n8n/Z-API ativa.
- [x] Ledger de evidência mínimo e alerta interno deduplicado para tentativas bloqueadas, sem payload ou token.
- [ ] Rotação efetiva dos secrets comprometidos nos provedores externos.
- [ ] Revogação de sessões/tokens na VPS antiga e nos provedores legados.
- [ ] Verificação autenticada do projeto Vercel e deployment público.
- [ ] Preservação de evidências externas e denúncia pelos canais oficiais, se aplicável.

## Regra operacional

Não retaliar, explorar ou acessar a infraestrutura comprometida. A resposta é isolar, revogar, preservar evidências mínimas, alertar e denunciar pelos canais oficiais. Clientes legítimos, inclusive novos números, não devem ser bloqueados apenas por serem desconhecidos; privilégios dependem de autenticação, tenant, membership, papel e permissão.

# Relatório forense e operacional — Sea System ERP / SFP-OS

## Escopo preservado

O storefront Vercel informado pelo proprietário continua em uso e não foi modificado. Nenhum DNS, Registro.br, domínio customizado, subdomínio, provedor de pagamento, WhatsApp Business, webhook de produção ou campanha foi ativado. Os módulos Consultor, Seafood Boil, Simulador de WhatsApp, Hormozi Offer, Acervo SFP, Fotos Reais, ProductPoster, Offer Hero, PromoFlyer e a estrutura visual aprovada foram preservados.

## Executado

O SFP-OS passou a ter Commerce Core com clientes, pedidos, itens, pagamentos, entregas, eventos de domínio, outbox, auditoria, idempotência e eventos de funil. O checkout progressivo em `/checkout` recebe intenção de compra, não preço: o servidor recalcula subtotal e total, mantém frete como `A confirmar` sem cotação e separa pedido, pagamento e entrega. A Control Tower é operável quando houver tenant e membership, e utiliza fallback explicitamente demonstrativo na ausência deles.

A arquitetura foi evoluída para produto reutilizável. Foram criadas `tenants` e `tenantMemberships`; catálogo, estoque, clientes, pedidos, pagamentos, entregas, eventos, outbox, auditoria, idempotência, funil e resumo de dashboard receberam escopo de tenant. O tenant é resolvido no servidor por configuração e membership, sem receber um `tenantId` do frontend como autoridade. SKU e idempotência passam a ser únicos no escopo apropriado do tenant.

## Corrigido e endurecido

A fixture `TESTE-01` a `TESTE-09` deixou de poder gerar pedido persistente, mesmo estando no banco: o checkout permanece demo até existir um tenant configurado com catálogo comercial não-fictício. O dashboard agora anuncia **Visão demonstrativa** em vez de operação ao vivo nesse cenário. As ações legadas de exportar, movimentar estoque e registrar venda estão desabilitadas no demo; vendas devem nascer pelo checkout para que preço e total sejam autoritativos no backend.

Foi adicionado rate limit durável a `commerce.createOrder`, com tabela `rateLimitEvents`. O servidor configurou CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` e CORS por allowlist. O RBAC por tenant concede leitura ao viewer e restringe mutações operacionais a owner, admin ou operator. A outbox possui callback cron-only em `/api/scheduled/outbox`, job registrado por `taskUid`, adapter webhook HMAC, claim concorrente, timeout, idempotency key, retry exponencial e auditoria. Ela continua sem job ativo ou provider configurado.

O canal de staging foi preparado com `APP_RELEASE_CHANNEL=staging`, `APP_ALLOW_PERSISTENCE=false` e `APP_ALLOW_CABRAL_REPRESENTATION=false`. Em canal não-prod, a API adiciona `X-Robots-Tag: noindex, nofollow, noarchive` e `Cache-Control: no-store`; o cliente atualiza canonical/OG para sua própria origem e o sitemap/robots não anunciam URLs indexáveis. A persistência geral e a representação Cabral só podem ser habilitadas por flags explícitas em ambiente aprovado.

O endpoint oficial `GET/POST /api/webhooks/whatsapp` foi preparado com handshake de verify token, raw body, limite de 3 MB, validação HMAC-SHA256 de `X-Hub-Signature-256`, conferência de phone number, tenant server-side, deduplicação por mensagem e inbox/notificação interna. Ele permanece retornando 503 no preview porque não há app Meta, secrets ou habilitação de persistência. O painel agora mostra esse status, o callback a configurar, inbox e notificações comerciais sem expor segredo. A conversa é uma oportunidade; a venda só é derivada de `commerce.updatePayment(confirmed)` e passa a ter `sales.orderId` único no tenant.

Também foi criado analytics server-side de vendas por tenant, com filtro de período, canal, status e valor mínimo, além de gráficos de receita diária e mix de canais. Sem tenant ou vendas reais, o dashboard apresenta estado vazio em vez de demonstrar valores inventados.

O Master Execution Prompt V3 foi consolidado como referência versionada e não publicada. O carrinho canônico de nove itens soma R$ 1.828,54 em teste automatizado; preços B2C/B2B, Seafood Boil e metas passaram a constar de `commercialReference.ts` e de uma Control Tower de crescimento. A interface etiqueta os números como referência não reconciliada: R$ 150 mil/mês B2C, R$ 500 mil/mês B2B e R$ 83.333,33/mês de lucro médio geram, sob ticket assumido de R$ 250 e conversão assumida de 5%, 600 pedidos/mês, 20/dia e 12 mil interações/mês. Nenhuma dessas premissas foi gravada em catálogo, estoque, margem, preço live ou faturamento realizado.

Foi criado o tenant `seafoods-premium-staging`, ativo e isolado, com o administrador atual no papel de `owner`. A configuração persistida declara modo staging, catálogo com reconciliação bloqueada e persistência comercial falsa. As migrations `0011` e `0012` adicionaram termos B2B Cabral e o intake completo do catálogo. A fila agora contém 151 referências RED: 17 B2C, 13 B2B e 121 documentais sem canal; todas seguem bloqueadas sem SKU, custo posto, estoque, lote, validade, foto vinculada, impostos, logística e evidência de origem. Nenhum produto real foi criado ou ativado.

A política B2B Cabral foi adicionada sem confundir faturamento representado com receita Seafoods. Ela exige pacote de 5–6 kg validado pela soma dos itens, CNPJ, +18% sobre tabela, desconto máximo de 10% e comissão de 2–5%. `b2bCabralTerms` armazena termos por pedido; margem adicional é reconhecida separadamente e comissão só se torna recebida por mutação RBAC auditada. Enquanto `APP_ALLOW_CABRAL_REPRESENTATION=false`, nenhum pedido Cabral pode ser persistido.

O runtime recebeu `APP_TENANT_SLUG=seafoods-premium-staging`, `APP_RELEASE_CHANNEL=staging` e `APP_ALLOW_PERSISTENCE=false`. O endpoint de status leve confirmou tenant configurado, canal staging e persistência desabilitada. A ativação não publicou domínio, não habilitou pedidos comerciais, não conectou providers nem modificou o storefront Vercel.

O playbook B2B Seafoods Brazil foi estruturado sem publicar mídia. A meta de R$ 5.000/dia com ticket assumido de R$ 1.250 exige quatro pedidos/dia. Sob as premissas de 30% de lead para cotação, 25% de cotação para pedido e CPL de R$ 35,00, exige 54 leads/dia, R$ 1.890,00/dia de mídia e CAC de R$ 472,50, equivalente a 37,8% do ticket. Por isso, a Control Tower B2B bloqueia escala até existir margem de contribuição comprovada. Meta Ads Manager e Google Ads não foram conectados, e nenhuma campanha, claim de certificação, desconto, SLA de entrega ou orçamento foi publicado.

## Verificado

A inspeção SQL confirmou o banco gerenciado conectado e 24 tabelas, incluindo Commerce Core, tenants, memberships, rate limiting, scheduledJobs, inbox WhatsApp, notificações, `b2bCabralTerms` e a fila de reconciliação. As migrations `0002` a `0012` foram aplicadas sem excluir registros; `0011` cria os termos Cabral e `0012` amplia intake e semáforo. O catálogo `products` continua exclusivamente de fixtures TESTE, portanto não é catálogo autorizado.

`pnpm check`, `pnpm test` e `pnpm build` passaram. A suíte concluiu dezoito arquivos e quarenta e um testes, incluindo política Cabral, CNPJ/pacote B2B, desconto/comissão, separação de receita e contrato de semáforo da quarentena. Capturas confirmaram dashboard em Visão demonstrativa. Headers, CORS permitido/negado, robots, sitemap, estruturas de job/outbox, `X-Robots-Tag`, `Cache-Control: no-store`, resposta HTTP 403 ao callback cron anônimo e 503 ao WhatsApp desligado foram verificados.

## Gates externos antes de produção comercial

A próxima ativação requer dados e autoridade que não podem ser inventados: catálogo real autorizado com SKU, unidade, preço, custo, estoque e disponibilidade; tenant Seafoods Premium e membership de administrador no ambiente; provedores de pagamento, WhatsApp, logística e CRM, cada um com segredo server-side e contrato de webhook; deploy em release candidate; validação de TLS, CORS, OAuth, callback e assets no domínio; e backup exportável com checksum, restore isolado e rollback documentado. Somente após esses gates o DNS de `seafoodspremium.com.br` deve ser alterado com autorização expressa.

## Riscos residuais declarados

Não há ainda baixa transacional de estoque, provider externo efetivamente configurado, RBAC em todos os módulos futuros, LGPD de retenção/exportação/exclusão, monitoramento de negócio, teste concorrente de idempotência com provider ou teste A/B com dois tenants de dados comerciais. Essas limitações são conhecidas, não mascaradas por dashboard, IA ou fixture.

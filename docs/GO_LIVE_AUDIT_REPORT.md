# GO-LIVE AUDIT REPORT — Seafoods Premium

**Data da auditoria:** 17 de setembro de 2026  
**Ambiente auditado:** `seafoods-premium-staging` no WebDev gerenciado  
**Veredito:** **NO-GO — produção não autorizada.**

## Conclusão executiva

O projeto passou nas verificações locais de qualidade e permanece corretamente protegido em staging. A aplicação compilou, os **44 testes** passaram e o endpoint de status confirmou `configured=true`, `releaseChannel=staging`, `persistenceEnabled=true` e `cabralSimulationEnabled=true`. O catálogo guard impede que fixtures e referências RED sejam vendidos; contudo, não há evidência suficiente para aprovar a virada de produção ou liberar vendas reais.

Os domínios `seafoodspremium.com.br` e `facaseupedido.seafoodspremium.com.br` não estavam servindo a aplicação no momento da auditoria. O domínio raiz não retornou registros A ou CNAME no DNS público consultado, enquanto o subdomínio B2C retornou NXDOMAIN. Não há conector Vercel, Registro.br, Meta Ads ou Google Ads habilitado nesta sessão. Além disso, o catálogo do Commerce Core contém apenas nove fixtures `TESTE-*`; o intake interno possui 151 referências `RED/blocked` (17 B2C, 13 B2B e 121 documentais sem canal), sem promoção para produtos e sem evidência operacional completa.

A consequência é direta: **`APP_ALLOW_PERSISTENCE` deve continuar `false`**. Alterá-la agora permitiria uma tentativa de operação sem catálogo comercial, DNS validado, backup/restauração, pagamento, logística, WhatsApp Business ou smoke test real aprovados.

## Escopo e correção de arquitetura

O pedido exige Vercel para o domínio público. O SaaS auditado, porém, é um projeto **WebDev** com React, Express, tRPC e MySQL/TiDB gerenciado. Ele não contém `vercel.json`, não tem projeto Vercel conectado nesta sessão e não possui ferramenta de publicação Vercel habilitada. O storefront preservado em `index2-seafoods-premium-producao-mo-phi.vercel.app` é um deployment Vercel distinto, com TLS válido para `*.vercel.app`; ele não constitui prova de deployment do Commerce Core, do tenant, da outbox ou do banco do SaaS.

> **Regra de roteamento:** os registros DNS devem ser retirados exclusivamente de **Vercel → Project → Settings → Domains** do projeto que realmente hospedará cada superfície. Não se deve copiar IP, CNAME ou registro de outro projeto, de um tutorial, ou de uma resposta anterior. A Vercel informa que domínio apex usa registro A e subdomínio usa CNAME; o valor do CNAME é específico por projeto. [1]

## Resultado dos cinco gates

| Gate | Resultado | Evidência | Condição para aprovação |
|---|---|---|---|
| 1. DNS, Vercel e Registro.br | **Reprovado** | `seafoodspremium.com.br` não retornou A/CNAME no DNS público; `facaseupedido.seafoodspremium.com.br` retornou NXDOMAIN. Não há acesso ao painel Vercel ou Registro.br. | Conectar o projeto Vercel correto, adicionar os dois domínios no painel, copiar os registros exatos mostrados pela Vercel, aplicá-los no DNS autoritativo e validar DNS/TLS. |
| 2. Deployment real e secrets | **Parcial** | `pnpm check`, `pnpm test` e `pnpm build` passaram; 20 arquivos e 44 testes. Não há deployment Vercel do SaaS verificável, nem acesso ao Secret Manager Vercel. | Executar build e runtime no deployment alvo; confirmar no painel que segredos ficam server-side e que não há variáveis sensíveis prefixadas com `VITE_`. |
| 3. Domínio principal | **Reprovado** | O domínio não resolve publicamente; não há URL institucional/Admin/Control Tower publicada nele. | Após DNS/TLS, validar carregamento, login, RBAC, Control Tower, CORS, headers, OAuth e rota de retorno no host final. |
| 4. Domínio B2C | **Reprovado** | O subdomínio não existe no DNS público. O storefront `*.vercel.app` é acessível, mas não prova que `facaseupedido` aponta para ele ou que integra o Commerce Core. | Associar o subdomínio ao projeto correto, validar HTTPS e confirmar no host final o Boil, disponibilidade e política de preço. |
| 5. Smoke test de produção | **Reprovado** | A soma canônica de fixtures é R$ 1.828,54, mas o pedido retorna `SF-DEMO-0001`, não persiste e não envia WhatsApp. O webhook atual é somente de entrada; `outboundMessagesEnabled=false`. | Com catálogo real e providers aprovados, criar pedido B2C/B2B idempotente no ambiente alvo, confirmar ID persistido, pagamento, outbox, payload WhatsApp autorizado e ausência de duplicação. |

## DNS e TLS: procedimento exigido

A Vercel exige que o domínio seja adicionado ao projeto antes de fornecer a configuração de DNS. Se o domínio estiver sob DNS externo, a interface exibirá os valores específicos do projeto. O apex normalmente é configurado por A record e cada subdomínio por CNAME; a Vercel também pode exigir TXT para prova de controle. [1] Não foi possível obter esses valores porque o conector Vercel está desabilitado e não há acesso à conta/projeto.

No Registro.br, mantenha todos os MX, TXT, SPF, DKIM, DMARC e outros registros existentes que não forem parte do roteamento web. Não troque nameservers sem inventariar e validar esses registros. A Vercel alerta que alterações de nameserver podem afetar e-mail e que os registros devem ser comparados ao DNS autoritativo antes da mudança. [2]

## Deployment e isolamento de secrets

A revisão estática encontrou referências server-side para `DATABASE_URL`, `JWT_SECRET`, `BUILT_IN_FORGE_API_KEY`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID`. Não foram encontrados acessos client-side a `OPENAI_API_KEY`, `GEMINI_API_KEY`, `WHATSAPP_PERMANENT_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET` ou `WHATSAPP_VERIFY_TOKEN`. Alguns **nomes** de variáveis aparecem na cópia instrucional do painel; isso não expõe valores de segredo. A auditoria não pode, porém, confirmar a existência, o escopo ou o isolamento de valores no Secret Manager da Vercel sem acesso ao projeto.

O módulo de IA usa o gateway interno configurado por `BUILT_IN_FORGE_API_KEY`, e o webhook WhatsApp atual aceita somente mensagens de entrada assinadas. Ele não possui envio outbound nem usa `WHATSAPP_PERMANENT_TOKEN`. A ativação do WhatsApp exige, no mínimo, `WHATSAPP_ENABLED=true`, `APP_ALLOW_PERSISTENCE=true`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` e `WHATSAPP_PHONE_NUMBER_ID`; esses valores devem ser inseridos apenas no runtime do host aprovado.

## Catálogo, Boil e margem

O DOCX `TABELACUSTOB2CEREPRESENTACAO.docx` foi extraído integralmente. Ele contém 122 linhas, das quais 92 têm preço informado e 30 estão zeradas ou sem preço. Para os itens coincidentes com a vitrine, a tabela apresenta, por exemplo, custo/referência de R$ 219,90/kg para Cauda de Lagosta 500/700, R$ 239,90/kg para 700up, R$ 289,90/kg para Centolla, R$ 229,90/kg para Camarão Rosa 16/20 e R$ 239,90/kg para Ovas Tobiko. Esses valores não foram promovidos ao catálogo, pois não vêm acompanhados de SKU, fornecedor, custo posto, lote, estoque, foto, imposto, taxa de pagamento, frete, perda e preço de venda aprovado.

Comparando cinco desses itens com os preços atualmente exibidos no storefront Vercel, a **margem bruta de referência** é 28,57% antes de frete, imposto, taxa, perda, embalagem e desconto. Ela não é margem de contribuição e não pode virar limite de CAC. O CAC de referência do plano B2B, R$ 472,50 por pedido, continua bloqueado até que a margem de contribuição seja calculada por pedido com os componentes acima. A política de Representações foi modelada separadamente: acréscimo de 18%, desconto até 5%, pacote de 5–6 kg, comissão de 2–5% e valor representado segregado de receita própria. A simulação de Representações e a persistência técnica estão ativas em staging, porém `TESTE-*` e referências RED continuam bloqueados pelo guard de catálogo; não há pedido, comissão ou receita comercial liberados.

O storefront Vercel exibiu catálogo e Seafood Boil como superfícies separadas, mas a auditoria não encontrou no host final verificável a combinação solicitada de Caranguejo R$ 15,00, Cauda de Lagosta R$ 50,00 e Pata/Patola indisponíveis. A tabela de custos também lista patas de caranguejo como `Zerado`; isso não autoriza promoção, preço ou disponibilidade.

## Smoke test: resultado exato

| Verificação | Resultado |
|---|---|
| Soma dos nove itens de fixture | **R$ 1.828,54** — aprovada como teste canônico de demonstração |
| ID de pedido no modo atual | `SF-DEMO-0001` — não é ID de produção persistido |
| Formato do ID persistido no código | `SF-AAAAMMDD-XXXXXX`, e não `SF-XXXXXXXX` |
| Catálogo persistido | 9 produtos, todos `TESTE-*`, nenhum associado ao tenant staging |
| Quarentena | 151 itens `blocked/RED`; todos sem evidência operacional completa |
| WhatsApp | Endpoint inbound assinado preparado; envio outbound desabilitado |
| Persistência | `APP_ALLOW_PERSISTENCE=true` em staging; guard de catálogo mantém fixtures e RED fora de venda comercial |

## Payload de produção que **não foi aplicado**

A mudança abaixo é material e continua pendente de aprovação final após todos os gates passarem:

```text
APP_RELEASE_CHANNEL=production
APP_ALLOW_PERSISTENCE=true
APP_TENANT_SLUG=<slug-do-tenant-operacional-aprovado>
APP_CANONICAL_ORIGIN=<origem-https-final-do-host-aprovado>
APP_ALLOWED_ORIGINS=<lista-exata-de-origens-publicadas>
```

Além desse payload, o ambiente alvo precisa de catálogo comercial reconciliado, backup/restauração verificados, provider de pagamento, política de logística, e credenciais WhatsApp adequadas. Nenhum desses valores foi adivinhado ou inserido nesta auditoria.

## Simulação Cabral habilitada em staging

O widget de dashboard agora separa **valor representado**, **receita própria reconhecida**, **margem projetada**, **comissão esperada**, **comissão recebida** e **comissão pendente**. Sem termos persistidos, ele mostra uma fixture claramente rotulada, baseada em pacote de 5 kg e desconto de 5%, para validar a experiência sem gerar pedido, alterar estoque, reconhecer receita ou chamar provider externo. O catálogo de revisão inclui o filtro server-side `B2B` e a tag **BLOQUEADO — REFERÊNCIA RED**.

## Plano de correção para nova auditoria

1. Habilitar o conector Vercel e autenticar a conta que contém o projeto alvo. Confirmar se o SaaS será implantado no projeto Vercel existente ou em um projeto Vercel separado compatível com Express/tRPC. Esse ponto precisa ser decidido antes de DNS.
2. No projeto Vercel alvo, adicionar `seafoodspremium.com.br` e `facaseupedido.seafoodspremium.com.br`, copiar os records exibidos pelo painel e submeter a alteração no Registro.br. Verificar a emissão automática do certificado somente depois de propagação.
3. Carregar catálogo real com SKU, unidade, custo posto, estoque/lote, fornecedor, foto, preço de venda, tributo, entrega e política de perda. Somente então aprovar os itens e calcular margem de contribuição/CAC.
4. Executar backup real, checksum, restore isolado e rollback. Em seguida conectar pagamento, logística e WhatsApp Business em staging com secrets server-side.
5. Reexecutar smoke test em domínio final, com pedido persistido, pagamento/entrega controlados, outbox auditada e payload WhatsApp autorizado. Apresentar o payload e as variáveis finais para confirmação explícita antes de `APP_ALLOW_PERSISTENCE=true`.

## Referências

[1]: https://vercel.com/docs/domains/working-with-domains/add-a-domain "Vercel — Adding & Configuring a Custom Domain"
[2]: https://vercel.com/docs/domains/managing-dns-records "Vercel — Managing DNS Records"

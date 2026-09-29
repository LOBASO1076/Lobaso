# Seafoods Premium — Script de demonstração da plataforma e do Go-Live

**Duração sugerida:** 12–15 minutos  
**Ambiente:** preview/staging do Seafoods Premium OS  
**Público:** direção, operação, comercial B2B, financeiro e responsável por deployment  
**Objetivo:** demonstrar a arquitetura, a separação financeira e os controles de segurança sem apresentar fixtures ou referências RED como vendas reais.

## Antes de começar

1. Abrir o preview do SaaS: `https://3000-i21n3xf2jstkcds5xhtxf-127d4e2f.us1.manus.computer`.
2. Autenticar com a conta autorizada do ambiente de staging.
3. Confirmar visualmente o rótulo **Visão demonstrativa** e o tenant `seafoods-premium-staging`.
4. Manter aberta a vitrine preservada em outra aba apenas para contextualização: `https://index2-seafoods-premium-producao-mo-phi.vercel.app/`.
5. Não prometer pedido, pagamento, estoque, entrega ou mensagem WhatsApp reais durante a demonstração.

## Abertura — 60 segundos

> “Esta é a versão staging do Seafoods Premium OS. O objetivo hoje não é simular uma venda como se ela fosse real; é mostrar que a plataforma consegue separar intenção, pedido, pagamento, operação, comissão e governança. O ambiente está protegido por guard server-side e o go-live público continua condicionado aos gates externos.”

Apontar no cabeçalho:

- canal `staging`;
- modo demonstrativo;
- tenant isolado;
- ações que dependem de catálogo operacional.

## Bloco 1 — Dashboard e Control Tower — 2 minutos

1. Mostrar o resumo operacional.
2. Explicar que métricas sem tenant/catálogo real aparecem como referência ou fixture rotulada.
3. Abrir **Analytics operacional**.
4. Demonstrar filtros de período, canal, status e valor mínimo.
5. Destacar que agregações são server-side e tenant-scoped.
6. Mostrar **Growth Control Tower**.
7. Explicar as premissas de referência:
   - B2C: R$ 150 mil/mês;
   - B2B: R$ 500 mil/mês em valor representado;
   - B2B: R$ 1.250 por pedido e 4 pedidos/dia;
   - CPL de referência: abaixo de R$ 35.

**Fala:**

> “Esses números são engenharia reversa de metas fornecidas, não realizado. A Control Tower ajuda a transformar meta em ritmo e limite, mas não mascara ausência de dados.”

## Bloco 2 — Catálogo e 151 referências RED — 2 minutos

1. Abrir o painel **Catalog Reconciliation**.
2. Ativar o filtro `B2B`.
3. Mostrar a tag **BLOQUEADO — REFERÊNCIA RED**.
4. Explicar a divisão: 17 B2C, 13 B2B e 121 documentais sem canal.
5. Mostrar que `CABRAL-IMP-123` a `CABRAL-IMP-151` são identificadores rastreáveis, não novos produtos fictícios.
6. Abrir o CSV somente para auditoria, sem promover registros.

**Fala:**

> “O catálogo completo está registrado para reconciliação, mas nenhum item RED é vendável. Para promoção, ainda faltam custo posto, estoque, lote, validade, fornecedor, foto, impostos e logística.”

## Bloco 3 — Política Cabral e widget financeiro — 2 minutos

1. Abrir **Cabral Policy**.
2. Mostrar a simulação ativa em staging.
3. Abrir **Cabral Financial Widget**.
4. Destacar quatro números separados:
   - valor representado;
   - receita própria reconhecida;
   - comissão esperada;
   - comissão recebida/pendente.
5. Explicar as regras:
   - acréscimo de 18% sobre a referência;
   - desconto máximo de 10%;
   - pacote de 5–6 kg;
   - CNPJ obrigatório;
   - comissão de 2%–5% após recebimento auditado.

**Fala:**

> “O valor que passa pelo fornecedor não é receita Seafoods. A plataforma só reconhece a nossa receita quando a comissão é recebida e registrada. Isso evita confundir volume representado com faturamento próprio.”

## Bloco 4 — Checkout e segurança — 2 minutos

1. Abrir `/checkout`.
2. Mostrar o catálogo de demonstração marcado como fixture.
3. Adicionar itens de teste sem sugerir disponibilidade comercial.
4. Demonstrar que preço é autoritativo no servidor.
5. Demonstrar que frete fica como **a confirmar** quando não há cotação.
6. Para B2B, mostrar CNPJ e regra de pacote mínimo.
7. Explicar idempotência, tenant e bloqueio de referências RED.

**Fala:**

> “O frontend não é autoridade de preço, estoque, frete ou status. A criação de pedido é validada no servidor, vinculada ao tenant e protegida contra duplicação.”

## Bloco 5 — WhatsApp Business — 90 segundos

1. Abrir o painel de integração WhatsApp.
2. Mostrar inbox/notificações internas.
3. Explicar que o endpoint inbound está preparado com verify token, HMAC e deduplicação.
4. Mostrar que envio outbound está desabilitado em staging.
5. Explicar que conversa não vira venda por inferência.

**Fala:**

> “Uma mensagem recebida pode criar uma oportunidade ou notificação, mas nunca uma receita automática. Venda confirmada nasce de pedido autoritativo e pagamento confirmado.”

## Bloco 6 — Gráfico financeiro — 90 segundos

1. Abrir `PROJECAO_FINANCEIRA_INTERATIVA.html`.
2. Alternar as visões B2C, B2B e comissão.
3. Mostrar a progressão mensal de referência.
4. Demonstrar que comissão estimada sobre R$ 500 mil representados é de R$ 10 mil a R$ 25 mil, conforme 2%–5%.
5. Reforçar que CAC de R$ 472,50 é teto de referência e depende de margem de contribuição real.

**Fala:**

> “O gráfico separa receita própria, valor representado e comissão. Isso permite que direção acompanhe crescimento sem superestimar a receita Seafoods.”

## Bloco 7 — Caminho para Go-Live — 2 minutos

1. Abrir o briefing executivo ou o relatório de auditoria.
2. Mostrar os cinco gates:
   - domínio/DNS/TLS;
   - deployment real e secrets;
   - domínio principal;
   - domínio B2C;
   - smoke test com pedido persistido.
3. Mostrar o que já passou: TypeScript, 44 testes e build.
4. Mostrar o que está bloqueado: Vercel, Registro.br, catálogo aprovado, providers e backup/restore.

**Fala de fechamento:**

> “O sistema está pronto para provar valor em staging. O go-live não será liberado por aparência de prontidão: precisamos de catálogo reconciliado, domínio verificável, providers, backup e smoke test persistido. Assim que esses dados forem fornecidos, repetimos a auditoria e liberamos a virada de forma controlada.”

## Perguntas esperadas

**“O catálogo tem 151 produtos vendáveis?”**  
Não. São 151 referências em quarentena RED; o catálogo operacional contém apenas fixtures de teste.

**“A meta B2B de R$ 500 mil já é receita?”**  
Não. É uma meta de valor representado. A receita própria é a comissão recebida e auditada.

**“Podemos ativar Meta Ads agora?”**  
Somente campanhas em rascunho. Publicação exige catálogo, oferta, rota, consentimento, atendimento e margem aprovados.

**“O WhatsApp já fecha pedidos?”**  
O endpoint de entrada está preparado, mas envio outbound, consentimento, provider e smoke test real ainda não foram ativados.

**“O que falta para produção?”**  
Acesso ao projeto Vercel, records DNS oficiais, catálogo aprovado por SKU, contratos/providers, backup/restore e autorização explícita do ambiente de produção.

## Critério de sucesso da demo

A demonstração é aprovada quando o público consegue identificar, sem ambiguidade:

- o que é dado realizado, referência, fixture ou quarentena;
- como um pedido passa por validação server-side;
- por que receita representada não é receita própria;
- como a Control Tower calcula metas e limites;
- quais gates ainda precisam de intervenção externa.

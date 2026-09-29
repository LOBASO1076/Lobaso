# Sea System ERP / SFP-OS — Referência comercial V3

## Classificação Truth Mode

**Status: amarelo — fornecido, ainda não reconciliado.** Os valores abaixo foram extraídos do Master Execution Prompt V3 fornecido pelo proprietário. Eles estão versionados em `shared/commercialReference.ts` para auditoria e cálculos de referência, mas **não** foram promovidos ao catálogo operacional, não alteram o storefront e não autorizam disponibilidade, estoque, custo, margem ou venda.

## Teste canônico

O carrinho informado contém nove itens com subtotal esperado de **R$ 1.828,54**. O teste automatizado reconcilia o total em centavos (`182854`). A reconciliação confirma apenas a soma da referência fornecida; não confirma que os produtos, pesos, lotes, custos ou preços estejam disponíveis no banco comercial.

## Referências de preço

O código registra os preços B2C informados para atum, tilápias, salmão, camarões, panga, piramutaba e polaca, e os preços B2B informados para lagostas e camarão cinza por calibre. A tabela B2B completa e qualquer item adicional continuam pendentes de reconciliação direta com a fonte comercial vigente.

## Seafood Boil protegido

A faixa fornecida é de **R$ 159,90** para uma pessoa a **R$ 599,90** para seis pessoas. Extras informados: milho R$ 15,00, batatas R$ 18,00, manteiga Cajun R$ 22,00, caranguejo inteiro R$ 15,00/un e cauda de lagosta R$ 50,00/un. Pata de caranguejo e patola permanecem sem disponibilidade na referência. O bloco não deve ser alterado sem decisão explícita e reconciliação operacional.

## Metas e premissas

As metas de execução fornecidas são R$ 150.000/mês B2C, R$ 500.000/mês B2B e R$ 1.000.000/ano de lucro líquido médio, equivalente a R$ 83.333,33/mês. Com ticket B2C assumido de R$ 250,00, o cálculo resulta em 600 pedidos/mês e 20 pedidos/dia. Com conversão assumida de 5% no funil WhatsApp, resulta em 12.000 interações qualificadas/mês. São premissas de engenharia reversa, não projeções garantidas.

O dashboard apresenta essas metas com a etiqueta **Referência de execução**. O realizado deve vir do banco operacional, com pedidos, pagamento confirmado, margem validada e origem de campanha. Nenhum gap deve ser calculado contra dados fictícios.

## Próximo gate

Antes da publicação, reconciliar cada item com SKU, categoria, unidade, apresentação, custo, margem interna, fornecedor, estoque/lote, foto real, status, preço B2C, preço B2B autorizado e regra de logística. Só depois promover registros aprovados para `products` no tenant Seafoods Premium.

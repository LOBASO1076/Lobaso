# Seafoods Premium — Política B2B Cabral

**Estado:** implementada como regra de staging e **bloqueada para operação comercial real**.  
**Fonte:** briefing de execução controlada de 17 de setembro de 2026.  
**Escopo:** representação comercial B2B; não se aplica à operação B2C própria Seafoods Premium.

## Separação de papéis

| Parte | Responsabilidades registradas |
|---|---|
| **Cabral** | Fornecimento, faturamento, recebimento do pagamento, logística, prazos operacionais e fulfillment. |
| **Seafoods Premium** | Prospecção, apresentação, negociação dentro da autorização, oportunidades, relacionamento, margem adicional e comissão. |

> O **valor representado Cabral não é receita própria Seafoods**. O sistema registra valor de tabela, preço comercial, desconto, margem adicional, comissão esperada e comissão recebida separadamente.

## Mecânica de preço e reconhecimento

| Campo | Regra |
|---|---|
| Valor da tabela | Valor comercial de origem, sujeito a catálogo e evidência aprovados. |
| Acréscimo | **18%** sobre a tabela. |
| Desconto | Máximo **10%** sobre o preço comercial de referência. |
| Preço final | Preço comercial menos desconto aprovado. |
| Valor acima da tabela | Preço final menos valor da tabela. |
| Margem adicional Seafoods | Igual ao valor acima da tabela, enquanto aprovado. |
| Comissão | Entre **2% e 5%**, registrada como esperada e depois recebida. |
| Receita Seafoods reconhecida | Apenas a margem adicional. Comissão esperada é potencial; só passa a recebida após evento auditado. |

Com tabela de R$ 100,00, o preço comercial de referência é R$ 118,00. Com desconto máximo de 10%, o preço final é R$ 106,20 e a margem adicional é R$ 6,20. Uma comissão de 5% sobre a tabela equivale a R$ 5,00 esperados, mas **não** é receita reconhecida antes do recebimento.

## Mínimo atacado

Pedidos B2B Cabral exigem pacote fechado entre **5 e 6 kg**. O servidor valida que todos os itens estão em kg e que a soma das quantidades coincide com o peso declarado. Um pedido abaixo, acima ou divergente não é classificado automaticamente como atacado.

O contrato B2B também exige CNPJ de 14 dígitos, desconto dentro de 0–10% e comissão dentro de 2–5%. Esses controles são realizados no servidor; valores enviados pelo frontend não são autoridade de preço.

## Persistência e auditoria

A tabela tenant-scoped `b2bCabralTerms` registra por pedido: tabela, acréscimo, preço de referência, desconto, final, valor acima da tabela, margem adicional, comissão esperada, comissão recebida, valor representado, peso do pacote, status e evidência. A operação de registro de comissão exige RBAC `owner`, `admin` ou `operator` e cria evento/auditoria.

Mesmo se a persistência geral for ativada no futuro, B2B Cabral requer a flag server-side separada `APP_ALLOW_CABRAL_REPRESENTATION=true`. Ela permanece `false` no staging atual.

## Separação B2C

B2C é operação própria Seafoods Premium e mantém carrinho, pedido, pagamento, logística, Boil, Prontos, Natura e catálogo separados. A regra Cabral não altera B2C. O Seafood Boil continua em referência com caranguejo inteiro a R$ 15,00, cauda de lagosta a R$ 50,00 e pata/patola indisponíveis; esses valores não foram promovidos ao catálogo operacional.

## Gate para ativação comercial

A política só pode sair de `reference_blocked` quando houver contrato/autorização Cabral, catálogo aprovado por SKU, preço de tabela vigente, regra de comissão, estoque/lote, disponibilidade, impostos, logística e documento de evidência por pedido. A flag `APP_ALLOW_PERSISTENCE` continua `false`; nenhuma condição deste documento autoriza go-live.

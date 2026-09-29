# Seafoods Premium — Relatório de Intake e Reconciliação de Catálogo

**Ambiente:** `seafoods-premium-staging`  
**Data:** 17 de setembro de 2026  
**Estado:** **RED / bloqueado para publicação**

## Resultado do intake

O documento comercial recebido foi preservado como fonte de referência interna e seu conteúdo foi normalizado na fila tenant-scoped `catalogReconciliationItems`. O intake não criou linhas em `products`, não alterou a vitrine em uso e não habilitou pedido comercial. Para impedir deduções indevidas, os valores de origem não aparecem neste relatório nem em componentes client-side.

| Segmento de origem | Itens em quarentena | Canal atribuído | Semáforo | Estado |
|---|---:|---|---|---|
| Referências B2C anteriores | 17 | `b2c` | RED | `blocked` |
| Referências B2B anteriores | 13 | `b2b` | RED | `blocked` |
| Linhas do DOCX normalizadas | 121 | `unassigned` | RED | `blocked` |
| **Total** | **151** | Sem ativação | **RED** | **blocked** |

Uma linha do DOCX foi identificada como duplicada durante o intake idempotente; por isso 122 linhas de origem resultaram em 121 referências documentais distintas. Essa deduplicação não altera catálogo comercial nem preço.

## Evidência de foto e mídia

O pacote recebido contém **25 mídias** e um arquivo HTML. Os nomes das mídias são genéricos de WhatsApp e não trazem SKU, produto ou calibre verificáveis. Portanto, o sistema registrou apenas um `photoCandidate` de pendência; não associou nenhuma foto a produto por similaridade, não publicou imagens e não gravou mídia no catálogo operacional.

## Critério RED, YELLOW e GREEN

| Semáforo | Critério | Ação permitida |
|---|---|---|
| **RED** | Falta qualquer evidência crítica: SKU, custo posto, estoque, lote, validade, foto vinculada, imposto, logística, fornecedor ou autorização de preço. | Somente revisão interna; sem publicação, pedido ou campanha. |
| **YELLOW** | Campos preenchidos, mas sem dupla conferência comercial e operacional. | Revisão de responsável; sem promoção automática. |
| **GREEN** | Dados e evidências aprovados por operação, financeiro e catálogo. | Candidato a promoção manual para `products` no tenant correto. |

Nenhum dos 151 itens está em YELLOW ou GREEN neste ciclo.

## Pipeline de reconciliação obrigatório

1. Confirmar **SKU, categoria, unidade, calibre/peso, fornecedor e origem**.
2. Registrar **custo posto**, tributação, embalagem, perda, taxa de pagamento e regra de margem interna.
3. Conferir **estoque disponível, lote, validade, condições de conservação** e disponibilidade por canal.
4. Vincular **foto real ao SKU** após conferência humana, com direitos de uso e mídia otimizada.
5. Aprovar **preço B2C**, preço B2B, regra de pacote, desconto e logística por canal.
6. Fazer dupla aprovação comercial/operacional, mover para YELLOW e, somente então, para GREEN.
7. Promover manualmente registros GREEN ao catálogo operacional com auditoria e plano de rollback.

> Referência documental não é estoque, preço vigente, oferta pública nem autorização de venda. A fonte de verdade comercial continuará no banco operacional depois de aprovação explícita.

## Dependência da política Cabral

A representação B2B Cabral não consome automaticamente nenhuma linha desta fila. Ela exige contrato/autorização, tabela vigente, CNPJ, pacote de 5–6 kg, desconto até 10%, comissão entre 2% e 5% e aprovação separada do runtime. Consulte [`B2B_CABRAL_POLICY.md`](./B2B_CABRAL_POLICY.md) para os controles de preço e reconhecimento.

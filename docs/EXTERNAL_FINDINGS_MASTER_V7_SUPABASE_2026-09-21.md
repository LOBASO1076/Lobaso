# Achados externos — MASTER RC1, v7 e Supabase

## URLs consultadas

- MASTER RC1: https://seafoodspremiummasterrc1vercelpower.vercel.app/
- v7 informada pelo usuário: https://seafoodpremiumverceldiretov7finall.vercel.app/
- Supabase Quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Vercel + Supabase Marketplace: https://vercel.com/marketplace/supabase

## MASTER RC1 observada

A página pública carregou com catálogo B2B/B2C, bloco Seafood Boil, carrinho e formulário de pedido via WhatsApp. O HTML publicado expõe as estruturas `BOILS`, `EXTRAS`, `cart`, `boil` e `extraQty`.

Seafood Boil observado:

- 1 pessoa — R$ 159,90
- 2 pessoas — R$ 249,90
- 3 pessoas — R$ 339,90
- 4 pessoas — R$ 429,90
- 5 pessoas — R$ 519,90
- 6 pessoas — R$ 599,90

Adicionais observados:

- Milho extra cozido na manteiga — R$ 15,00
- Batatas temperadas extras — R$ 18,00
- Extra de Manteiga Cajun — R$ 22,00

O HTML também confirma atualização de carrinho, remoção de itens e que o Chef IA não altera preços nem adiciona itens automaticamente.

## v7 informada

A URL `https://seafoodpremiumverceldiretov7finall.vercel.app/` retornou `DEPLOYMENT_NOT_FOUND` na consulta HTTP de 21/09/2026. Portanto, não foi possível extrair assets binários ou código diretamente dessa implantação. A integração deve usar os dados públicos comprovados da MASTER RC1 e preservar a base local como rollback.

## Supabase oficial

O quickstart oficial orienta criar projeto, configurar variáveis de ambiente, usar chave publicável no cliente, habilitar RLS e criar políticas explícitas. A chave service role deve permanecer somente no servidor. A documentação também recomenda revisar RLS e secrets antes de produção.

## Regra de integração

Não sobrescrever versões publicadas. A base local Seafoods Premium deve ser alterada de forma reversível, com checkout server-side, preço recalculado pelo servidor, Boil/adicionais explícitos e fotos tratadas como assets substituíveis até a aprovação comercial das imagens definitivas.

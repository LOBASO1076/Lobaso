# Seafoods Premium — Demo Investor Edition

## Rota de demonstração

A demo visual está disponível em `/demo`. Ela usa a mesma base SaaS validada, consulta o catálogo pelo contrato público tRPC e preserva `/checkout` como fluxo operacional separado. A V7 de pedidos não é sobrescrita nem alterada externamente.

## Melhorias incluídas

A interface reúne a camada visual homologada da V8, o acervo de imagens V7/V8 preservado, o hero institucional, cards responsivos, CTA de checkout, loading inicial de 720 ms e compartilhamento individual por item. O botão de compartilhamento tenta primeiro o Web Share API do dispositivo e, quando indisponível, abre um link `wa.me` com mensagem pré-preenchida. Nenhuma mensagem é enviada automaticamente.

## Segurança e limites

A demo não contém chaves, tokens ou credenciais. Os preços continuam vindos do catálogo do servidor. O compartilhamento usa somente texto derivado do item selecionado; não transmite dados de cliente, cookies ou payloads internos. As imagens são assets já presentes no projeto e são servidas como arquivos estáticos versionados.

## Validação executada

- `pnpm check`: aprovado.
- `pnpm test`: 25 arquivos e 57 testes aprovados.
- `pnpm build`: aprovado; Vite e esbuild concluídos.
- ZIP de instalação: reconstruído sem `.env`, `node_modules`, `dist` ou `.git`.

## Validação manual sugerida

1. Abrir `/demo`.
2. Confirmar o splash inicial e a entrada suave da página.
3. Rolar até Catálogo compartilhável.
4. Selecionar Compartilhar em um produto e confirmar o menu nativo ou a abertura do WhatsApp.
5. Abrir Experimentar checkout e validar que o fluxo `/checkout` permanece funcional.

## Atualização de apresentação

A demo agora inclui busca por nome/SKU, filtro por categoria, ordenação por destaque, preço ou nome, hover de card com elevação e zoom controlado, além de botão de adicionar com confirmação imediata. A Home recebeu uma seção de depoimentos demonstrativos claramente identificados como material de narrativa do investidor; avaliações reais só devem ser publicadas após autorização dos clientes.

# Seafoods Premium OS — checklist final da cópia

## Implementação concluída e validada

- [x] Tenant e isolamento operacional mantidos.
- [x] Quarentena de catálogo e referências não reconciliadas preservada.
- [x] Política B2B server-side, comissão e segregação de valor preservadas.
- [x] Segurança Zero-Trust, CSP, CORS, HSTS e rotas legadas n8n/Z-API tombstonadas preservados.
- [x] Catálogo demo, Seafood Boil de 1 a 6 pessoas, adicionais e assets visuais preservados.
- [x] Inteligência comercial e regras determinísticas de recompra disponíveis.
- [x] Webhook oficial Meta em `/api/webhooks/whatsapp` com GET de verificação e POST HMAC.
- [x] Deduplicação por tenant/mensagem e validação de timestamp ativadas.
- [x] Mensagens não textuais bloqueadas sem download, execução ou armazenamento de bytes.
- [x] Inbox e notificações comerciais no tenant correto.
- [x] Central Operacional em `/operacao` com seleção de conversa, itens, quantidade, pagamento e logística.
- [x] Ponte WhatsApp → pedido com revisão humana e `orders.whatsappMessageId`.
- [x] Preço e estoque calculados pelo servidor; nenhuma mensagem gera receita automaticamente.
- [x] Pagamento e entrega começam pendentes; venda reconhecida apenas após pagamento confirmado.
- [x] Limite de 10 pedidos Seafood Boil/dia por tenant no horário de Brasília.
- [x] Preparação de cozinha, Control Tower, financeiro, entrega e auditoria conectados por eventos de domínio/outbox.
- [x] Status de prontidão para Uber Direct, 99 Corp, 99Food, entrega manual e retirada.
- [x] Chamadas outbound de courier permanecem desativadas por segurança e custo-zero.
- [x] Migração aditiva do vínculo WhatsApp-pedido aplicada ao banco.
- [x] Documentação operacional e fontes oficiais de Uber Direct/99Food registradas.
- [x] `pnpm check` aprovado.
- [x] `pnpm test` aprovado com 27 arquivos e 66 testes.
- [x] `pnpm build` aprovado para Vite + esbuild.
- [x] Checkpoint salvo na versão `ad1f5760`.

## Dependências externas explicitamente separadas

Estas linhas não são bugs nem tarefas incompletas do código. São ações do proprietário nas plataformas externas, necessárias para ativação comercial real:

| Dependência | Estado correto |
|---|---|
| Credenciais Meta Business, callback e inscrição `messages` | Aguardando configuração no provedor |
| Produtos reais, custos, estoque, lotes, validade, fornecedor, imposto, logística, disponibilidade, preço e fotos por SKU | Aguardando dados operacionais do negócio |
| Contrato/autorização Cabral e recebimento de comissão | Aguardando aprovação externa |
| Acesso Vercel, DNS, domínio e publicação | Aguardando decisão/acesso do proprietário |
| Credenciais e homologação de pagamento, Uber Direct, 99 Corp/99Food ou CRM | Aguardando contratação/homologação externa |
| Backup, rotação de credenciais comprometidas e restore comercial | Ação do proprietário nos provedores |

## Regras permanentes

- [x] Mensagem WhatsApp não vira pedido sem revisão humana.
- [x] Pedido não vira receita sem confirmação de pagamento.
- [x] Não baixar ou executar documentos, mídias, links ou arquivos recebidos por webhook.
- [x] Não reabrir n8n/Z-API ou qualquer rota legada sem nova auditoria.
- [x] Não colocar segredos de Meta/Uber/99 no frontend.
- [x] Não prometer frete, disponibilidade, seguro ou horário sem confirmação operacional.

## Atualização auditada — Vercel app operacional (29/09/2026)

O checklist acima e o checkpoint `ad1f5760` não foram comprovados como o mesmo artefato deste workspace. Na cópia local atual, os resultados foram 64/68 testes; há quatro falhas documentadas no Livro Mestre. No deployment `seafoodspremiumv8appfilaoperacional.vercel.app`, a instalação congelada e o bundle passaram, porém a API `/api/trpc/auth.me` respondeu 500 `FUNCTION_INVOCATION_FAILED` e a interface permaneceu em skeleton. O build log também registrou incompatibilidades de tipos Express embora `pnpm check` local passe. Ver `release/INCIDENT_VERCEL_API_2026-09-29.md`. Causa raiz interna ainda não acessível sem os Runtime Logs autenticados da Vercel; não declarar o SaaS operacional/publicado funcionalmente. Nenhuma alteração foi feita na V7, Vercel, DNS ou domínio.

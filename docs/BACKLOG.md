# Seafoods Premium OS — Backlog Priorizado

## P0 — Segurança e operação real

1. **Persistir clientes, pedidos e itens**. Criar `customers`, `orders` e `orderItems` ou evoluir `sales` com transação e vínculo a cliente.
2. **Fechar pedido no backend**. Recalcular preços, estoque, descontos e total no servidor; impedir que o cliente forneça margem ou custo final.
3. **Implementar cliente recorrente**. Buscar por nome ou WhatsApp, preencher dados, permitir confirmação e vincular novo pedido ao mesmo cliente.
4. **Webhook oficial de WhatsApp**. Validar assinatura, idempotência, payload, consentimento e fila de confirmação humana.
5. **Segredos e observabilidade**. Configurar rate limit, CSP, logs estruturados, alertas, gestão de segredos e política de retenção.

## P1 — Fluxo comercial

6. **Checkout completo**. Produto → quantidade → carrinho → cliente → entrega/pagamento → conferência → total → WhatsApp → registro.
7. **Mensagem pronta para atendimento**. Gerar texto com cliente, endereço, itens, quantidade, total, pagamento, logística, origem e observações.
8. **Estoque transacional**. Reservar e baixar estoque apenas após confirmação; tratar cancelamento e ajuste.
9. **Páginas operacionais reais**. Implementar `/estoque`, `/vendas`, `/inteligencia`, `/seguranca` e `/configuracoes`.
10. **Hormozi ligado ao catálogo**. Calcular complementos com produtos reais, preço vigente e disponibilidade.

## P2 — CRM e métricas

11. Histórico privado de cliente com pedidos, produtos, valores, datas, endereço, logística e origem.
12. Métricas de conversão por conversa, pedidos por cliente, frequência, recorrência, origem e aumento de ticket.
13. Segmentação B2C/B2B, clientes recorrentes e listas de reativação.
14. Exportação de relatórios e trilha de auditoria pesquisável.

## P3 — Escala

15. CRM externo e Sales MCP, somente após contratos de dados e autorização definidos.
16. Pagamento PIX/cartão e conciliação.
17. Automações e Control Tower.
18. Domínios e subestruturas oficiais.

## Fora do escopo deste ciclo

Consultor, Seafood Boil, Acervo SFP, Fotos Reais, ProductPoster, Offer Hero, PromoFlyer e estrutura visual aprovada permanecem congelados. Não alterar o Boil.

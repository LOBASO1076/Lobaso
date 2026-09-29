# MVP de Inteligência Comercial — Seafoods Premium OS

## Objetivo imediato

Converter o pico de atenção informado pela operação — **50 mensagens de pedidos no dia**, crescimento de **1.761 para 2.137 seguidores no perfil @seafoodspremium** e salto para **14.904 seguidores no @seafoodsbrasil** — em uma fila objetiva de contatos, recompra e atendimento. Esses números devem ser reconciliados com os analytics oficiais antes de qualquer comunicação externa a investidores; neste MVP, são tratados como **pulso operacional informado pelo negócio**, não como métrica verificada automaticamente pelo sistema.

## Princípio de custo zero

O MVP utiliza somente o que a plataforma já possui: React/Vite para a interface, Express/tRPC para os contratos, Drizzle/MySQL para dados, autenticação Manus, eventos de funil já registrados, WhatsApp como canal operacional e regras determinísticas executadas no servidor. Não depende de mídia paga, API de CRM, provedor de automação, modelo de IA externo ou serviço de previsão pago.

## Módulos entregues

1. **Fila de recompra:** clientes são ordenados por prioridade comercial.
2. **Previsão determinística:** cadência, janela, atraso, ticket médio e probabilidade explicável.
3. **Segmentação:** VIP, prontos para recompra, em risco, novos e ativos.
4. **Mensagem sugerida:** cada oportunidade recebe um texto de WhatsApp editável.
5. **Regras visíveis:** o operador e o investidor conseguem entender como a pontuação foi calculada.
6. **Fallback demo:** quando o banco da cópia está vazio, o painel continua apresentável sem fabricar persistência operacional.

## Regras determinísticas

| Regra | Definição operacional |
|---|---|
| Cadência | Mediana dos intervalos entre compras; limitar entre 7 e 90 dias para evitar outliers. |
| Próxima compra | Última compra + cadência mediana. |
| Janela de contato | De 3 dias antes a 5 dias depois da próxima compra estimada. |
| Pronto para recompra | Cliente com pelo menos 2 compras e recência entre 80% e 125% da cadência. |
| Em atraso | Recência superior a 125% da cadência mediana. |
| Primeira compra | Sem previsão forte até existir uma segunda compra; probabilidade deliberadamente baixa. |
| Ticket médio | Média dos valores das compras não canceladas. |
| Score | Combinação explicável de estabilidade da cadência, aderência de recência, valor do ticket e urgência. |
| Segmento VIP | Ticket médio acima de R$ 1.200 e pelo menos 3 compras. |

## Rotina operacional para não perder o embalo

**08:00 — Captura:** registrar mensagens, origem e intenção no funil; não deixar pedidos em conversa sem dono.

**10:00 — Triagem:** abrir a fila de recompra e responder primeiro VIPs, leads quentes e pedidos atrasados.

**12:00 — Estoque:** conferir disponibilidade dos produtos mais citados nas conversas e bloquear promessas sem estoque real.

**15:00 — Conversão:** usar recomendação de combo, alternativa equivalente e prazo de entrega antes de falar em desconto.

**18:00 — Fechamento:** registrar pedido, canal, origem, ticket e status; marcar o próximo contato.

**D+1 — Pós-venda:** confirmar entrega, satisfação e autorização para recompra futura.

## Próximas evoluções sem alterar o princípio de custo zero

A segunda etapa deve ligar a fila a itens de pedido e produtos para recomendar complementos por coocorrência. A terceira etapa deve medir conversão de mensagem, resposta, orçamento e venda por origem. Somente depois de haver histórico confiável vale introduzir modelos estatísticos ou IA para gerar resumos e variações de mensagem; a regra base deve continuar disponível para auditoria.

## Guardrails

A previsão é uma **priorização**, não uma promessa de venda. O painel deve mostrar modo demo/live, data de geração e motivo da recomendação. Toda mensagem de WhatsApp deve ser revisada pelo operador antes do envio. Dados de investidores devem separar métricas verificadas, métricas informadas pela operação e hipóteses futuras.

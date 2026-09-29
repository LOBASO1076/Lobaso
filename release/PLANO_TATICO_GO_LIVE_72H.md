# Seafoods Premium — Plano Tático de Go-Live em 72 horas

**Estado operacional:** rascunho pronto para execução controlada. Nenhuma campanha Meta foi publicada, nenhuma mensagem em massa foi enviada e nenhum conector externo foi ativado nesta sessão. A execução real exige catálogo aprovado, contrato Cabral, consentimento de contato, domínio/deploy e providers validados.

## 1. Objetivos e premissas financeiras

| Frente | Meta de referência | Engenharia reversa | Observação |
|---|---:|---:|---|
| B2C Seafoods Boil | **R$ 150.000/mês** | Ticket de referência R$ 250 → 600 pedidos/mês, cerca de 20/dia | Referência comercial, não realizado. |
| B2B Cabral | **R$ 500.000/mês em valor representado** | Ticket R$ 1.250 → 120 pedidos/mês, 4/dia | Valor representado não é receita própria Seafoods. |
| Comissão Cabral | **2%–5%** sobre valor recebido | R$ 10.000–R$ 25.000/mês em cenário de R$ 500 mil recebidos | Só reconhecer após recebimento auditado. |
| Aquisição B2B | CPL de referência **< R$ 35** | 54 leads/dia planejados a 30% lead→cotação e 25% cotação→pedido | CAC planejado de referência: R$ 472,50/pedido. |

**Regra financeira:** não escalar mídia enquanto o CAC planejado não estiver abaixo da margem de contribuição comprovada por pedido. Frete, impostos, perdas, embalagem, taxas de pagamento e comissões precisam estar reconciliados antes de transformar referência em limite.

## 2. Estrutura de campanhas Meta Ads

### 2.1 Campanha B2C — Seafood Boil

**Objetivo:** mensagens ou leads, direcionando para conversa assistida e consulta de disponibilidade. A campanha deve ser criada em rascunho até que preço, estoque, janela logística, foto e consentimento estejam aprovados.

**Geografia inicial:** Brasília/DF e Goiânia/GO, com conjuntos separados por cidade para comparar custo e capacidade logística. Evitar expansão automática antes de validar rota, tempo de resposta e taxa de conversão.

**Públicos de teste:**

| Conjunto | Público | Hipótese |
|---|---|---|
| Boil — Intenção gastronômica | Pessoas interessadas em frutos do mar, culinária, experiências gastronômicas e delivery premium | O produto de grupo reduz a fricção de escolha. |
| Boil — Ocasiões | Jantares, aniversários, reuniões e entretenimento em casa | O número de pessoas facilita a decisão. |
| Remarketing | Visitantes, iniciadores de conversa e engajados consentidos | Reforçar disponibilidade e janela, sem prometer estoque. |

**Criativo principal:** refeição compartilhada, quantidade de pessoas claramente apresentada e CTA **“Consultar disponibilidade”**. Não utilizar claims de “entrega hoje”, desconto, estoque garantido ou certificação sem evidência operacional aprovada.

**Variações de copy:**

- **Ângulo ocasião:** “Seafood Boil para compartilhar. Diga para quantas pessoas e confirme a composição disponível para sua data.”
- **Ângulo praticidade:** “Uma experiência completa do mar à mesa. Consulte a combinação e a janela de entrega antes de fechar.”
- **Ângulo consultivo:** “Não empurramos o item mais caro. Entendemos sua ocasião e indicamos o que faz sentido.”

**CTA e resposta inicial:** “Quero montar meu Boil”. A primeira resposta deve perguntar cidade, data, número de pessoas e restrições, sem confirmar preço ou estoque automaticamente.

### 2.2 Campanha B2B — Representação Cabral

**Objetivo:** geração de leads qualificados e conversa iniciada no WhatsApp. Não usar campanha para prometer disponibilidade ou preço fechado antes da qualificação.

**Geografia inicial:** Chapada dos Veadeiros/GO e Pirenópolis/GO. Criar conjuntos separados por região, pois rota, frequência e custo logístico podem variar.

**ICP:** restaurantes, sushi bars, hotéis, pousadas, buffets, chefs responsáveis por compras e peixarias premium. Priorizar decisores que compram por calibre, peso, recorrência e previsibilidade de custo.

**Estrutura de campanha:**

| Campanha | Conjunto | Criativo | Conversão |
|---|---|---|---|
| B2B — Qualificação | Restaurantes e sushi bars | Camarão por calibre, cauda de lagosta, Centolla | Formulário qualificado |
| B2B — Conversa | Hotéis, buffets e pousadas | Padronização de peso e compra recorrente | WhatsApp consentido |
| B2B — Remarketing | Engajados/visitantes consentidos | Proposta de teste de 5–6 kg | Formulário ou conversa |

**Criativo 1 — Linha de produtos:** “Calibre e peso padronizados para sua cozinha: camarão rosa 16/20, cauda de lagosta 500/700g e referências premium sob confirmação.”

**Criativo 2 — Food cost:** “Mais previsibilidade para o food cost. Qualifique seu volume e receba uma cotação B2B com tabela, disponibilidade, frete e prazo confirmados antes do pedido.”

**Criativo 3 — Teste controlado:** “Estruture um pacote inicial de 5–6 kg conforme a política aprovada. A proposta só é enviada depois de validar CNPJ, rota, estoque e tabela vigente.”

**Formulário de lead:** nome; empresa/restaurante; CNPJ; função; cidade; telefone com consentimento; volume mensal estimado em kg; principais itens/calibres; frequência de compra; melhor janela de contato.

**Perguntas de qualificação:**

1. Você decide a compra ou influencia a decisão?
2. Qual é o volume mensal aproximado de frutos do mar?
3. Quais três itens/calibres têm maior giro?
4. A operação está em qual cidade e possui janela de recebimento?
5. O CNPJ e os dados de faturamento estão disponíveis para cotação?

## 3. Tracking e nomenclatura

**UTM padrão:**

```text
utm_source=meta
utm_medium=paid_social
utm_campaign={b2c_boil|b2b_cabral}
utm_content={angulo_criativo}
utm_term={cidade_publico}
```

**Eventos internos:** `lead_received`, `lead_qualified`, `quote_requested`, `quote_sent`, `order_created`, `payment_confirmed`, `commission_received`.

**Regras de atribuição:** mensagem recebida não é pedido; conversa não é receita; pedido sem pagamento não é venda confirmada; valor B2B representado não entra na receita própria Seafoods.

## 4. Cadência de prospecção WhatsApp B2B

### D0 — Abertura com permissão

> Olá, [Nome]. Sou [Consultor] da Seafoods Premium. Trabalhamos com representação B2B para operações que precisam de calibre, peso e disponibilidade confirmados antes de comprar. Posso entender seu consumo mensal de frutos do mar?

Se não houver resposta, não insistir no mesmo dia. Se houver resposta positiva, seguir para qualificação.

### D0 — Qualificação operacional

> Para preparar uma cotação responsável, preciso de CNPJ, itens/calibres, volume estimado, cidade, frequência e janela de entrega. Tabela, estoque, frete e prazo são confirmados antes do pedido. Qual desses dados você já consegue me passar?

### D1 — Entrega de contexto

> Obrigado. Com esses dados, consigo separar o que é referência de catálogo do que está disponível para sua rota. A proposta será enviada com unidade, calibre, quantidade, preço, frete, validade da cotação e condição de pagamento.

Não enviar catálogo RED ou tabela não aprovada como se fosse preço comercial vigente.

### D2 — Oferta de teste

> Se a rota e o estoque forem aprovados, podemos estruturar um pacote inicial de 5–6 kg conforme a política B2B Cabral. O valor, o desconto e a comissão seguem a tabela formal da cotação; não prometemos prazo antes da confirmação logística.

### D3 — Fechamento ou pausa

> Vou registrar sua solicitação para validar tabela, estoque e rota. Depois envio a proposta formal. O pedido só é considerado ativo após aceite e pagamento conforme o fluxo aprovado. Se preferir, posso retomar em [data/janela].

**Opt-out:** “Entendido. Não farei novos contatos por este número. Caso queira retomar, basta responder a esta mensagem.”

**Regras de segurança comercial:** não enviar mensagem em massa; não comprar listas; não abordar sem base legal/consentimento; registrar opt-out; não alegar SIF/SISBI, SLA, frete grátis, desconto, estoque ou entrega same-day sem evidência; não compartilhar custo interno com o lead.

## 5. Cronograma de execução

### 0–24 horas — Preparar e validar

- Aprovar catálogo, fotos, estoque/lote, janela logística e contrato Cabral.
- Criar campanhas Meta em rascunho, com conjuntos B2C por cidade e B2B por região.
- Configurar UTMs, eventos, consentimento, telefone de atendimento e SLA interno de resposta.
- Testar formulário com dados fictícios, sem criar lead comercial real.
- Definir responsável por responder, cotar, aprovar e registrar o resultado.

**Gate:** se catálogo, consentimento ou rota não estiverem aprovados, manter campanhas pausadas.

### 24–48 horas — Publicar somente após aprovação

- Ativar primeiro um conjunto B2C e um conjunto B2B com orçamento controlado.
- Validar qualidade dos leads, não apenas volume.
- Aplicar o script D0–D3 e registrar motivo de perda.
- Fazer revisão diária de comentários, claims e perguntas sobre preço/estoque.
- Comparar Brasília/Goiânia e Chapada/Pirenópolis por CPL, qualificação e capacidade de atendimento.

**Gate:** pausar criativo que gere promessa errada, lead sem perfil ou demanda fora da rota aprovada.

### 48–72 horas — Otimizar e decidir

- Consolidar lead → cotação → pedido → pagamento.
- Calcular CPL, taxa de qualificação, lead→cotação, cotação→pedido, CAC e margem de contribuição.
- Manter separadas as colunas de receita própria, valor representado e comissão.
- Escalar apenas o conjunto que respeitar limite de CAC e capacidade operacional.
- Registrar decisão: escalar, manter teste, trocar criativo, mudar região ou pausar.

## 6. Control Tower diária

| KPI | Referência | Ação de controle |
|---|---:|---|
| Tempo até primeira resposta | Definir internamente antes de ativar | Escalar atendimento se houver fila. |
| CPL B2B | < R$ 35 | Pausar/ajustar se o lead qualificado não sustentar o custo. |
| Lead → cotação | > 30% | Revisar formulário, ICP e script. |
| Cotação → pedido | > 25% | Revisar preço, logística e prova de valor. |
| CAC por pedido | < margem de contribuição comprovada | Não escalar se a margem não estiver reconciliada. |
| Comissão recebida | Separada de representada | Reconhecer somente após recebimento auditado. |
| Opt-out | 100% processado | Bloquear novos contatos para o número. |

## 7. Fontes de plataforma

- [Meta — Instant Forms e geração de leads](https://www.facebook.com/business/help/761812391313386)
- [Meta — Anúncios que direcionam para WhatsApp](https://www.facebook.com/business/help/447934475640650)
- [Google Ads — Campanhas de pesquisa](https://support.google.com/google-ads/answer/9510373?hl=en)
- [Google Ads — Assets de destaque](https://support.google.com/google-ads/answer/6079510?hl=en)

**Status final:** pronto para execução em modo controlado; campanhas e prospecção real ainda dependem dos gates registrados na auditoria de go-live.

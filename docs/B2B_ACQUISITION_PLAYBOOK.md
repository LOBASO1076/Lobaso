# Seafoods Brazil — Playbook de aquisição B2B

**Estado:** pronto para montagem e testes de qualidade; **não autorizado para publicação de mídia**. Este playbook usa o catálogo atacadista fornecido como referência e exige reconciliação de SKU, custo, estoque, foto, entrega e claims antes de qualquer anúncio, cotação ou oferta pública.

## Objetivo e limites econômicos

A meta de receita é **R$ 5.000,00 por dia**, ou R$ 150.000,00 em um mês de 30 dias. Com ticket B2B assumido de **R$ 1.250,00**, são necessários quatro pedidos concluídos por dia e 120 pedidos por mês. O perfil prioritário é composto por restaurantes, sushi bars, hotéis, buffets e peixarias premium no Distrito Federal.

| Métrica | Premissa | Cálculo | Resultado |
|---|---:|---:|---:|
| Receita diária | R$ 5.000,00 | — | R$ 5.000,00 |
| Ticket B2B | R$ 1.250,00 | — | R$ 1.250,00 |
| Pedidos diários | — | 5.000 ÷ 1.250 | 4 |
| Lead → cotação | 30% | — | premissa |
| Cotação → pedido | 25% | — | premissa |
| Leads necessários por dia | — | 4 ÷ (30% × 25%) | 53,33; plano: 54 |
| CPL de referência | R$ 35,00 | — | R$ 35,00 |
| Investimento diário implícito | — | 54 × 35 | R$ 1.890,00 |
| CAC implícito | — | 1.890 ÷ 4 | R$ 472,50 |
| CAC sobre ticket | — | 472,50 ÷ 1.250 | 37,8% |

O CPL de R$ 35,00 **não é um objetivo economicamente aprovado por si só**. A escala permanece bloqueada até que a margem de contribuição por pedido seja comprovada a partir de custo, perdas, embalagem, frete, tributos, meios de pagamento e descontos. A regra operacional é: **CAC por pedido precisa ficar abaixo da margem de contribuição comprovada por pedido.**

## Oferta e base de prova

A campanha deve falar de calibre, padronização, previsibilidade de compra e atendimento comercial. Não deve prometer “SIF/SIF certificado”, entrega no mesmo dia, desconto por volume, preço garantido, disponibilidade ou qualidade específica enquanto a evidência correspondente não estiver aprovada. Os itens de referência para abordagem são Camarão Rosa Limpo 16/20, camarão cinza por calibre, lagosta por gramatura e outros itens da tabela atacadista. A lista definitiva só pode ser enviada após reconciliação.

### Gate de publicação

| Requisito | Dono | Evidência mínima | Situação atual |
|---|---|---|---|
| SKU e unidade | Produto | ficha cadastrada | bloqueado |
| Custo e margem | Financeiro/Compras | custo por lote e política | bloqueado |
| Estoque e lote | Operações | saldo e rastreabilidade | bloqueado |
| Foto real | Produto/Marketing | acervo autorizado | bloqueado |
| Entrega e SLA DF | Logística | CEPs, janela, custo e responsável | bloqueado |
| Certificações | Qualidade | documento válido e claim aprovado | bloqueado |
| WhatsApp e CRM | Comercial | número Meta, webhook e consentimento | preparado, não conectado |
| Conta de mídia | Growth | acesso Meta/Google e teto aprovado | conector desativado |

## Meta Ads: dois experimentos separados

A Meta permite campanhas com objetivo **Leads** e Instant Forms, incluindo perguntas customizadas e validações; os anúncios que levam ao WhatsApp exigem um número conectado à Página ou ao portfólio comercial. [1] [2]

### Experimento A — Formulário de qualificação

**Campanha:** `SBZ_B2B_DF_Leads_Qualificacao_v1`. Use objetivo Leads com Instant Form de intenção mais alta. Segmente geograficamente o Distrito Federal e crie conjuntos de anúncios separados por restaurante/sushi, hotel/buffet e peixaria/empório. Use criativos apenas com fotos reais aprovadas e calibres efetivamente reconciliados.

O formulário deve pedir nome, empresa/restaurante, CNPJ, função, WhatsApp, e-mail corporativo e volume mensal de pescados em kg. Inclua aviso de privacidade, finalidade de contato comercial e autorização para retorno. A Meta informa que formulários Instant podem usar perguntas customizadas, lógica condicional, validação de telefone e e-mail corporativo; use esses recursos para reduzir leads sem ICP. [1]

**Criativo A — linha e calibre.** Título: “Calibres definidos para a rotina da sua cozinha.” Texto: “Solicite a tabela profissional após validação de cadastro. Compare apresentação, unidade e disponibilidade com o seu volume mensal.” Não listar preço ou item se a ficha ainda estiver bloqueada.

**Criativo B — previsibilidade de compra.** Título: “Mais previsibilidade na compra de pescados para operação profissional.” Texto: “Cadastro B2B para receber atendimento comercial, checagem de disponibilidade e proposta conforme volume.” Não declarar economia, margem garantida ou entrega sem prova.

### Experimento B — conversa no WhatsApp

**Campanha:** `SBZ_B2B_DF_WhatsApp_Qualificacao_v1`. Use objetivo Leads com WhatsApp como local de conversão e otimização para conversas. A Meta descreve que esse fluxo exige conexão do número à Página/portfólio comercial e permite templates de conversa; somente publique depois do número, webhook e atendimento estarem ativos. [2]

Mensagem de abertura sugerida: “Olá, quero avaliar fornecimento profissional de pescados para minha operação no DF.” Botões iniciais: “Solicitar cadastro B2B”, “Falar de volume mensal” e “Verificar disponibilidade”. O primeiro atendente deve responder no mesmo turno comercial e marcar origem, campanha, ICP e próximo passo no CRM.

## Outbound: cadência humana de três passos

A lista de prospecção deve ser construída apenas com contatos empresariais autorizados e preferência por canais de negócio públicos. Respeite consentimento, opt-out e políticas da plataforma. Não faça disparo em massa, automação não solicitada ou envio de tabela não aprovada.

**Passo 1 — abordagem.** “Olá, [Nome]. Sou [Vendedor] da Seafoods Brazil. Atendemos operações profissionais que precisam reduzir variabilidade de compra por calibre, apresentação e disponibilidade. Posso entender quais pescados vocês mais usam por mês e verificar se existe aderência de fornecimento?”

**Passo 2 — material e qualificação.** “Obrigado pelo contexto. Para preparar uma proposta certa, preciso confirmar os itens prioritários, volume mensal, frequência de entrega e janela de recebimento. Assim que a tabela e o estoque forem validados, envio uma cotação profissional com unidade, calibre, disponibilidade e condições.”

**Passo 3 — pedido-teste.** “Com a proposta aprovada, podemos organizar um pedido-teste dentro das condições comerciais e logísticas confirmadas. Em vez de prometer frete grátis ou amostra, vou confirmar internamente a política válida para o seu CEP, volume e janela de entrega. Posso encaminhar a cotação para validação hoje?”

Toda conversa deve registrar ICP, segmento, produto de interesse, volume, status, objeção, próxima ação e consentimento. A equipe não deve usar a expressão “catálogo canônico” com clientes; esse termo é apenas controle interno.

## Google Ads: intenção de compra, não volume genérico

As campanhas de pesquisa alcançam pessoas que buscam ativamente por serviços e produtos, e podem ser estruturadas por palavras-chave e grupos de anúncios relevantes. [3] Crie grupos separados para `distribuidora de peixes brasilia`, `camarao atacado df`, `fornecedor frutos do mar restaurantes df` e `lagosta atacado brasilia`. Use correspondência de frase e exata no início. Crie uma lista negativa inicial: receita, curso, emprego, varejo, grátis, atacadão, pesca, aquário, congelador doméstico.

Cada grupo deve ter página ou formulário coerente com a busca e três anúncios responsivos distintos. Não enviar tráfego B2B para a página B2C. A conversão primária é “lead qualificado” e não clique, visita ou conversa iniciada.

Callouts podem ser configurados no nível de conta, campanha ou grupo de anúncios e têm limite de 25 caracteres na maioria dos idiomas; eles devem ser específicos e suportados por prova. [4] **Somente depois do gate**, os callouts candidatos são: “Calibres Padronizados”, “Atendimento B2B DF”, “Cotação por Volume”, “Entrega Agendada DF”. Não usar “SIF/SIF Certified”, “Same-Day Delivery” ou “B2B Volume Discounts” sem evidência e política aprovada.

## Painel diário e decisões

| Verificação diária | Meta de teste | Decisão |
|---|---:|---|
| Pedidos B2B concluídos | 4/dia | Validar receita e margem antes de escalar |
| Receita B2B | R$ 5.000/dia | Comparar com pedido confirmado, não cotação |
| Leads qualificados | 54/dia na premissa | Reduzir gasto se qualidade cair |
| CPL B2B | abaixo de R$ 35,00 | Só manter se CAC também respeitar contribuição |
| Lead → cotação | acima de 30% | Ajustar ICP, formulário ou atendimento |
| Cotação → pedido | acima de 25% | Revisar preço, disponibilidade, entrega e follow-up |
| Tempo até primeira resposta | definir SLA antes do lançamento | Escalar somente com cobertura de atendimento |
| CAC por pedido | abaixo da contribuição validada | Pausar conjunto se exceder o teto |

A revisão diária segue: gasto → leads → leads qualificados → cotações → pedidos → receita → margem de contribuição → CAC → causa do gap → ação do próximo dia. A Control Tower deve permanecer sem dados fictícios: se o CRM ou a mídia não estiverem conectados, exibir “não medido”, e não zero como resultado.

## Sequência de lançamento

Primeiro complete a reconciliação de itens e aprove claims. Depois conecte Meta, Google e WhatsApp em staging e teste formulário, rastreamento, criação de lead, consentimento, notificação e atribuição. Em seguida rode um piloto com orçamento diário explicitamente aprovado e limite de perda definido pela margem de contribuição. Só então escale orçamento, mantendo experimentos separados e uma rotina de controle diária.

## Referências

[1]: https://www.facebook.com/business/help/761812391313386 "Meta Business Help — About lead ads with instant form"
[2]: https://www.facebook.com/business/help/447934475640650 "Meta Business Help — Create Ads that Click to WhatsApp in Ads Manager"
[3]: https://support.google.com/google-ads/answer/9510373?hl=en "Google Ads Help — Create a Search campaign"
[4]: https://support.google.com/google-ads/answer/6079510?hl=en "Google Ads Help — About callout assets"

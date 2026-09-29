# Finalização do SaaS — decisão forense de 27/09/2026

## Decisão de integridade

O pacote forense confirma que o projeto deve ser finalizado sem misturar versões:

- **V7 pública:** Golden Master comercial, visual e funcional. Deve permanecer preservada como contingência e rollback.
- **Cópia Seafoods Premium OS:** fonte única de evolução SaaS e staging. Não deve ser promovida a produção antes dos gates abaixo.
- **V8/OS candidatas anteriores:** não promover, não usar para pedidos reais e não criar novos projetos paralelos.

## Estado atual do SaaS

Já existem React/Vite, Express/tRPC, Drizzle, modelos de commerce, clientes, pedidos, vendas, estoque, tenant, RBAC, auditoria, rate limit, outbox, Control Tower e Central de Inteligência Comercial. O typecheck está limpo e a suíte atual tem 61 testes passando em 26 arquivos.

A cópia, entretanto, começa com schema e sem os dados operacionais da origem. Portanto, a interface demo não é evidência de operação persistente. O modo demo deve continuar visualmente separado do modo live.

## Gates obrigatórios antes de produção

### Gate 1 — fonte única e reversibilidade

1. Congelar a V7 sem alterar catálogo, preços, imagens, fluxo ou WhatsApp.
2. Trabalhar somente nesta cópia para a evolução SaaS.
3. Registrar cada mudança, teste e versão em um novo episódio.
4. Manter a V7 como rollback estático.

### Gate 2 — ambiente e tenant

1. Configurar tenant ativo no banco de staging.
2. Confirmar usuário proprietário único, função e autenticação forte.
3. Aplicar schema/migrations no banco de staging.
4. Validar isolamento entre tenant, usuário e funções.
5. Não exibir custos e margens a perfis operacionais sem autorização.

### Gate 3 — catálogo autorizado

1. Importar os assets comerciais preservados da V7.
2. Substituir SKUs `TESTE-*` por SKUs autorizados.
3. Conferir preço, unidade, custo, margem e disponibilidade.
4. Conferir imagens, Seafood Boil, adicionais, CTA e link WhatsApp.
5. Não publicar preços internos ou custos no catálogo público.

### Gate 4 — pedido persistido

O teste de aceitação precisa comprovar, com um pedido controlado:

```text
cliente → catálogo → checkout → pedido único → Control Tower
→ pagamento pendente/confirmado → estoque → entrega → CRM → recompra
```

O pedido deve sobreviver a reinício do servidor e aparecer com número único no painel. O teste não deve usar somente o fallback demo.

### Gate 5 — WhatsApp oficial

Manter a entrada desligada até comprovar, em staging:

- GET com token errado rejeitado;
- POST sem assinatura, assinatura falsa, ID não autorizado e payload grande rejeitados;
- assinatura HMAC validada sobre o corpo bruto;
- mapeamento explícito `phone_number_id → canal → tenant`;
- deduplicação transacional por mensagem;
- mensagem classificada como oportunidade, nunca como pedido/pagamento automático;
- rotas legadas e n8n/Z-API permanecendo bloqueadas;
- painel privado com trilha de auditoria e botão de desativação.

Não migrar nem desregistrar os números atuais sem teste oficial de continuidade/coexistência, um número por vez.

### Gate 6 — financeiro e Seafood Boil

A análise forense mostra que os custos do Boil ainda têm itens em aberto: caranguejo, acompanhamentos, molho, embalagem, perdas, preparo, taxas, tributos, entrega e mão de obra. Os preços não devem ser alterados com base apenas no custo parcial. O tamanho de seis pessoas é o cenário mais apertado na simulação disponível.

A DRE unitária deve ser fechada e autorizada antes de liberar descontos ou alterar a regra interna de custo +40% B2C e custo +18% B2B.

## Critério de promoção

Só promover staging para produção quando todos os gates tiverem evidência anexada: URL, pedido persistido, screenshot, logs, testes, checksum/artefato e rollback. `READY` de uma plataforma de deploy sozinho não comprova saúde operacional.

## Próximo episódio recomendado

**“A Control Tower recebe o primeiro pedido real em staging.”**

### STATUS
A base SaaS e a inteligência comercial estão implementadas; a V7 está identificada como Golden Master.

### EVIDÊNCIA
Pacote forense de 27/09/2026, este documento, typecheck limpo e 61 testes passando.

### PROBLEMA
Tenant, dados reais, catálogo autorizado, pedido persistido, WhatsApp oficial e backup/restauração ainda não foram comprovados nesta cópia.

### AÇÃO
Executar os Gates 2, 3 e 4 em staging antes de qualquer promoção.

### RESPONSÁVEL
Lorenzo Soneghet valida catálogo, preços, margens, números oficiais e autorização de publicação.

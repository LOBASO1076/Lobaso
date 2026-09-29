# Seafoods Premium — Investor Handoff

## O que está pronto

O release consolidado preserva a arquitetura SaaS validada, o tenant de staging, o controle comercial B2C/B2B, a política de Representações, o checkout server-side, o widget financeiro, a contenção de integrações legadas, o acervo visual V8 e o pacote de campanha com vídeo vertical, locução, trilha e captions.

A V8 anexada foi tratada como homologação visual e integrada sem promover preços, custos, estoques ou SKUs não reconciliados para venda. A V7 permanece preservada como referência visual/funcional anterior.

## Evidências técnicas

- TypeScript: aprovado.
- Testes: 25 arquivos, 57 testes aprovados.
- Build Vite/esbuild: aprovado.
- ZIP Vercel: íntegro, sem `node_modules`, `dist`, `.git` ou `.env`.
- V8: 24 assets visuais, vitrine/admin demonstrativos e documentação auditados.
- Campanha: vídeo vertical 1080×1920, 30 fps, 8 segundos, com áudio, captions e CTA.

## Limites honestos para o investidor

O pacote está pronto para revisão e importação controlada. Não foi declarado go-live público porque domínio, variáveis privadas, rotação de credenciais, banco de produção, pagamentos, WhatsApp Business oficial, backup/restore e aprovação de promoção ainda dependem de ações externas no painel e dos provedores.

O ambiente continua em staging e os guards impedem que dados de demonstração sejam tratados como pedidos comerciais reais. Essa decisão é intencional: protege o caixa, os clientes e a due diligence do investidor.

## Estrutura de entrega

`SEAFOODS_PREMIUM_VERCEL_INSTALL.zip` é o pacote principal de aplicação. `SEAFOODS_PREMIUM_CAMPANHA_10_PEDIDOS_REMOTION.zip` contém o playbook, manifestos, composição Remotion e áudios leves. Os arquivos de vídeo/imagem grandes estão preservados fora da árvore versionada e devem ser anexados como mídia de campanha. `V8_INTEGRATION_AUDIT_PT-BR.md` explica exatamente o que foi incorporado e o que permanece bloqueado.

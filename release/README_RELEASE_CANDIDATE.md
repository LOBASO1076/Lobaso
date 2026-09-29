# Seafoods Premium — Release Candidate

Os HTMLs e CSV são artefatos de staging e auditoria, não páginas publicadas. O CSV contém 151 referências RED; CABRAL-IMP-123 a CABRAL-IMP-151 identificam 29 referências existentes, sem adicionar linhas ou inventar preços.

## Entregáveis

- `SFP-OS-1.2-COMMERCE-V2-PRODUCTION-FINAL.html` — aplicação Commerce V2 em formato demonstrativo.
- `SFP-CONTROL-TOWER-RECEITA-PRODUCTION-FINAL.html` — painel de receita/comissões em formato demonstrativo.
- `CATALOGO_151_REFERENCIAS_COMPLETO.csv` — 151 referências em quarentena RED.
- `PLANO_TATICO_GO_LIVE_72H.md` — plano detalhado de Meta Ads e prospecção WhatsApp B2B Cabral.
- `SCRIPT_DEMONSTRACAO_GO_LIVE.md` — roteiro de demonstração da plataforma, Control Tower e gates de produção.
- `PROJECAO_FINANCEIRA_INTERATIVA.html` — gráfico standalone com visões B2C, B2B e comissão Cabral.
- `VERCEL_CLI_INSTRUCTIONS.md` e `vercel-go-live.sh` — autenticação/deploy controlado, sem execução nesta sessão.
- `VERCEL_INSTALLATION_FINAL_PT-BR.md` — runbook completo, em português, com comandos de link, variáveis, preview, `pedidos.sfppedidos.app`, TLS, produção e rollback.
- `INCIDENT_ROTATION_VERCEL.md` — revogação de credenciais legadas, rotação server-side, remoção de variáveis n8n/Z-API e validação pós-incidente, sem valores secretos.
- `INSTALACAO_POR_UPLOAD_VERCEL.md` — instruções para importar pela interface, variáveis de Preview, domínio e gates de Production.
- `SEAFOODS_PREMIUM_VERCEL_INSTALL.zip` — pacote fonte limpo para upload/importação; sem `node_modules`, `dist`, `.git`, `.env` ou secrets.

## Estado operacional

O ambiente WebDev está em staging. A persistência técnica está ativa, mas o guard server-side mantém fixtures TESTE e referências RED fora de venda. Campanhas Meta, mensagens WhatsApp, DNS, deployment público e pedidos comerciais não foram ativados.

O domínio planejado do aplicativo é `https://pedidos.sfppedidos.app`. A associação ao projeto Vercel correto ainda depende de login/projeto/equipe identificáveis e dos registros DNS exibidos pelo próprio Vercel.

O pacote usa Node `22.x` (com `.nvmrc` local em `22.18.0`), `pnpm install --frozen-lockfile`, `pnpm build`, saída `dist/public` e função Node `api/[...path].ts`. O build atual não consome `AI_GATEWAY_API_KEY`; a IA existente usa o gateway interno Manus no servidor.

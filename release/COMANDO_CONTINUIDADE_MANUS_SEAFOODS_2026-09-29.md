# Comando de continuidade — Seafoods Premium OS

Use este documento como instrução de retomada. Ele consolida o método do Livro Manus recebido em 29/09/2026 com as regras executivas de Lorenzo. Seu propósito é evitar reinícios, repetição de briefing e mudanças no que já foi aprovado.

## Comando mestre

```text
CONTINUE O Seafoods Premium OS A PARTIR DO ESTADO EXISTENTE.

Antes de agir, leia o Livro Mestre Do Caos ao Sol, este comando, todo.md,
docs/SAAS_STATUS.json, docs/STAGING_RUNBOOK.md e a documentação específica
dos módulos envolvidos. Confirme o diretório de trabalho e registre qual
cópia, ambiente e versão está sendo inspecionada.

PRESERVE a V7 publicada, aprovada e usada para pedidos como Golden Master e
rollback. Não a edite, substitua, renomeie nem publique por cima. Faça o
trabalho do sistema administrativo/operacional apenas na cópia de evolução
em staging.

PRESERVE sem alteração o layout, cores, tipografia, identidade, fotos,
catálogo, textos, abas, preços e fluxo visual que Lorenzo já aprovou. Não
redesenhe, não reorganize a navegação e não crie telas/abas novas por iniciativa
própria. Este trabalho é de continuidade técnica, integração funcional,
segurança e operação, não de direção visual.

TRATE os materiais do Manus, Vercel e outras plataformas como referências para
comparação e continuidade, não como prova automática de que um recurso existe
na cópia atual. Confirme cada afirmação no código, migração, ambiente e teste.
Não copie um projeto inteiro nem recomece arquitetura: incorpore seletivamente
o que estiver presente, testado, compatível e ausente da cópia-alvo.

Para cada etapa: registrar estado inicial; localizar módulos existentes;
descrever diferença funcional; preservar comportamento aprovado; implementar
somente o escopo autorizado; executar typecheck, testes e build pertinentes;
validar o fluxo com evidência; atualizar este Livro Mestre com arquivos,
comandos e resultados. Nunca apresentar fixture, demo, staging ou código sem
configuração como produção ou integração ativa.

Não expor custos, margens, preços B2B ou segredos no cliente. Regras vigentes:
B2B custo +18%, B2C custo +40%, desconto máximo 5%; mudanças financeiras
críticas dependem do responsável Lorenzo e autenticação forte/2FA. Mensagem
recebida não é pedido confirmado; pedido não é receita sem pagamento
confirmado. WhatsApp/Instagram somente por integração oficial autenticada.
Não reativar n8n, Z-API, VPS/VPN terceirizada, interceptadores ou webhooks
inseguros. Logística Uber/99 permanece manual até integração e autorização
reais comprovadas.

Não publicar, promover domínio, alterar DNS, configurar cobrança real ou
ativar integrações externas sem autorização expressa de Lorenzo. Sempre
entregar uma demo/preview revisável antes de qualquer instalação.

No encerramento, informar objetivamente: pronto nesta etapa; em andamento;
pendente/bloqueado; evidência de teste; risco restante; arquivo atualizado;
próxima ação única. Salvar prompts, decisões, comandos, execução e resultados
no Livro Mestre no mesmo ciclo da entrega.
```

## Comandos locais da cópia auditada

Executar somente dentro de `work_audit/seafoods_vercel_2026_09_28` e registrar a saída:

```bash
pnpm check
pnpm test
pnpm build
```

O pacote declara Node 22 e pnpm 10.4.1. Se o ambiente usar outras versões, anotar o desvio; não atualizar lockfile, overrides ou toolchain automaticamente. Nunca imprimir valores de `.env` ou secrets. Para inspeção de configuração, registrar apenas nomes de variáveis.

## Reconciliação do material Manus recebido em 29/09

O Livro Manus descreve um estado/cópia com React/Vite, Express/tRPC, Drizzle/MySQL, migrações `0014` e `0015`, `FinancialCommandCenter`, `OrderTracking` e checkpoint `eebcee03`. A cópia presente neste workspace não tem `.git`, suas migrações vão até `0013` e não foram encontrados os dois caminhos de página citados. O próprio material Manus também registra checkpoints `378a4f0c` e `324855a7`; o `todo.md` local registra `ad1f5760`. Não escolher um deles por suposição. Tratar os checkpoints como históricos de cópias/estados diferentes até haver repositório ou pacote que permita provar a relação.

O código desta cópia contém rotas e módulos de catálogo em reconciliação, pedidos, operações, WhatsApp e logística, mas `docs/SAAS_STATUS.json` marca integrações reais, pagamento, courier, backup/restore e pedido ponta a ponta como não verificados. A presença do código não deve ser descrita como operação ativada.

## Evidência desta execução — 29/09/2026

- `pnpm check`: aprovado.
- `pnpm test`: 63 aprovados, 4 falharam, em 27 arquivos.
- Falhas observadas: artefato `release/PROJECAO_FINANCEIRA_INTERATIVA.html` ausente; três testes esperam `staging`, persistência e simulação habilitadas, enquanto a configuração carregada reporta canal `preview` e persistência desligada.
- O comando foi executado com Node 24.19.0 e pnpm 11.25.0; o pacote declara Node 22.x e pnpm 10.4.1. pnpm 11 avisou que ignorou `pnpm.overrides` e `pnpm.patchedDependencies` no `package.json`.
- Nenhum código funcional, layout, V7, DNS ou deploy foi alterado nesta auditoria.

## Atualização do checkpoint — execução para trabalho em 29/09/2026

- A falha `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` foi reproduzida também com pnpm 10.4.1: o formato salvo para `patchedDependencies` não correspondia ao formato esperado por essa versão.
- O `pnpm-lock.yaml` foi regenerado com `corepack pnpm@10.4.1 install --no-frozen-lockfile --force`; comparação com o snapshot anterior confirmou que a única diferença foi a representação do patch `wouter@3.7.1` (mesmo hash e caminho). Dependências e versões não mudaram.
- Repetição de `corepack pnpm@10.4.1 install --frozen-lockfile --force`: aprovada.
- `corepack pnpm@10.4.1 check`: aprovado.
- `corepack pnpm@10.4.1 build`: aprovado; permanece aviso de bundle JS de 1.2 MB e engine Node 24 local vs. Node 22 declarado.
- Testes completos permanecem 64 aprovados/4 falhos: um arquivo `release/PROJECAO_FINANCEIRA_INTERATIVA.html` ausente e três testes que esperam políticas de staging/simulação ligadas, contrárias ao default seguro atual. Não se ativaram persistência/simulação para esconder as falhas.
- Criado `release/INICIAR_DEMO_LOCAL.ps1` e `release/LEIA-ME_TRABALHO_HOJE.md`. A cópia é executável localmente em modo de demonstração/revisão; não constitui operação de produção nem integra Meta, pagamento, banco, Uber ou 99 sem credenciais/configuração autorizada.
- Novo pacote de trabalho é identificado por ZIP + SHA-256. V7, domínio, DNS e Vercel seguem intocados.

## Bloqueio Vercel recebido em 29/09/2026

O deployment `seafoodspremiumv8appfilaoperacional.vercel.app` completou build, mas está visualmente em skeleton e o GET de `/api/trpc/auth.me` retornou `500 FUNCTION_INVOCATION_FAILED` (request id `cle1::w74qs-1790669564211-3e0417069a63`). O checker Vercel imprimiu erros de tipos Express; `pnpm check` local passa. Causa interna não visível sem Runtime Logs autenticados. Não chamar este deploy de funcional e não republicar pacote enquanto o 500 persistir. Consultar `release/INCIDENT_VERCEL_API_2026-09-29.md`; pedir apenas a mensagem de exceção sem secrets se os logs forem privados.

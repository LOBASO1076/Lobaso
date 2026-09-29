# SFP-OS — Pacote de Auto-Deploy Vercel

## O que este pacote faz

Este ZIP contém o projeto completo preparado para a Vercel. Ao importar o ZIP ou a pasta pela interface **New Project / Vercel Drop**, a Vercel instala as dependências, executa o build configurado e cria automaticamente um deployment de Preview.

O pacote inclui:

- `vercel.json` com roteamento SPA/API;
- Node.js `22.x` e `.nvmrc` `22.18.0`;
- função serverless em `api/[...path].ts`;
- build Vite + Express/tRPC;
- `.vercelignore` sem secrets, `.env`, `node_modules`, `dist` ou `.git`;
- guards Zero Trust e integrações n8n/Z-API bloqueadas;
- scripts de build, teste e deploy controlado;
- documentação de ambiente e rotação de credenciais.

## Limite técnico importante

Um ZIP não pode conter uma sessão Vercel, token de API, senha, cookie ou autorização de equipe. Esses dados seriam secretos e sua inclusão permitiria assumir o projeto. Portanto, não existe um ZIP capaz de publicar sozinho em uma conta Vercel sem que a conta esteja autenticada ou sem que o projeto esteja conectado a Git/Deploy Hook.

O modo sem CLI é:

1. Entrar na conta correta da Vercel.
2. Importar o ZIP pela interface.
3. Selecionar o projeto Seafoods Premium ou criar o projeto correto.
4. Cadastrar as variáveis de ambiente no painel.
5. A Vercel dispara automaticamente o build e o Preview.

O modo totalmente automático por API/CI é suportado pelo script `scripts/vercel-go-live.sh`, mas exige, fora do ZIP, `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` cadastrados como secrets no executor. Nenhum valor real está incluído neste pacote.

## Estado comercial

O pacote permanece em canal `staging`. O guard server-side mantém referências RED, fixtures TESTE e integrações externas fora de vendas reais. Não declarar Produção nem iniciar cobrança até validar Preview, ambiente, domínio, banco, credenciais rotacionadas, rollback e smoke test.

## Gates locais aprovados

- TypeScript: aprovado.
- Testes: 25 arquivos / 57 testes aprovados.
- Build: aprovado.
- Integridade do ZIP: aprovada.
- Secrets e artefatos locais: excluídos do ZIP.

## Segurança

Não usar credenciais da VPS comprometida. Rotacionar as credenciais externas no provedor correspondente antes de cadastrar variáveis na Vercel. Nunca colocar tokens em `client/`, `public/`, ZIP, prompts, logs, commits ou argumentos persistidos.

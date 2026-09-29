# Seafoods Premium OS — pacote Vercel 28/09/2026

Este pacote corresponde ao checkpoint final validado da cópia independente.

## Contém

- Código React/Vite + Express/tRPC.
- Entry point serverless `api/[...path].ts`.
- `vercel.json`, `package.json`, `pnpm-lock.yaml` e migrations Drizzle.
- Central Operacional, webhook Meta com HMAC, bloqueio de mídia/documentos e neutralização de URLs inbound.
- Documentação de instalação, rotação de incidentes e operação WhatsApp/cozinha/logística.

## Não contém

- `.env`, tokens, chaves, cookies, `node_modules`, `dist`, `.git` ou logs.
- Campanhas em áudio/vídeo, zips antigos ou artefatos de desenvolvimento.

## Validação da origem

- `pnpm check`: aprovado.
- `pnpm test`: 27 arquivos / 67 testes aprovados.
- `pnpm build`: aprovado.
- Runtime: Node 22.x e `pnpm install --frozen-lockfile`.

Configure os secrets somente no Vercel Project Settings. Faça primeiro Preview; não publique Production até revisar domínio, banco, rotação de credenciais e webhook Meta.

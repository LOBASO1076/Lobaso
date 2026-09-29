# Incidente Vercel — API do app operacional

Data de análise: 29/09/2026. Deployment observado: `seafoodspremiumv8appfilaoperacional.vercel.app`.

## Evidência direta

- O build log enviado mostra `pnpm install --frozen-lockfile` aprovado com pnpm 10.4.1 e o build Vite/esbuild concluído. Portanto, o erro anterior de configuração do lockfile está resolvido para esse deployment.
- Após o build, o typecheck reporta incompatibilidades Express: `api/[...path].ts` (Express não chamável), callbacks sem tipos e propriedades de Request/Response ausentes em `createApp.ts`, `oauth.ts`, `routers.ts`, `whatsappHttp.ts` e outros. A Vercel ainda marcou o deployment como concluído.
- A página pública observada fica no estado de skeleton/loading. O console registra falhas repetidas do cliente tRPC ao tentar interpretar como JSON a resposta de texto começando por `A server e...`.
- Uma chamada somente leitura a `/api/trpc/auth.me` retornou HTTP 500 `FUNCTION_INVOCATION_FAILED`, request id `cle1::w74qs-1790669564211-3e0417069a63`.
- A tela de logs da Vercel exige autenticação; a causa interna da exceção não ficou visível. Não foi feito login nem alteração externa.

## Conclusão técnica

O erro de install foi corrigido, mas o backend/API serverless deste deployment está falhando em runtime; por isso a interface não recebe dados e fica presa no carregamento. Os sintomas apontam para falha da função ou configuração do runtime, não para erro de carregamento dos assets estáticos. O log público não permite afirmar qual variável/configuração específica causou a exceção.

O código local contém `assertRuntimeSecurity()`: se `APP_RELEASE_CHANNEL=production`, exige `DATABASE_URL`, `JWT_SECRET`, `APP_TENANT_SLUG`, `APP_CANONICAL_ORIGIN` e `APP_ALLOWED_ORIGINS`; além disso, hoje a política exige canonical `https://pedidos.sfppedidos.app`. O deployment está noutro host. Isso é uma hipótese verificável, não causa confirmada. O erro precisa ser confrontado com o runtime log privado da função e apenas com os nomes/estados das variáveis, sem revelar valores secretos.

## Próximo diagnóstico seguro

1. No painel Vercel do projeto deste deployment, abrir Runtime Logs e localizar o request id acima; copiar somente a mensagem de exceção sem valores de secrets.
2. Conferir se as variáveis `APP_RELEASE_CHANNEL`, `APP_TENANT_SLUG`, `APP_CANONICAL_ORIGIN`, `APP_ALLOWED_ORIGINS`, `DATABASE_URL` e `JWT_SECRET` estão configuradas no ambiente correspondente. Não publicar valores.
3. Reproduzir o typecheck da função com o ambiente/tipo de instalação da Vercel; o `pnpm check` local passa, mas isso não explica os diagnósticos divergentes do log enviado.
4. Corrigir e validar localmente; gerar demo e pacote novo. Nenhuma publicação até revisão autorizada.

V7, domínio, DNS e configuração Vercel não foram alterados nesta análise.

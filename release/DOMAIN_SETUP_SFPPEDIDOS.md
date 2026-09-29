# Configuração do domínio `sfppedidos.app` no Vercel

## Estado atual

`sfppedidos.app` foi definido no código como a origem oficial planejada do aplicativo, com `www.sfppedidos.app` como origem opcional. O domínio não está disponível para compra no Vercel, o que é compatível com um domínio já registrado fora do Vercel. O preview WebDev continua em staging e nenhum DNS foi alterado por esta sessão.

O conector Vercel está autenticado, mas retornou **zero equipes e zero projetos listáveis**. Portanto, ainda não há como identificar com segurança o projeto que deve hospedar o SFP-OS nem obter os registros DNS específicos.

## O que precisa ser informado

Forneça pelo menos uma destas combinações, sem enviar segredo em chat:

| Opção | Dados necessários |
|---|---|
| Projeto já existente | `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` e confirmação de que o projeto é o SFP-OS. |
| Conta/equipe | Nome ou slug da equipe Vercel onde `sfppedidos.app` está registrado e autorização para listar o projeto. |
| CLI local | `VERCEL_TOKEN` inserido como segredo local, além de `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`. Nunca commitá-lo ou colocá-lo em argumento permanente. |

## Procedimento no painel Vercel

1. Abrir o projeto Vercel que realmente hospedará o Commerce Core.
2. Em **Settings → Domains**, adicionar `sfppedidos.app`.
3. Adicionar `www.sfppedidos.app` somente se o redirecionamento/host alternativo for desejado.
4. Copiar exatamente os registros A, CNAME ou TXT exibidos pelo próprio projeto. Os valores são específicos do projeto e não devem ser inferidos.
5. Aplicar os registros no DNS autoritativo do registrador do domínio, preservando MX, SPF, DKIM e DMARC existentes.
6. Aguardar propagação e confirmar certificado TLS emitido pelo Vercel.
7. Configurar no ambiente de produção, somente após os gates comerciais:

```text
APP_RELEASE_CHANNEL=production
APP_TENANT_SLUG=<tenant-operacional-aprovado>
APP_CANONICAL_ORIGIN=https://sfppedidos.app
APP_ALLOWED_ORIGINS=https://sfppedidos.app,https://www.sfppedidos.app
APP_ALLOW_PERSISTENCE=true
```

8. Configurar `VITE_RELEASE_CHANNEL=production` e `VITE_PUBLIC_ORIGIN=https://sfppedidos.app` somente na build de produção aprovada.
9. Revalidar OAuth, cookies, CORS, CSP, callback WhatsApp, Control Tower, backup/restore e smoke test no host final.

## Guardrails

A associação do domínio, o certificado TLS e o deploy Vercel não aprovam automaticamente catálogo, pagamentos, logística, WhatsApp ou campanhas. O guard server-side deve continuar bloqueando fixtures `TESTE-*` e referências `RED/blocked` até que cada SKU tenha custo, estoque, lote, validade, fornecedor, foto, impostos, logística e preço aprovados.

Não use IP ou CNAME de outro deployment. Não altere Registro.br sem os valores exibidos pelo projeto Vercel correto. Não altere `APP_RELEASE_CHANNEL` para `production` apenas porque o domínio resolve.

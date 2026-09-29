# V8 Homologação — Auditoria e integração controlada

## Status executivo

A V8 anexada foi auditada e preservada como uma evolução visual sobre a V7. O pacote contém uma vitrine pública estática com catálogo, consultor, Seafood Boil e fechamento por WhatsApp; um painel administrativo demonstrativo com pedidos, cozinha, logística, CRM, financeiro e comissões; documentação operacional; fotos em WebP; e um Reel.

A V8 **não substituiu** a base SFP-OS. O backend atual, as regras server-side, o tenant staging, a política Cabral, o bloqueio de integrações legadas e os guards de catálogo continuam sendo a fonte de verdade operacional. A V8 foi incorporada de modo reversível em três camadas: assets visuais leves em `client/public/assets/v8/`, referência documental em `release/v8-homologacao-reference/` e este registro de auditoria.

## O que foi incorporado

Os banners, o logo e os assets de produtos foram copiados para o frontend como acervo visual versionado. Eles podem ser usados em futuras telas do catálogo sem depender de URLs externas. A vitrine atual continua usando o catálogo server-side existente; nenhum preço, custo, estoque, comissão ou SKU V8 foi promovido automaticamente para venda.

O HTML público e o painel administrativo V8 foram mantidos como referências de homologação, não como rotas públicas da aplicação. Isso evita duplicação de autenticação, bypass de RBAC e mistura entre dados fictícios e pedidos reais.

## O que foi explicitamente preservado como bloqueio

A própria V8 declara que o painel não recebe pedidos reais e depende de backend, banco de dados, autenticação 2FA e integrações oficiais. Portanto, não foram importados tokens, números de WhatsApp, webhooks, n8n, Z-API, VPN, VPS, credenciais de pagamento ou segredos.

Os produtos da V8 permanecem em estado visual/referencial até que cada SKU tenha custo posto, estoque, lote, validade, fornecedor, impostos, logística, disponibilidade, preço autorizado e foto vinculada. Essa regra protege a integridade do investidor e impede que uma homologação visual seja interpretada como catálogo comercial auditado.

## Validação realizada

A base SFP-OS foi validada após a integração: `pnpm check` passou; a suíte Vitest passou com 25 arquivos e 57 testes; `pnpm build` passou; os assets foram verificados por tamanho e presença; e o pacote Vercel foi reconstruído sem `node_modules`, `dist`, `.git` ou arquivos `.env`.

## Entrega ao investidor

O investidor deve receber o pacote Vercel principal, este relatório de integração, o pacote de campanha e o checksum. A publicação pública, o domínio, as variáveis privadas e a promoção para produção continuam dependentes de ações no painel Vercel e de validação do responsável. Nenhuma dessas ações é declarada como executada nesta auditoria.

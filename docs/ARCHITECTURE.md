# Seafoods Premium OS — Arquitetura

## Conclusão executiva

O produto atual é um SaaS WebDev fullstack em modo preview. A interface é uma aplicação React com Tailwind, o servidor usa Express e tRPC, a persistência foi modelada com Drizzle para MySQL/TiDB e a autenticação usa Manus OAuth. O sistema está funcional para demonstração e validação de fluxo, mas o WhatsApp e o fechamento de vendas ainda são simulados.

## Componentes

| Componente | Status | Tecnologia | Localização | Entradas | Saídas | Pendências |
|---|---|---|---|---|---|---|
| Dashboard | Implementado | React 19, TypeScript, Tailwind | `client/src/pages/Home.tsx` | Resumo tRPC, estado local | Métricas, tabela, cards e ações | Separar páginas de Estoque, Vendas e CRM |
| Layout | Implementado | React, shadcn/ui Sidebar | `client/src/components/DashboardLayout.tsx` | Usuário Manus, rota | Navegação, auth gate, sidebar | RBAC granular |
| API | Implementado | Express, tRPC 11, Zod | `server/routers.ts` | Inputs tipados | Queries e mutations | Versionamento e contratos públicos |
| Banco | Estruturado | Drizzle ORM, MySQL/TiDB | `drizzle/schema.ts`, `server/db.ts` | Entidades de negócio | Tabelas e queries | FKs, índices de consulta e transações completas |
| WhatsApp | Simulado | tRPC query + React state | `server/routers.ts`, `client/src/components/WhatsAppSimulator.tsx` | Cenário `kit` ou `camarao` | Mensagem normalizada e venda local | Webhook oficial e persistência |
| Hormozi Offer | Implementado como coach | React, estado local | `client/src/components/HormoziPlaybook.tsx` | Ticket atual, add-ons, confiança | Ticket potencial, script e recomendações | Ligar ao catálogo real e registrar conversão |
| Auditoria | Estruturada | Drizzle `auditLogs` | `drizzle/schema.ts`, `server/db.ts` | Actor, ação, entidade | Registro de auditoria | Aplicar a todos os fluxos reais |

## Frontend

A aplicação usa React 19, TypeScript, Vite e Tailwind CSS 4. Os componentes de interface seguem shadcn/ui e Radix. A rota funcional atual é `/`. A navegação apresenta caminhos visuais para `/estoque`, `/vendas`, `/inteligencia`, `/seguranca` e `/configuracoes`, mas essas subpáginas ainda estão pendentes e caem no fallback de rota.

A interface é responsiva por composição de grid, sidebar colapsável e breakpoint mobile. O dashboard pode iniciar em modo demo para permitir validação sem login. Em uma operação real, as gravações devem exigir autenticação e autorização no servidor.

## Backend

O servidor é Express com tRPC. As rotas atuais são:

- `auth.me`: consulta pública da sessão atual.
- `auth.logout`: limpa a sessão.
- `dashboard.summary`: resumo operacional com fallback demo.
- `sales.playbook`: dados públicos dos playbooks Truth Mode, Financial Analysis e Hormozi.
- `whatsapp.simulateInbound`: fixture de mensagem simulada.
- `inventory.createMovement`: gravação protegida de movimentação.
- `sales.create`: gravação protegida de venda.

Não há webhook HTTP público específico de WhatsApp neste checkpoint.

## Segurança e autoridade

O frontend é uma interface e não é fonte confiável para preço, estoque, pagamento, autenticação ou permissões. Os procedimentos de gravação usam `protectedProcedure`. Credenciais do servidor são obtidas por variáveis de ambiente. A margem e o custo interno aparecem em componentes internos do painel; não devem ser expostos em storefront público ou mensagens de cliente.

## Deploy e ambientes

O projeto `seafoods-premium-saas` está em `/home/ubuntu/seafoods-premium-saas`. O preview verificado é o endereço WebDev informado no checkpoint `895be7e3`. A plataforma de produção customizada, domínio oficial e pipeline de deploy externo estão **NÃO VERIFICADO**. O servidor local usa `NODE_ENV=development` e `tsx watch server/_core/index.ts`.

## Evolução alvo

`Catálogo → Vendas → Cliente → Pedidos → CRM → WhatsApp → Sales MCP → Hormozi → Marketing MCP → Automações → Control Tower → SaaS`.

Os módulos Consultor, Seafood Boil, Acervo SFP, Fotos Reais, ProductPoster, Offer Hero e PromoFlyer permanecem congelados conforme o handoff. O Seafood Boil não deve ser alterado neste ciclo.

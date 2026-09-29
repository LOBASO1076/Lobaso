# SEAFOODS PREMIUM OS — MASTER V10

Pacote de validação e deploy Vercel.

## Regras comerciais protegidas
- B2B: referência de custo +18%.
- B2C: referência de custo +40% (regra comercial; catálogo real permanece sujeito ao guard de liberação).
- Desconto operacional máximo: 5%.
- Custos e margens são dados administrativos restritos e não devem ser expostos ao cliente ou a agentes.
- Alteração de parâmetros críticos exige autenticação administrativa forte e confirmação adicional no backend; não armazenar códigos de segurança em frontend, prompts ou ZIP.

## Identidade
- Interface pública/operacional usa “Representações”, sem nome de fornecedor.
- Logo Seafoods Premium incluída em `client/public/seafoods-premium-logo.png`.

## Segurança
- Integrações legadas n8n/Z-API permanecem tombstonadas/bloqueadas conforme a base recebida.
- WhatsApp real continua dependente de credenciais Meta oficiais e smoke test antes de habilitar outbound.

## Vercel
1. Importar a pasta/ZIP como projeto.
2. Configurar somente as variáveis necessárias usando `docs/ENVIRONMENT.example`; nunca subir secrets no código.
3. Executar primeiro Preview.
4. Validar login, catálogo, checkout, B2B, APIs, logs e banco.
5. Somente então promover o mesmo artefato para Production.

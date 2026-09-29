#!/usr/bin/env bash
set -euo pipefail

# Deploy controlado do SFP-OS no projeto Vercel correto.
# Nunca coloque tokens ou valores de secrets neste arquivo.

: "${VERCEL_TOKEN:?Defina VERCEL_TOKEN no ambiente local, nunca em arquivo ou argumento fixo.}"
: "${VERCEL_ORG_ID:?Defina VERCEL_ORG_ID com o ID/slug da equipe ou conta Vercel.}"
: "${VERCEL_PROJECT_ID:?Defina VERCEL_PROJECT_ID com o projeto SFP-OS correto.}"

MODE="${1:-preview}"
case "$MODE" in
  staging|preview) ENVIRONMENT="preview"; DEPLOY_FLAGS=(--prebuilt) ;;
  production|prod) ENVIRONMENT="production"; DEPLOY_FLAGS=(--prebuilt --prod) ;;
  *)
    echo "Uso: VERCEL_TOKEN=... VERCEL_ORG_ID=... VERCEL_PROJECT_ID=... $0 [preview|production]" >&2
    exit 2
    ;;
esac

if [[ "$ENVIRONMENT" == "production" ]]; then
  : "${CONFIRM_PRODUCTION_DEPLOY:?Para produção, defina CONFIRM_PRODUCTION_DEPLOY=SEAFOODS_PRODUCTION_APPROVED.}"
  [[ "$CONFIRM_PRODUCTION_DEPLOY" == "SEAFOODS_PRODUCTION_APPROVED" ]] || {
    echo "Confirmação de produção inválida." >&2
    exit 2
  }
  : "${APP_CANONICAL_ORIGIN:?Defina a origem HTTPS final aprovada.}"
  : "${APP_ALLOWED_ORIGINS:?Defina a allowlist exata de origens.}"
  : "${APP_TENANT_SLUG:?Defina o tenant operacional aprovado.}"
  [[ "${APP_ALLOW_PERSISTENCE:-false}" == "true" ]] || {
    echo "APP_ALLOW_PERSISTENCE deve ser true para produção aprovada." >&2
    exit 2
  }
  [[ "$APP_CANONICAL_ORIGIN" == "https://pedidos.sfppedidos.app" ]] || {
    echo "APP_CANONICAL_ORIGIN deve ser https://pedidos.sfppedidos.app neste release." >&2
    exit 2
  }
fi

# Vincula o checkout local ao projeto informado. Não cria nem escolhe outro projeto.
npx --yes vercel@59.22.0 link \
  --yes \
  --project="$VERCEL_PROJECT_ID" \
  --team="$VERCEL_ORG_ID" \
  --token="$VERCEL_TOKEN"

# Obtém variáveis do ambiente escolhido e gera o output serverless localmente.
npx --yes vercel@59.22.0 pull \
  --yes \
  --environment="$ENVIRONMENT" \
  --scope="$VERCEL_ORG_ID" \
  --token="$VERCEL_TOKEN"

if [[ "$ENVIRONMENT" == "production" ]]; then
  npx --yes vercel@59.22.0 build --prod --scope="$VERCEL_ORG_ID" --token="$VERCEL_TOKEN"
else
  npx --yes vercel@59.22.0 build --scope="$VERCEL_ORG_ID" --token="$VERCEL_TOKEN"
fi

npx --yes vercel@59.22.0 deploy \
  "${DEPLOY_FLAGS[@]}" \
  --scope="$VERCEL_ORG_ID" \
  --token="$VERCEL_TOKEN"

echo "Deploy concluído no projeto $VERCEL_PROJECT_ID, ambiente $ENVIRONMENT."
echo "Configure e verifique pedidos.sfppedidos.app apenas em Vercel > Project > Settings > Domains."

#!/usr/bin/env bash
# Provision quote-form P0 secrets on Vercel + Cloudflare Turnstile.
# Requires authenticated CLIs:
#   npx vercel whoami
#   npx wrangler whoami
#
# Usage (from repo root):
#   ./scripts/configure-quote-security.sh
#
# Secrets are never printed. Values are piped into `vercel env add`.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PROJECT_NAME="thrundesigns-com"
TEAM_SCOPE="reckhouses-projects"
WIDGET_NAME="thrundesigns-quote"
DOMAINS=(
  "thrundesigns-com.vercel.app"
  "thrundesigns-com-reckhouses-projects.vercel.app"
  "localhost"
  "127.0.0.1"
)

log() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

need_cmd openssl
need_cmd jq
need_cmd npx

log "Checking Vercel CLI auth"
npx vercel whoami >/dev/null || die "run: npx vercel login"

log "Checking Wrangler auth"
npx wrangler whoami >/dev/null || die "run: npx wrangler login"

if [[ ! -f .vercel/project.json ]]; then
  log "Linking Vercel project ${PROJECT_NAME}"
  npx vercel link --yes --scope "$TEAM_SCOPE" --project "$PROJECT_NAME"
fi

add_env() {
  local key="$1"
  local value="$2"
  local sensitive_flag=()
  if [[ "${3:-}" == "sensitive" ]]; then
    sensitive_flag=(--sensitive)
  fi
  # Remove existing values so re-runs are idempotent.
  npx vercel env rm "$key" production --yes >/dev/null 2>&1 || true
  npx vercel env rm "$key" preview --yes >/dev/null 2>&1 || true
  npx vercel env rm "$key" development --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | npx vercel env add "$key" production preview development \
    "${sensitive_flag[@]}" --force >/dev/null
  log "Set ${key}"
}

log "Creating Cloudflare Turnstile widget (${WIDGET_NAME})"
domain_flags=()
for d in "${DOMAINS[@]}"; do
  domain_flags+=(--domain "$d")
done

# Capture JSON once; never echo the secret.
WIDGET_JSON="$(
  WRANGLER_WRITE_LOGS=false WRANGLER_LOG=error WRANGLER_LOG_SANITIZE=true \
    npx wrangler turnstile widget create "$WIDGET_NAME" \
      "${domain_flags[@]}" \
      --mode managed \
      --json
)"
SITEKEY="$(printf '%s' "$WIDGET_JSON" | jq -r '.sitekey // .siteKey // empty')"
SECRET="$(printf '%s' "$WIDGET_JSON" | jq -r '.secret // .secret_key // .secretKey // empty')"
unset WIDGET_JSON

[[ -n "$SITEKEY" && "$SITEKEY" != "null" ]] || die "Turnstile sitekey missing from wrangler response"
[[ -n "$SECRET" && "$SECRET" != "null" ]] || die "Turnstile secret missing from wrangler response"
log "Turnstile sitekey: ${SITEKEY}"

QUOTE_FORM_SECRET="$(openssl rand -base64 32)"

add_env "NEXT_PUBLIC_TURNSTILE_SITE_KEY" "$SITEKEY"
add_env "TURNSTILE_SECRET_KEY" "$SECRET" sensitive
add_env "QUOTE_FORM_SECRET" "$QUOTE_FORM_SECRET" sensitive
unset SECRET QUOTE_FORM_SECRET

log "Installing Upstash Redis via Vercel Marketplace (if not already connected)"
if npx vercel integration add upstash --yes 2>/dev/null; then
  log "Upstash integration add completed"
else
  log "Upstash integration add needs dashboard confirmation — open with: npx vercel integration open upstash"
fi

log "Pulling env to .env.local (keeps existing unrelated keys)"
npx vercel env pull .env.local --yes >/dev/null

# Prefer canonical UPSTASH_* names; mirror marketplace KV_* if present.
if ! grep -q '^UPSTASH_REDIS_REST_URL=' .env.local 2>/dev/null; then
  if grep -q '^KV_REST_API_URL=' .env.local 2>/dev/null; then
    kv_url="$(grep '^KV_REST_API_URL=' .env.local | head -1 | cut -d= -f2-)"
    kv_token="$(grep '^KV_REST_API_TOKEN=' .env.local | head -1 | cut -d= -f2-)"
    if [[ -n "$kv_url" && -n "$kv_token" ]]; then
      add_env "UPSTASH_REDIS_REST_URL" "$kv_url" sensitive
      add_env "UPSTASH_REDIS_REST_TOKEN" "$kv_token" sensitive
      npx vercel env pull .env.local --yes >/dev/null
      log "Mirrored KV_REST_API_* → UPSTASH_REDIS_REST_*"
    fi
  fi
fi

log "Staging Vercel Firewall rate-limit rule for POST /api/quote"
npx vercel firewall rules add "Quote API rate limit" \
  --condition '{"type":"path","op":"eq","value":"/api/quote"}' \
  --condition '{"type":"method","op":"eq","value":"POST"}' \
  --action rate_limit \
  --rate-limit-window 600 \
  --rate-limit-requests 3 \
  --rate-limit-keys ip \
  --rate-limit-action log \
  --yes || log "Firewall rule add skipped (may already exist or plan-limited)"

log "Publishing staged firewall changes"
npx vercel firewall publish --yes || log "Firewall publish skipped — publish from dashboard if needed"

log "Done. Redeploy production so new env vars take effect:"
printf '  npx vercel --prod --yes\n'
printf '  # or merge PR / redeploy from the Vercel dashboard\n'

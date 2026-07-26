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

TMPDIR_SECURE="$(mktemp -d)"
chmod 700 "$TMPDIR_SECURE"
cleanup() {
  rm -rf "$TMPDIR_SECURE"
}
trap cleanup EXIT

log "Checking Vercel CLI auth"
npx vercel whoami >/dev/null || die "run: npx vercel login"

log "Checking Wrangler auth"
npx wrangler whoami >/dev/null || die "run: npx wrangler login"

if [[ ! -f .vercel/project.json ]]; then
  log "Linking Vercel project ${PROJECT_NAME}"
  npx vercel link --yes --scope "$TEAM_SCOPE" --project "$PROJECT_NAME"
fi

add_env() {
  # Usage: add_env KEY VALUE [public|sensitive]
  # - public: all envs, --no-sensitive (for NEXT_PUBLIC_*)
  # - sensitive (default): Production+Preview as sensitive; Development as non-sensitive
  local key="$1"
  local value="$2"
  local kind="${3:-sensitive}"
  local out

  npx vercel env rm "$key" production --yes >/dev/null 2>&1 || true
  npx vercel env rm "$key" preview --yes >/dev/null 2>&1 || true
  npx vercel env rm "$key" development --yes >/dev/null 2>&1 || true

  run_add() {
    local targets="$1"
    shift
    out="$(printf '%s' "$value" | npx vercel env add "$key" "$targets" "$@" --force --yes 2>&1)" || {
      printf '%s\n' "$out" >&2
      die "vercel env add failed for ${key} (${targets})"
    }
    if printf '%s' "$out" | jq -e '.status == "error"' >/dev/null 2>&1; then
      printf '%s\n' "$out" >&2
      die "vercel env add rejected ${key} (${targets})"
    fi
  }

  if [[ "$kind" == "public" ]]; then
    run_add "production,preview,development" --no-sensitive
  else
    run_add "production,preview" --sensitive
    run_add "development" --no-sensitive
  fi
  log "Set ${key}"
}

extract_json_object() {
  # Prefer a pure JSON file; fall back to first {...} block.
  local file="$1"
  if jq -e 'type == "object" or type == "array"' "$file" >/dev/null 2>&1; then
    cat "$file"
    return 0
  fi
  python3 - "$file" <<'PY'
import pathlib, re, sys
text = pathlib.Path(sys.argv[1]).read_text()
match = re.search(r"\{[\s\S]*\}|\[[\s\S]*\]", text)
if not match:
    raise SystemExit("no JSON found")
sys.stdout.write(match.group(0))
PY
}

resolve_turnstile_widget() {
  local list_file="$TMPDIR_SECURE/widgets.json"
  local create_file="$TMPDIR_SECURE/create.json"
  local get_file="$TMPDIR_SECURE/widget.json"

  # Do NOT set WRANGLER_LOG_SANITIZE=true here — it redacts JSON that contains secrets.
  npx wrangler turnstile widget list --json >"$list_file"

  SITEKEY="$(
    extract_json_object "$list_file" | jq -r --arg name "$WIDGET_NAME" '
      [.[] | select(.name == $name)]
      | sort_by((.domains // []) | length)
      | reverse
      | .[0].sitekey // empty
    '
  )"

  if [[ -z "$SITEKEY" || "$SITEKEY" == "null" ]]; then
    log "Creating Cloudflare Turnstile widget (${WIDGET_NAME})"
    domain_flags=()
    for d in "${DOMAINS[@]}"; do
      domain_flags+=(--domain "$d")
    done
    npx wrangler turnstile widget create "$WIDGET_NAME" \
      "${domain_flags[@]}" \
      --mode managed \
      --json >"$create_file"
    SITEKEY="$(extract_json_object "$create_file" | jq -r '.sitekey // empty')"
  else
    log "Reusing existing Turnstile widget (${WIDGET_NAME})"
  fi

  [[ -n "$SITEKEY" && "$SITEKEY" != "null" ]] || die "Turnstile sitekey missing from wrangler response"
  log "Turnstile sitekey: ${SITEKEY}"

  # Always fetch via `get` so we have the secret, even when create JSON was incomplete.
  npx wrangler turnstile widget get "$SITEKEY" --json >"$get_file"
  SECRET="$(extract_json_object "$get_file" | jq -r '.secret // .secret_key // .secretKey // empty')"
  [[ -n "$SECRET" && "$SECRET" != "null" ]] || die "Turnstile secret missing from wrangler response"

  # Ensure required domains are registered on the chosen widget.
  local missing=()
  for d in "${DOMAINS[@]}"; do
    if ! extract_json_object "$get_file" | jq -e --arg d "$d" '.domains | index($d) != null' >/dev/null; then
      missing+=("$d")
    fi
  done
  if ((${#missing[@]} > 0)); then
    log "Updating widget domains: ${missing[*]}"
    domain_flags=()
    for d in "${DOMAINS[@]}"; do
      domain_flags+=(--domain "$d")
    done
    npx wrangler turnstile widget update "$SITEKEY" "${domain_flags[@]}" --json >"$get_file"
    SECRET="$(extract_json_object "$get_file" | jq -r '.secret // .secret_key // .secretKey // empty')"
    [[ -n "$SECRET" && "$SECRET" != "null" ]] || {
      npx wrangler turnstile widget get "$SITEKEY" --json >"$get_file"
      SECRET="$(extract_json_object "$get_file" | jq -r '.secret // .secret_key // .secretKey // empty')"
    }
    [[ -n "$SECRET" && "$SECRET" != "null" ]] || die "Turnstile secret missing after domain update"
  fi
}

resolve_turnstile_widget

QUOTE_FORM_SECRET="$(openssl rand -base64 32)"

add_env "NEXT_PUBLIC_TURNSTILE_SITE_KEY" "$SITEKEY" public
add_env "TURNSTILE_SECRET_KEY" "$SECRET" sensitive
add_env "QUOTE_FORM_SECRET" "$QUOTE_FORM_SECRET" sensitive
unset SECRET QUOTE_FORM_SECRET

log "Installing Upstash Redis (upstash/upstash-kv) via Vercel Marketplace"
upstash_out="$(
  npx vercel integration add upstash/upstash-kv \
    --name thrundesigns-quote-kv \
    -e production -e preview -e development \
    --format=json 2>&1 || true
)"
if printf '%s' "$upstash_out" | jq -e '.status == "action_required"' >/dev/null 2>&1; then
  terms_uri="$(printf '%s' "$upstash_out" | jq -r '.verification_uri // empty')"
  log "Upstash needs marketplace terms acceptance (human, interactive):"
  printf '  1) Open: %s\n' "${terms_uri:-https://vercel.com/reckhouses-projects/~/integrations/accept-terms/upstash?source=cli}"
  printf '  2) Or run: npx vercel integration accept-terms upstash\n'
  printf '  3) Retry:  npx vercel integration add upstash/upstash-kv --name thrundesigns-quote-kv\n'
elif printf '%s' "$upstash_out" | jq -e '.status == "error"' >/dev/null 2>&1; then
  log "Upstash install reported an error — see output above; rate limits still fall back in-memory"
  printf '%s\n' "$upstash_out" >&2
else
  log "Upstash integration add completed"
fi

log "Pulling env to .env.local"
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

log "Ensuring Vercel Firewall rate-limit rule for POST /api/quote (P1 challenge enforce)"
if npx vercel firewall rules inspect "Quote API rate limit" >/dev/null 2>&1; then
  npx vercel firewall rules edit "Quote API rate limit" \
    --action rate_limit \
    --rate-limit-window 600 \
    --rate-limit-requests 3 \
    --rate-limit-keys ip \
    --rate-limit-algo fixed_window \
    --rate-limit-action challenge \
    --description "P1 enforce: challenge when POST /api/quote exceeds 3/10m by IP" \
    --yes || log "Firewall rule edit skipped"
else
  npx vercel firewall rules add "Quote API rate limit" \
    --condition '{"type":"path","op":"eq","value":"/api/quote"}' \
    --condition '{"type":"method","op":"eq","value":"POST"}' \
    --action rate_limit \
    --rate-limit-window 600 \
    --rate-limit-requests 3 \
    --rate-limit-keys ip \
    --rate-limit-action challenge \
    --description "P1 enforce: challenge when POST /api/quote exceeds 3/10m by IP" \
    --yes || log "Firewall rule add skipped (may already exist or plan-limited)"
fi

log "Publishing staged firewall changes"
npx vercel firewall publish --yes || log "Firewall publish skipped — publish from dashboard if needed"

log "Installing Resend (resend/resend-email) via Vercel Marketplace (P2 notify)"
resend_out="$(
  npx vercel integration add resend/resend-email \
    --name thrundesigns-quote-mail \
    -e production -e preview -e development \
    --format=json 2>&1 || true
)"
if printf '%s' "$resend_out" | jq -e '.status == "action_required"' >/dev/null 2>&1; then
  terms_uri="$(printf '%s' "$resend_out" | jq -r '.verification_uri // empty')"
  log "Resend needs marketplace terms acceptance (human, interactive):"
  printf '  1) Open: %s\n' "${terms_uri:-https://vercel.com/reckhouses-projects/~/integrations/accept-terms/resend?source=cli}"
  printf '  2) Retry:  npx vercel integration add resend/resend-email --name thrundesigns-quote-mail\n'
elif printf '%s' "$resend_out" | jq -e '.status == "error"' >/dev/null 2>&1; then
  log "Resend install reported an error — set RESEND_API_KEY manually if needed"
  printf '%s\n' "$resend_out" >&2
else
  log "Resend integration add completed"
fi

if [[ -z "${QUOTE_NOTIFY_TO:-}" ]]; then
  log "QUOTE_NOTIFY_TO not set in this shell — add manually:"
  printf '  printf \"you@example.com\" | npx vercel env add QUOTE_NOTIFY_TO production,preview,development --force --yes\n'
else
  add_env "QUOTE_NOTIFY_TO" "$QUOTE_NOTIFY_TO" sensitive
fi

if [[ -n "${QUOTE_NOTIFY_FROM:-}" ]]; then
  add_env "QUOTE_NOTIFY_FROM" "$QUOTE_NOTIFY_FROM" sensitive
fi

log "Pulling env to .env.local (post-Resend)"
npx vercel env pull .env.local --yes >/dev/null

log "Done. Redeploy production so new env vars take effect:"
printf '  npx vercel --prod --yes\n'
printf '  # or merge PR / redeploy from the Vercel dashboard\n'
printf '  # Ensure private Blob QUOTE_READ_WRITE_TOKEN is connected for attachments\n'

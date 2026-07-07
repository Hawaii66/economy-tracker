#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <dev|prod> <convex|web> [args...]"
  echo ""
  echo "Examples:"
  echo "  $0 dev convex              # convex dev (watcher)"
  echo "  $0 prod convex deploy"
  echo "  $0 dev web                   # tanstack web dev server"
  echo "  $0 prod web preview          # tanstack web preview"
}

if [ "$#" -lt 2 ]; then
  usage
  exit 1
fi

ENVIRONMENT="$1"
SERVICE="$2"
shift 2

if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
  usage
  exit 1
fi

if [[ "$SERVICE" != "convex" && "$SERVICE" != "web" ]]; then
  usage
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONVEX_DIR="$ROOT_DIR/apps/convex"
WEB_DIR="$ROOT_DIR/apps/web"
DOPPLER_PROJECT="${DOPPLER_PROJECT:-economy-tracker}"

ensure_doppler() {
  if ! command -v doppler >/dev/null 2>&1; then
    echo "[economy-tracker] Doppler CLI required. Install: https://docs.doppler.com/docs/install-cli"
    exit 1
  fi
}

if [ -z "${ECONOMY_TRACKER_DOPPLER_LOADED:-}" ]; then
  ensure_doppler
  export ECONOMY_TRACKER_DOPPLER_LOADED=1
  exec doppler run --project "$DOPPLER_PROJECT" --config "$ENVIRONMENT" -- "$0" "$ENVIRONMENT" "$SERVICE" "$@"
fi

economy_tracker_pnpm() {
  if [[ -n "${MSYSTEM:-}" ]] && command -v pnpm.cmd >/dev/null 2>&1; then
    pnpm.cmd "$@"
    return
  fi
  if command -v pnpm >/dev/null 2>&1; then
    local pnpm_bin
    pnpm_bin="$(command -v pnpm)"
    case "$pnpm_bin" in
      *[\\/]AppData[\\/]Local[\\/]pnpm[\\/]pnpm)
        if command -v pnpm.cmd >/dev/null 2>&1; then
          pnpm.cmd "$@"
        else
          npx pnpm@10.12.1 "$@"
        fi
        ;;
      *) pnpm "$@" ;;
    esac
    return
  fi
  if command -v pnpm.cmd >/dev/null 2>&1; then
    pnpm.cmd "$@"
    return
  fi
  npx pnpm@10.12.1 "$@"
}

SERVICE_PID=""

cleanup() {
  if [ -n "${SERVICE_PID:-}" ] && kill -0 "${SERVICE_PID}" 2>/dev/null; then
    kill "${SERVICE_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

start_convex() {
  if [ -z "${CONVEX_DEPLOYMENT:-}" ]; then
    echo "[economy-tracker] Missing CONVEX_DEPLOYMENT in Doppler config '${ENVIRONMENT}'"
    echo "[economy-tracker] Set it to the deployment name from Convex dashboard (Settings → Deployment name)."
    exit 1
  fi

  local args=("$@")
  if [ "${#args[@]}" -eq 0 ]; then
    args=("dev")
  fi

  echo "[economy-tracker] convex deployment=${CONVEX_DEPLOYMENT} env=${ENVIRONMENT}"
  echo "[economy-tracker] building budget-core..."
  (cd "$ROOT_DIR" && economy_tracker_pnpm --filter budget-core build)
  (cd "$CONVEX_DIR" && economy_tracker_pnpm exec convex "${args[@]}") &
  SERVICE_PID="$!"
}

start_web() {
  if [ -z "${VITE_CONVEX_URL:-}" ] && [ -n "${CONVEX_URL:-}" ]; then
    export VITE_CONVEX_URL="$CONVEX_URL"
  fi

  if [ -z "${VITE_CONVEX_URL:-}" ]; then
    echo "[economy-tracker] Missing VITE_CONVEX_URL (or CONVEX_URL) in Doppler config '${ENVIRONMENT}'"
    exit 1
  fi

  local args=("$@")
  if [ "${#args[@]}" -eq 0 ]; then
    args=("dev")
  fi

  echo "[economy-tracker] web env=${ENVIRONMENT}"
  (cd "$WEB_DIR" && economy_tracker_pnpm "${args[@]}") &
  SERVICE_PID="$!"
}

case "$SERVICE" in
  convex) start_convex "$@" ;;
  web) start_web "$@" ;;
esac

wait "$SERVICE_PID"

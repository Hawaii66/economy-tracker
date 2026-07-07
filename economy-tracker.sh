#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <dev|prod> convex [args...]"
  echo ""
  echo "Examples:"
  echo "  $0 dev convex              # convex dev (watcher)"
  echo "  $0 prod convex deploy"
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

if [[ "$SERVICE" != "convex" ]]; then
  usage
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONVEX_DIR="$ROOT_DIR/apps/convex"
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

if [ -z "${CONVEX_DEPLOYMENT:-}" ]; then
  echo "[economy-tracker] Missing CONVEX_DEPLOYMENT in Doppler config '${ENVIRONMENT}'"
  echo "[economy-tracker] Set it to the deployment name from Convex dashboard (Settings → Deployment name)."
  exit 1
fi

CONVEX_PID=""

cleanup() {
  if [ -n "${CONVEX_PID:-}" ] && kill -0 "${CONVEX_PID}" 2>/dev/null; then
    kill "${CONVEX_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

start_convex() {
  local args=("$@")
  if [ "${#args[@]}" -eq 0 ]; then
    args=("dev")
  fi

  echo "[economy-tracker] convex deployment=${CONVEX_DEPLOYMENT} env=${ENVIRONMENT}"
  (cd "$CONVEX_DIR" && economy_tracker_pnpm exec convex "${args[@]}") &
  CONVEX_PID="$!"
}

start_convex "$@"
wait "$CONVEX_PID"

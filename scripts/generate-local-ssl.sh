#!/usr/bin/env bash
# File: generate_local_certs.sh
# Purpose: Generate local SSL certs via mkcert for dev usage
# Usage: ./generate_local_certs.sh domain1.local domain2.local ...
# Example: ./generate_local_certs.sh inventory.lgticm.local

set -euo pipefail
IFS=$'\n\t'

# ------------ CONFIGURATION ------------
# Target directory for local certs
LOCAL_SSL_DIR="./backend/nginx/ssl"

# ------------ FUNCTIONS ------------
usage() {
  echo "Usage: $0 <dev-domain1> [dev-domain2 ...]"
  echo "Example: $0 inventory.lgticm.local api.lgticm.local"
  exit 1
}

# Ensure mkcert is installed
check_mkcert() {
  if ! command -v mkcert &> /dev/null; then
    echo "ERROR: mkcert not found. Please install mkcert (https://github.com/FiloSottile/mkcert)." >&2
    exit 2
  fi
}

# Prepare directory
prepare_dir() {
  mkdir -p "${LOCAL_SSL_DIR}"
}

# Generate with mkcert
run_mkcert() {
  local domains=("$@")
  echo "Installing local CA (if needed)..."
  mkcert -install

  echo "Generating local certs for: ${domains[*]}"
  mkcert -key-file "${LOCAL_SSL_DIR}/key.pem" \
         -cert-file "${LOCAL_SSL_DIR}/cert.pem" \
         "${domains[@]}"

  echo "✅ Local certificates available in ${LOCAL_SSL_DIR}"
}

# ------------ MAIN ------------
if [[ $# -lt 1 ]]; then
  usage
fi

check_mkcert
prepare_dir
run_mkcert "$@"
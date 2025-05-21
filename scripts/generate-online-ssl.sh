#!/usr/bin/env bash
# File: generate_production_certs.sh
# Purpose: Obtain or renew Let's Encrypt certificates via Dockerized Certbot
# Usage: ./generate_production_certs.sh domain1.com domain2.com ...
# Example: ./generate_production_certs.sh domain.com www.domain.com api.domain.com

set -euo pipefail
IFS=$'\n\t'

# ------------ CONFIGURATION ------------
# Docker image to use for Certbot
CERTBOT_IMAGE="certbot/certbot:v3.1.0"

# Paths on host (relative to project root)
SSL_DIR="./backend/nginx/ssl"
LOG_DIR="./backend/certbot/logs"
NGINX_CONF_DIR="./backend/nginx/config"

# Certbot flags
CHALLENGE="http"
CERTBOT_STANDALONE_ARGS=(certonly --standalone --preferred-challenges ${CHALLENGE})

# ------------ FUNCTIONS ------------
usage() {
  echo "Usage: $0 <domain1> [domain2 ...]"
  echo "Example: $0 example.com www.example.com api.example.com"
  exit 1
}

# Ensure Docker is installed
check_docker() {
  if ! command -v docker &> /dev/null; then
    echo "ERROR: docker command not found. Please install Docker." >&2
    exit 2
  fi
}

# Create required directories
prepare_dirs() {
  mkdir -p "${SSL_DIR}" "${LOG_DIR}"
}

# Run certbot container
run_certbot() {
  local domains=("$@")
  local domain_args=()
  for d in "${domains[@]}"; do
    domain_args+=( -d "$d" )
  done

  echo "Pulling latest Certbot image..."
  docker pull "${CERTBOT_IMAGE}"

  echo "Requesting certificates for: ${domains[*]}"
  docker run --rm --user root \
    -v "${SSL_DIR}:/etc/letsencrypt" \
    -v "${NGINX_CONF_DIR}:/etc/nginx/conf.d:ro" \
    -v "${LOG_DIR}:/var/log/letsencrypt" \
    -p 80:80 \
    --name certbot \
    "${CERTBOT_IMAGE}" \
    "${CERTBOT_STANDALONE_ARGS[@]}" \
    "${domain_args[@]}"

  echo "✅ Certificates generated/renewed in ${SSL_DIR}"
}

# ------------ MAIN ------------
if [[ $# -lt 1 ]]; then
  usage
fi

check_docker
prepare_dirs
run_certbot "$@"
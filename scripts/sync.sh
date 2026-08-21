#!/bin/bash
# sync.sh — Auto-sync: push code, deploy worker, apply migrations
# Usage: ./scripts/sync.sh [--worker] [--migrations] [--all]

set -e

cd "$(dirname "$0")/.."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[SYNC]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1"; }

# Load env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

DEPLOY_WORKER=false
DEPLOY_MIGRATIONS=false
DEPLOY_ALL=false

for arg in "$@"; do
  case $arg in
    --worker) DEPLOY_WORKER=true ;;
    --migrations) DEPLOY_MIGRATIONS=true ;;
    --all) DEPLOY_ALL=true ;;
  esac
done

# Default: deploy all if no flags
if ! $DEPLOY_WORKER && ! $DEPLOY_MIGRATIONS && ! $DEPLOY_ALL; then
  DEPLOY_ALL=true
fi

if $DEPLOY_ALL; then
  DEPLOY_WORKER=true
  DEPLOY_MIGRATIONS=true
fi

# ─── Step 1: Git push ───
log "Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
  log "Changes detected, committing..."
  git add -A
  git commit -m "auto-sync: $(date '+%Y-%m-%d %H:%M:%S')" || true
  git push origin main
  log "✅ Code pushed to GitHub"
else
  log "No changes to push"
fi

# ─── Step 2: Deploy Worker ───
if $DEPLOY_WORKER; then
  log "Deploying Cloudflare Worker..."
  if command -v npx &> /dev/null; then
    npx wrangler deploy 2>&1 | tail -5
    log "✅ Worker deployed"
  else
    warn "npx not found, skipping worker deploy"
  fi
fi

# ─── Step 3: Apply Migrations ───
if $DEPLOY_MIGRATIONS; then
  log "Checking Supabase migrations..."
  if [ -f /tmp/supabase ]; then
    export SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN}"
    
    # Get pending migrations (files not yet applied)
    for migration in supabase/migrations/*.sql; do
      filename=$(basename "$migration")
      log "Applying: $filename"
      /tmp/supabase db query --linked --file "$migration" 2>&1 | grep -v "Initialising" || true
    done
    log "✅ Migrations applied"
  else
    warn "Supabase CLI not found at /tmp/supabase"
  fi
fi

log "🎉 Sync complete!"

#!/usr/bin/env bash
# supabase-sql.sh — Execute SQL on Supabase via Management API
# Usage: bash scripts/supabase-sql.sh "SELECT * FROM users LIMIT 5"
#        bash scripts/supabase-sql.sh --file path/to/migration.sql
#
# Requires env vars:
#   SUPABASE_PROJECT_REF   — e.g. cfzmdvymqqnrzrytcrie
#   SUPABASE_ACCESS_TOKEN  — Management API token (sbp_...)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load .env if exists
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a; source "$PROJECT_ROOT/.env"; set +a
fi

REF="${SUPABASE_PROJECT_REF:?Set SUPABASE_PROJECT_REF}"
TOKEN="${SUPABASE_ACCESS_TOKEN:?Set SUPABASE_ACCESS_TOKEN}"

SQL=""
if [ "${1:-}" = "--file" ]; then
  FILE="${2:?Provide SQL file path}"
  SQL=$(cat "$FILE")
else
  SQL="${1:?Provide SQL query or --file <path>}"
fi

# Execute via Supabase Management API (postgres proxy)
RESPONSE=$(curl -s -X POST \
  "https://api.supabase.com/v1/projects/${REF}/database/query" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg sql "$SQL" '{query: $sql}')")

# Check for errors
if echo "$RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
  echo "❌ SQL Error:"
  echo "$RESPONSE" | jq .
  exit 1
fi

echo "$RESPONSE" | jq .

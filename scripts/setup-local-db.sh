#!/usr/bin/env bash
set -euo pipefail

echo "==> SiteBoss local Postgres setup"

# Find psql
if ! command -v psql >/dev/null 2>&1; then
  echo "Error: psql not found. Install Postgres (e.g., brew install postgresql@16)" >&2
  exit 1
fi

# Try to start postgres via Homebrew if not running
if command -v brew >/dev/null 2>&1; then
  if ! pg_isready >/dev/null 2>&1; then
    # Try common service names
    for v in postgresql@17 postgresql@16 postgresql; do
      if brew services list | awk '{print $1}' | grep -q "^${v}$"; then
        echo "-> Starting ${v} via brew services"
        brew services start "$v" || true
        sleep 2
        break
      fi
    done
  fi
fi

DB_NAME=${DB_NAME:-siteboss}
DB_USER=${DB_USER:-postgres}

echo "-> Ensuring database '${DB_NAME}' exists"
if ! psql -U "$DB_USER" -lqt 2>/dev/null | cut -d '|' -f 1 | grep -qw "$DB_NAME"; then
  createdb -U "$DB_USER" "$DB_NAME"
  echo "   created database ${DB_NAME}"
else
  echo "   database ${DB_NAME} already exists"
fi

apply_sql() {
  local file=$1
  if [ -f "$file" ]; then
    echo "-> Applying schema: $file"
    psql -U "$DB_USER" -d "$DB_NAME" -f "$file" >/dev/null
  fi
}

apply_sql "backend/src/database/schema.sql"
apply_sql "backend/src/database/enhanced_schema.sql"

echo "✅ Postgres is ready and schemas are applied."
echo "Next:"
echo "  1) Start API:   cd backend && npm run dev (listens on 3001)"
echo "  2) Start CRA:   cd frontend && npm start  (http://localhost:3000)"
echo "     CRA default API URL: http://localhost:3001/api"


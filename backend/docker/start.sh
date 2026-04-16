#!/bin/sh
set -eu

PORT="${PORT:-8080}"

echo "Starting LinkEdu backend on port ${PORT}"

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache || true

DB_CONNECTION="${DB_CONNECTION:-sqlite}"

if [ "$DB_CONNECTION" = "sqlite" ]; then
  SQLITE_DB="${DB_DATABASE:-database/database.sqlite}"
  case "$SQLITE_DB" in
    /*) SQLITE_PATH="$SQLITE_DB" ;;
    *) SQLITE_PATH="/var/www/html/$SQLITE_DB" ;;
  esac

  echo "Using SQLite database at ${SQLITE_PATH}"
  mkdir -p "$(dirname "$SQLITE_PATH")"
  touch "$SQLITE_PATH"
  chmod ug+rw "$SQLITE_PATH" || true
  export DB_DATABASE="$SQLITE_PATH"
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  if [ "$DB_CONNECTION" != "sqlite" ] && [ -n "${DB_HOST:-}" ]; then
    echo "Waiting for database ${DB_HOST}:${DB_PORT:-5432}"
    retries=30
    until nc -z "${DB_HOST}" "${DB_PORT:-5432}" >/dev/null 2>&1 || [ "$retries" -eq 0 ]; do
      retries=$((retries - 1))
      sleep 2
    done
  fi

  echo "Running database migrations"
  php artisan migrate --force || echo "Migration failed at startup. Continuing to keep container running."
fi

php artisan storage:link || true

exec php artisan serve --host=0.0.0.0 --port="${PORT}"

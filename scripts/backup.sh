#!/bin/sh
# Nightly Postgres backup for the production docker-compose.yml stack.
# Usage: run from the project root, e.g. via a cron entry:
#   0 2 * * * cd /path/to/cogwebsite && ./scripts/backup.sh >> /var/log/cogwebsite-backup.log 2>&1
set -eu

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

docker compose exec -T postgres pg_dump -U payload cogwebsite | gzip \
  > "$BACKUP_DIR/cogwebsite_${TIMESTAMP}.sql.gz"

# Delete backups older than RETENTION_DAYS. Copy the resulting files
# somewhere off this host too (e.g. rclone/rsync to remote storage) —
# a backup that lives only on the server it's backing up isn't a real
# safety net.
find "$BACKUP_DIR" -name 'cogwebsite_*.sql.gz' -mtime "+$RETENTION_DAYS" -delete

echo "Backup complete: $BACKUP_DIR/cogwebsite_${TIMESTAMP}.sql.gz"

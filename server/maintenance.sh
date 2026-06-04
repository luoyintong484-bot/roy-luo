#!/bin/bash
# ============================================================
# R7 Fortune — Auto Maintenance Script
# Runs daily at 3AM via crontab: 0 3 * * * /path/to/maintenance.sh
# ============================================================

LOG_DIR="/var/log/r7fortune"
LOG_FILE="$LOG_DIR/maintenance_$(date +%Y%m%d).log"
BACKUP_DIR="/var/backups/r7fortune"
SITE_DIR="/www/wwwroot/r7fortune"

mkdir -p "$LOG_DIR" "$BACKUP_DIR"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

# ---- 1. Pre-update backup ----
log "=== START MAINTENANCE ==="
log "Creating pre-update backup..."
tar -czf "$BACKUP_DIR/pre_update_$(date +%Y%m%d_%H%M).tar.gz" \
  --exclude='node_modules' --exclude='dist' --exclude='.git' \
  "$SITE_DIR" 2>/dev/null && log "Backup OK" || log "Backup FAILED"

# ---- 2. Security patches (system + panel) ----
log "Checking system security patches..."
if command -v apt &>/dev/null; then
  apt update -qq && apt list --upgradable 2>/dev/null | grep -i security | head -5 >> "$LOG_FILE"
elif command -v yum &>/dev/null; then
  yum check-update --security 2>/dev/null | head -5 >> "$LOG_FILE"
fi

# Baota panel update (safe)
if [ -f /etc/init.d/bt ]; then
  log "Baota panel detected — checking updates..."
  /etc/init.d/bt status >> "$LOG_FILE" 2>&1
fi

# ---- 3. Node.js / PHP minor security updates ----
log "Checking runtime security patches..."
node -v >> "$LOG_FILE" 2>&1
php -v 2>/dev/null | head -1 >> "$LOG_FILE"

# npm security audit (report only, no auto-fix)
if [ -f "$SITE_DIR/package.json" ]; then
  cd "$SITE_DIR"
  npm audit --json 2>/dev/null | grep -E '"severity":"(high|critical)"' | head -10 >> "$LOG_FILE"
fi

# ---- 4. Service health check + auto-restart ----
check_service() {
  local name=$1
  local cmd=$2
  local restart=$3
  if ! pgrep -f "$cmd" > /dev/null; then
    log "WARN: $name is DOWN — attempting restart..."
    eval "$restart" >> "$LOG_FILE" 2>&1
    sleep 3
    if pgrep -f "$cmd" > /dev/null; then
      log "OK: $name restarted successfully"
    else
      log "CRITICAL: $name restart FAILED — manual intervention required"
    fi
  fi
}

check_service "Nginx" "nginx" "systemctl restart nginx"
check_service "MySQL" "mysqld" "systemctl restart mysqld"
check_service "PHP-FPM" "php-fpm" "systemctl restart php-fpm"
check_service "Node/Vite" "vite" "cd $SITE_DIR && npm run dev &"

# ---- 5. Port check ----
for port in 80 443 3000 3306; do
  if ! netstat -tlnp 2>/dev/null | grep -q ":$port "; then
    log "WARN: Port $port not listening"
  fi
done

# ---- 6. Clean old logs (keep 30 days) ----
find "$LOG_DIR" -name "*.log" -mtime +30 -delete

log "=== MAINTENANCE COMPLETE ==="
exit 0

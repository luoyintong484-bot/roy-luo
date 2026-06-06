#!/bin/bash
# ============================================================
# R7 Fortune — Service Monitor
# Run every 5 min via crontab: */5 * * * * /path/to/monitor.sh
# ============================================================
LOG_DIR="/var/log/r7fortune"
LOG_FILE="$LOG_DIR/monitor_$(date +%Y%m%d).log"
SITE_DIR="/www/wwwroot/r7fortune"
mkdir -p "$LOG_DIR"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"; }

# Check site response
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
if [ "$HTTP_CODE" != "200" ]; then
  log "ALERT: Site returned $HTTP_CODE — attempting restart"
  cd "$SITE_DIR" && npm run dev & >> "$LOG_FILE" 2>&1
  sleep 3
  HTTP_RETRY=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null)
  if [ "$HTTP_RETRY" = "200" ]; then
    log "RECOVERED: Site back to 200"
  else
    log "CRITICAL: Site still down after restart — returned $HTTP_RETRY"
  fi
fi

# DB connection check
mysql -u r7fortune -p'emehWLnCzETK63Ry' -e "SELECT 1" r7fortune >> /dev/null 2>&1
if [ $? -ne 0 ]; then
  log "ALERT: Database connection failed"
fi

exit 0

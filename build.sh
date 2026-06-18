#!/bin/bash
# Cloudflare Pages Build-Script
# Generiert config.js aus Environment Variables (nie in git committen)
cat > config.js << EOF
window.FH_CONFIG = {
  webhookUrl: '${WEBHOOK_URL}',
  webhookSecret: '${WEBHOOK_SECRET}'
};
EOF
echo "config.js generiert."

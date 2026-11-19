#!/bin/zsh
set -o pipefail

ROOT="/Users/dxm/.lark-channel-workspaces/codex/default/xhs-credit-dashboard"
URL_FILE="$ROOT/data/public-url.txt"
CHAT_ID="oc_0c7efaa8ad28cb693396d904cce804fd"

/usr/bin/ssh -T -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -o ExitOnForwardFailure=yes -R 80:127.0.0.1:4173 localhost.run 2>&1 | while IFS= read -r line; do
  print -r -- "$line"
  url=$(print -r -- "$line" | /usr/bin/grep -Eo 'https://[a-zA-Z0-9.-]+\.(lhr\.life|localhost\.run)' | /usr/bin/head -1)
  if [[ -n "$url" ]]; then
    old_url=$(cat "$URL_FILE" 2>/dev/null || true)
    if [[ "$url" != "$old_url" ]]; then
      print -r -- "$url" > "$URL_FILE"
      /Users/dxm/.forceclaw/npm-global/bin/lark-cli im +messages-send --as bot --chat-id "$CHAT_ID" --text "在线交互版网址已更新：$url\n原因：当前使用免费临时隧道，服务重连时地址可能轮换。稳定查看版仍是：https://ilay1991.github.io/xhs-credit-dashboard/" >/dev/null 2>&1 || true
    fi
  fi
done

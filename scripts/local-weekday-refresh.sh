#!/bin/zsh
set -euo pipefail

REPO="/Users/dxm/.lark-channel-workspaces/codex/default/xhs-credit-dashboard"
NODE="/Applications/Force Claw.app/Contents/Resources/forceclaw-runtime/bin/node"
SSH_KEY="/Users/dxm/.lark-channel-workspaces/codex/default/.tools/xhs_github_ed25519"

cd "$REPO"
"$NODE" scripts/collect-once.mjs
"$NODE" scripts/collect-search-suggestions.mjs
"$NODE" scripts/build-pages.mjs
/usr/bin/git add -f data/store.json
/usr/bin/git add public/note-covers docs/note-covers public/search-demand.json public/爆款分析工作台.html docs/index.html
if ! /usr/bin/git diff --cached --quiet; then
  /usr/bin/git commit -m "Automated local weekday refresh"
  GIT_SSH_COMMAND="ssh -i $SSH_KEY -o IdentitiesOnly=yes" /usr/bin/git push
fi

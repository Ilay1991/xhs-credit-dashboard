#!/bin/zsh
set -euo pipefail

project_dir="${0:A:h:h}"
label="com.xhs-credit-dashboard"
target="$HOME/Library/LaunchAgents/$label.plist"

mkdir -p "$HOME/Library/LaunchAgents"
cp "$project_dir/$label.plist" "$target"
launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$target"
launchctl enable "gui/$(id -u)/$label"
launchctl kickstart -k "gui/$(id -u)/$label"
echo "Installed: $label"

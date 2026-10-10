#!/usr/bin/env bash
# Create an isolated workspace for one agent: its own branch, folder and dev port.
# Usage: scripts/new-worktree.sh <name>
set -euo pipefail
name="${1:?usage: scripts/new-worktree.sh <name>}"
main="$(git rev-parse --show-toplevel)"
dir="$(dirname "$main")/senseai-hacks-worktrees/$name"
branch="agent/$name"

if [ -e "$dir" ]; then echo "Already exists: $dir"; exit 1; fi
git -C "$main" worktree add -b "$branch" "$dir" main

# Base44 app link is gitignored; each worktree needs a copy to run `base44 dev`.
cp "$main/base44/.app.jsonc" "$dir/base44/.app.jsonc"

# Pick the first free backend port from 4401 up (main folder uses 4400).
port=4401
while grep -qx "$port" "$main"/../senseai-hacks-worktrees/*/.dev-port 2>/dev/null; do port=$((port + 1)); done
echo "$port" > "$dir/.dev-port"

(cd "$dir" && npm install --silent)
echo
echo "Worktree ready"
echo "  folder: $dir"
echo "  branch: $branch"
echo "  dev:    cd $dir && npm run dev:wt   (backend port $port)"
